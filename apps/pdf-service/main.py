from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
import pikepdf
import json
import io
import logging
from typing import List, Dict, Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pdf_service")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class EditOperation:
    def __init__(self, data: dict):
        self.page_index = data.get("pageIndex", 0)
        self.original_text = data.get("originalText", "")
        self.new_text = data.get("newText", "")


def get_raw_bytes(obj) -> bytes:
    if isinstance(obj, pikepdf.String):
        return bytes(obj)
    elif isinstance(obj, bytes):
        return obj
    return str(obj).encode('latin-1')


def decode_for_match(raw: bytes) -> str:
    try:
        return raw.decode('latin-1')
    except:
        return raw.decode('utf-8', errors='replace')


def get_font_width_map(font_obj) -> Dict[int, int]:
    """
    Extracts char_code -> width map from a PDF Font object.
    """
    try:
        if "/Widths" not in font_obj:
            return {}
        
        widths = font_obj["/Widths"]
        first_char = font_obj.get("/FirstChar", 0)
        # last_char = font_obj.get("/LastChar", 255)
        
        width_map = {}
        for i, w in enumerate(widths):
            char_code = first_char + i
            width_map[char_code] = w
            
        return width_map
    except Exception as e:
        logger.warning(f"Failed to extract resource widths: {e}")
        return {}


def calculate_text_width_in_units(text: str, width_map: Dict[int, int]) -> float:
    """
    Calculates total width of text using the font's width map.
    Assumes standard encoding (Latin-1/ASCII) for simplicity as a start.
    """
    total_width = 0.0
    # Fallback width if char not found (avg of typical digits ~500-600)
    fallback = 500.0 
    
    # Try getting space width for fallback
    if 32 in width_map:
        fallback = width_map[32]
        
    for char in text:
        # We assume 1-byte encoding for now (common in simple numeric fields)
        # If text is unicode/complex, this might need mapping via ToUnicode or Encoding
        try:
            code = ord(char)
            # If char is not in map (e.g. out of range), use fallback
            w = width_map.get(code, fallback)
            total_width += w
        except:
            total_width += fallback
            
    return total_width


def process_stream_and_shift(page, stream_obj, edit_map: Dict[str, EditOperation], font_resources):
    """
    Parses stream, finds text, calculates shift using extracted font metrics, and edits.
    """
    try:
        instructions = pikepdf.parse_content_stream(stream_obj)
        new_instructions = []
        modified = False
        
        # Track current state
        current_font_name = None
        current_font_size = 10.0
        current_font_widths = {}
        
        # Cache for looking up font resources
        font_cache = {}

        for i, (operands, operator) in enumerate(instructions):
            op_name = str(operator)
            
            # 1. Track Font Changes: /F1 12 Tf
            if op_name == "Tf" and len(operands) >= 2:
                current_font_name = str(operands[0]) # e.g. /F1
                try:
                    current_font_size = float(operands[1])
                    
                    # Look up width table for this font
                    if current_font_name not in font_cache:
                        if font_resources and current_font_name in font_resources:
                            font_obj = font_resources[current_font_name]
                            font_cache[current_font_name] = get_font_width_map(font_obj)
                        else:
                            font_cache[current_font_name] = {}
                    
                    current_font_widths = font_cache[current_font_name]
                    
                except Exception as e:
                    logger.warning(f"Error parsing Tf: {e}")

            # 2. Handle Text Showing: Tj, TJ, ', "
            # We normalize everything to a simple Tj for replacement
            text_ops = ["Tj", "TJ", "'", '"']
            if op_name in text_ops:
                decoded_text = ""
                
                # Extract text based on operator type
                if op_name == "Tj" and len(operands) > 0:
                     decoded_text = decode_for_match(get_raw_bytes(operands[0]))
                elif op_name == "TJ" and len(operands) > 0:
                    # TJ takes an array of strings and numbers [ (A) 10 (B) ]
                    # We rebuild the string ignoring the numbers (kerning)
                    raw_acc = b""
                    if isinstance(operands[0], pikepdf.Array):
                        for item in operands[0]:
                            if isinstance(item, pikepdf.String) or isinstance(item, bytes):
                                raw_acc += get_raw_bytes(item)
                    decoded_text = decode_for_match(raw_acc)
                elif op_name == "'" and len(operands) > 0:
                    decoded_text = decode_for_match(get_raw_bytes(operands[0]))
                elif op_name == '"' and len(operands) >= 3:
                     # " takes aw, ac, string. Text is the 3rd operand (index 2)
                    decoded_text = decode_for_match(get_raw_bytes(operands[2]))

                decoded_text = decoded_text.strip()
                
                if decoded_text in edit_map:
                    edit_op = edit_map[decoded_text]
                    
                    # --- CALCULATE EXACT SHIFT ---
                    old_w_units = calculate_text_width_in_units(edit_op.original_text, current_font_widths)
                    new_w_units = calculate_text_width_in_units(edit_op.new_text, current_font_widths)
                    diff_units = new_w_units - old_w_units
                    shift_amount = (diff_units / 1000.0) * current_font_size
                    
                    logger.info(f"MATCH ({op_name}): '{decoded_text}' -> '{edit_op.new_text}'")
                    logger.info(f"  Shift: {shift_amount:.4f} pt")
                    
                    # --- APPLY SHIFT TO PREVIOUS POSITIONING OPERATOR ---
                    found_pos = False
                    
                    # Look backwards for positioning
                    for j in range(len(new_instructions) - 1, -1, -1):
                        prev_ops, prev_op = new_instructions[j]
                        prev_op_str = str(prev_op)
                        
                        if prev_op_str in ["Td", "TD"]:
                            # Explicit move: Adjust X
                            old_tx = float(prev_ops[0])
                            old_ty = float(prev_ops[1])
                            new_instructions[j] = ([old_tx - shift_amount, old_ty], prev_op)
                            found_pos = True
                            break
                        
                        elif prev_op_str == "Tm":
                            # Matrix move: Adjust e (index 4)
                            if len(prev_ops) >= 6:
                                floats = [float(x) for x in prev_ops]
                                floats[4] -= shift_amount
                                new_instructions[j] = (floats, prev_op)
                                found_pos = True
                                break
                                
                        elif prev_op_str == "T*":
                            # Newline (move down, reset x to 0 relative).
                            # Can't modify T*, must insert Td(shift, 0) AFTER it.
                            # Since we are modifying 'new_instructions', we insert at j+1
                            # NOTE: Left shift = negative x. 
                            # If we want to move left (because text got wider), we apply negative shift.
                            # new_x = 0 - shift_amount
                            new_instructions.insert(j + 1, ([-shift_amount, 0], pikepdf.Operator("Td")))
                            found_pos = True
                            break

                        elif prev_op_str in ["BT"]: 
                            break
                    
                    if not found_pos:
                        # If no positioning found (e.g. right at start of BT, or implicit flow),
                        # Insert Td immediately before this text op.
                        # However, we are appending the text op later.
                        # So we append Td to new_instructions NOW.
                        logger.info("No pos op found, inserting Td before text.")
                        new_instructions.append(([-shift_amount, 0], pikepdf.Operator("Td")))

                    # --- REPLACE TEXT CONTENT ---
                    # We normalize everything to 'Tj' for simplicity.
                    # This avoids handling ' and " side-effects (like modifying leading) because 
                    # we likely want to keep the line behavior same.
                    # ACTUALLY: ' and " imply a MoveToNextLine. 
                    # If we change ' to Tj, we LOSE the newline.
                    # So if op was ' or ", we must output T* and then Tj.
                    
                    new_bytes = edit_op.new_text.encode('latin-1', errors='replace')
                    new_string_op = pikepdf.String(new_bytes)
                    
                    if op_name == "'":
                        # ' equals T* string Tj
                        new_instructions.append(([], pikepdf.Operator("T*")))
                        new_instructions.append(([new_string_op], pikepdf.Operator("Tj")))
                    elif op_name == '"':
                        # " equals aw ac T* string Tj ... complicated.
                        # It sets spacing too.
                        # For safety, let's keep it simply T* Tj assuming spacing isn't critical or we set it manually?
                        # Or just use " with new text? " takes 3 args.
                        # Let's preserve the operator if possible, or decompose.
                        # Simplest: T* Tj.
                         new_instructions.append(([], pikepdf.Operator("T*")))
                         new_instructions.append(([new_string_op], pikepdf.Operator("Tj")))
                    else:
                        # Tj or TJ -> Tj
                        new_instructions.append(([new_string_op], pikepdf.Operator("Tj")))
                        
                    modified = True
                    continue 

            new_instructions.append((operands, operator))

        if modified:
            new_content_stream = pikepdf.unparse_content_stream(new_instructions)
            stream_obj.write(new_content_stream)
            return True
        return False
    except Exception as e:
        logger.error(f"Error processing stream: {e}")
        return False


@app.post("/edit")
async def edit_pdf(
    file: UploadFile = File(...),
    edits: str = Form(...),
    password: Optional[str] = Form(None)
):
    try:
        try:
            edit_data = json.loads(edits)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in 'edits'")

        # Group edits by page
        edits_by_page = {}
        for item in edit_data:
            page_idx = item.get('pageIndex', 0)
            if page_idx not in edits_by_page:
                edits_by_page[page_idx] = []
            edits_by_page[page_idx].append(EditOperation(item))

        # Open PDF
        pdf_bytes = await file.read()
        try:
            pdf = pikepdf.open(io.BytesIO(pdf_bytes), password=password or "")
        except:
            raise HTTPException(status_code=400, detail="Invalid PDF or password")

        total_edits = 0
        
        for page_idx, ops in edits_by_page.items():
            if page_idx >= len(pdf.pages):
                continue
                
            page = pdf.pages[page_idx]
            
            # Map for quick lookup
            edit_map = {op.original_text.strip(): op for op in ops}
            
            # Get Font Resources for this page
            font_resources = {}
            if "/Resources" in page and "/Font" in page["/Resources"]:
                font_resources = page["/Resources"]["/Font"]
            
            # Process Contents (might be array or single stream)
            contents = page.Contents
            if isinstance(contents, pikepdf.Array):
                for i in range(len(contents)):
                    if process_stream_and_shift(page, contents[i], edit_map, font_resources):
                        total_edits += 1
            else:
                if process_stream_and_shift(page, contents, edit_map, font_resources):
                    total_edits += 1

        output = io.BytesIO()
        pdf.save(output, compress_streams=False) # Keep streams uncompressed for debugging if needed
        pdf_bytes_out = output.getvalue()
        
        logger.info(f"Processed {total_edits} edits using Exact Width Calculation")
        
        return Response(content=pdf_bytes_out, media_type="application/pdf")

    except Exception as e:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail=str(e))



    except Exception as e:
        logger.error(f"HTML conversion error: {str(e)}")
        # Return 500 with detail
        return Response(
            content=json.dumps({"error": str(e)}),
            status_code=500,
            media_type="application/json"
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3002)
