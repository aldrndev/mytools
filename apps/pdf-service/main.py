"""
PDF Editing Microservice - Content Stream Modification V14
Approach: Td Operator Wrapper.
Shifts cursor LEFT using 'Td' before drawing text to achieve Right Alignment.
Restores cursor RIGHT using 'Td' after to maintain stream integrity.
"""
import io
import json
from typing import List, Optional, Set, Dict
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import pikepdf
from pikepdf import Pdf

app = FastAPI(title="PDF Editor Service", version="14.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EditOperation:
    def __init__(self, data: dict):
        self.page_index = data.get("pageIndex", 0)
        self.original_text = data.get("originalText", "")
        self.new_text = data.get("newText", "")
        self.font_size = data.get("fontSize", 10.0)
        self.x = data.get("x", 0)
        self.y = data.get("y", 0)
        self.width = data.get("width", 0.0) # Original text width in PDF points
        self.match_index = data.get("matchIndex", 0)  # Which occurrence to replace


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


def replace_preserving_encoding(original_bytes: bytes, old_text: str, new_text: str) -> Optional[bytes]:
    decoded = decode_for_match(original_bytes)
    if old_text not in decoded:
        return None
    try:
        old_bytes = old_text.encode('latin-1')
        new_bytes = new_text.encode('latin-1')
        byte_start = original_bytes.find(old_bytes)
        if byte_start != -1:
            return (
                original_bytes[:byte_start] +
                new_bytes +
                original_bytes[byte_start + len(old_bytes):]
            )
    except:
        pass
    return None




def calculate_visual_shift(old_text: str, new_text: str, font_size: float, original_width: float = 0.0) -> float:
    """
    Calculate visual shift to maintain RIGHT alignment.
    Uses correction factor to account for variable character widths.
    """
    diff_chars = len(new_text) - len(old_text)
    
    if diff_chars == 0:
        return 0.0
    
    # Correction factor: 1.0 = full shift based on avg char width
    CORRECTION_FACTOR = 1.0
    
    if original_width > 0 and len(old_text) > 0:
        avg_char_width = original_width / len(old_text)
        shift_points = diff_chars * avg_char_width * CORRECTION_FACTOR
        print(f"Shift: diff={diff_chars}, avgWidth={avg_char_width:.2f}pt, factor={CORRECTION_FACTOR}, shift={shift_points:.2f}pt")
    else:
        char_width_em = 0.45
        shift_points = diff_chars * char_width_em * font_size * CORRECTION_FACTOR
        print(f"Shift (fallback): diff={diff_chars}, shift={shift_points:.2f}pt")
    
    return shift_points


def replace_text_in_content_stream(
    pdf,
    page,
    ops: List[EditOperation]
) -> bool:
    """
    Replace text using wrapper Td (Move) operators.
    Uses Y-coordinate matching for precise duplicate handling.
    """
    modified = False
    
    # Get page height for Y-coordinate conversion
    # pdfjs sends canvas Y (from top), pikepdf tracks PDF Y (from bottom)
    page_height = 0.0
    try:
        media_box = page.MediaBox
        page_height = float(media_box[3]) - float(media_box[1])
    except:
        page_height = 800.0  # Fallback
        
    print(f"Page height: {page_height}")
    
    # Diagnostic: collect all text found on this page
    all_texts_found = []
    
    # Create map: original_text -> List[EditOperation]
    edit_map: Dict[str, List[EditOperation]] = {}
    for op in ops:
        if op.original_text and op.new_text:
            if op.original_text not in edit_map:
                edit_map[op.original_text] = []
            edit_map[op.original_text].append(op)
            # Debug: print what we're looking for
            print(f"Looking for '{op.original_text}' -> '{op.new_text}' at canvas_y={op.y:.1f}")
    
    # Track which edits have been applied (by id)
    applied_edits: Set[int] = set()
    
    # Track current text position (Y coordinate in PDF space - from bottom)
    current_y = 0.0
    
    # Y-tolerance for matching (in points)
    Y_TOLERANCE = 15.0

    try:
        instructions = pikepdf.parse_content_stream(page)
        new_instructions = []
        text_op_count = 0  # Count text operators found
        
        for operands, operator in instructions:
            op_name = str(operator)
            
            # Track text matrix (Tm sets absolute position)
            if op_name == "Tm" and len(operands) >= 6:
                try:
                    current_y = float(operands[5])  # f in [a b c d e f]
                except:
                    pass
                # Always add Tm to output
                new_instructions.append((operands, operator))
            
            # Track text position move (Td adds to position)
            elif op_name == "Td" and len(operands) >= 2:
                try:
                    current_y += float(operands[1])  # ty in (tx, ty)
                except:
                    pass
                # Always add Td to output
                new_instructions.append((operands, operator))
            
            # Handle Tj (show text)
            elif op_name == "Tj":
                text_op_count += 1
                if operands and len(operands) >= 1:
                    raw = get_raw_bytes(operands[0])
                    text = decode_for_match(raw)
                    # Collect for diagnostics
                    if text.strip():
                        all_texts_found.append(text)
                    new_raw = raw
                    replaced_this = False
                    shift_val = 0.0
                    found_op = None
                    
                    # Check each edit target
                    for old_txt, op_list in edit_map.items():
                        if old_txt in text:
                            # Find edit that matches by Y-coordinate
                            for op in op_list:
                                edit_key = id(op)
                                if edit_key not in applied_edits:
                                    # Convert canvas Y (from top) to PDF Y (from bottom)
                                    # pdfjs sends: op.y = canvas Y (distance from top)
                                    # pikepdf tracks: current_y = PDF Y (distance from bottom)
                                    # So: pdf_y ≈ page_height - canvas_y
                                    expected_pdf_y = page_height - op.y
                                    y_diff = abs(current_y - expected_pdf_y)
                                    
                                    # Debug: show Y comparison
                                    print(f"  FOUND '{old_txt}' -> current_y={current_y:.1f}, expected={expected_pdf_y:.1f}, diff={y_diff:.1f}")
                                    
                                    if y_diff < Y_TOLERANCE:
                                        result = replace_preserving_encoding(new_raw, old_txt, op.new_text)
                                        if result:
                                            new_raw = result
                                            applied_edits.add(edit_key)
                                            replaced_this = True
                                            modified = True
                                            found_op = op
                                            print(f"Y-matched '{old_txt}' at pdf_y={current_y:.1f} (expected={expected_pdf_y:.1f}, diff={y_diff:.1f}) -> '{op.new_text}'")
                                            break
                            if found_op:
                                break
                    
                    # FALLBACK: If Y-matching failed but text was found, use first unapplied edit
                    if not replaced_this:
                        for old_txt, op_list in edit_map.items():
                            if old_txt in text:
                                for op in op_list:
                                    edit_key = id(op)
                                    if edit_key not in applied_edits:
                                        result = replace_preserving_encoding(new_raw, old_txt, op.new_text)
                                        if result:
                                            new_raw = result
                                            applied_edits.add(edit_key)
                                            replaced_this = True
                                            modified = True
                                            found_op = op
                                            print(f"FALLBACK matched '{old_txt}' -> '{op.new_text}' (Y-matching failed)")
                                            break
                                if found_op:
                                    break
                    
                    if replaced_this and found_op:
                        # Calculate shift needed for right alignment
                        shift_val = calculate_visual_shift(found_op.original_text, found_op.new_text, found_op.font_size, found_op.width)
                        
                        if abs(shift_val) > 0.1:
                            # Use TJ with kerning: [kerning_offset (text)] TJ
                            # PDF spec: positive kerning = move LEFT (subtracted from position)
                            # shift_val positive means text is longer, need to start more left
                            kerning = int(shift_val * 1000 / found_op.font_size)
                            
                            # Create TJ array: [kerning, text]
                            tj_array = pikepdf.Array([kerning, pikepdf.String(new_raw)])
                            new_instructions.append(([tj_array], pikepdf.Operator("TJ")))
                            print(f"TJ kerning: shift={shift_val:.2f}pt, kerning={kerning}, '{found_op.original_text}' -> '{found_op.new_text}'")
                        else:
                            # No shift needed, use simple Tj
                            new_operands = [pikepdf.String(new_raw)]
                            new_instructions.append((new_operands, operator))
                            print(f"Replacing text: '{found_op.original_text}' -> '{found_op.new_text}' (no shift needed)")
                        
                    else:
                        new_instructions.append((operands, operator))
                else:
                    new_instructions.append((operands, operator))
                    
            elif op_name == "TJ":
                text_op_count += 1
                if operands and len(operands) >= 1:
                    arr = operands[0]
                    if isinstance(arr, pikepdf.Array):
                        new_arr = []
                        arr_modified = False
                        total_shift_val = 0.0
                        
                        for item in arr:
                            if isinstance(item, pikepdf.String):
                                raw = get_raw_bytes(item)
                                text = decode_for_match(raw)
                                new_raw = raw
                                current_item_shift = 0.0
                                
                                # Check each edit target
                                for old_txt, op_list in edit_map.items():
                                    if old_txt in text:
                                        # Find edit that matches by Y-coordinate
                                        for op in op_list:
                                            edit_key = id(op)
                                            if edit_key not in applied_edits:
                                                # Convert canvas Y to PDF Y
                                                expected_pdf_y = page_height - op.y
                                                y_diff = abs(current_y - expected_pdf_y)
                                                if y_diff < Y_TOLERANCE:
                                                    result = replace_preserving_encoding(new_raw, old_txt, op.new_text)
                                                    if result:
                                                        new_raw = result
                                                        applied_edits.add(edit_key)
                                                        arr_modified = True
                                                        modified = True
                                                        current_item_shift = calculate_visual_shift(old_txt, op.new_text, op.font_size, op.width)
                                                        total_shift_val += current_item_shift
                                                        print(f"TJ Y-matched '{old_txt}' at pdf_y={current_y:.1f} (expected={expected_pdf_y:.1f}) -> '{op.new_text}'")
                                                        break
                                
                                new_arr.append(pikepdf.String(new_raw))
                            else:
                                new_arr.append(item)
                        
                        if arr_modified:
                            # 1. Shift LEFT
                            new_instructions.append(([-total_shift_val, 0], pikepdf.Operator("Td")))
                            
                            # 2. Modified TJ
                            new_instructions.append(([pikepdf.Array(new_arr)], operator))
                            
                            # 3. Restore RIGHT
                            new_instructions.append(([total_shift_val, 0], pikepdf.Operator("Td")))
                        else:
                            new_instructions.append((operands, operator))
                    else:
                        new_instructions.append((operands, operator))
                else:
                    new_instructions.append((operands, operator))
            else:
                new_instructions.append((operands, operator))
        
        if modified:
            new_stream = pikepdf.unparse_content_stream(new_instructions)
            page.Contents = pdf.make_stream(new_stream)
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Diagnostic: Show what text we found (always if not modified)
    if not modified:
        numeric_texts = [t for t in all_texts_found if any(c.isdigit() for c in t)]
        print(f"DIAGNOSTIC: text_ops={text_op_count}, texts_collected={len(all_texts_found)}, numeric={len(numeric_texts)}")
        if numeric_texts:
            print(f"  Numeric texts found:")
            for t in numeric_texts[:15]:
                print(f"    -> '{t}'")
        else:
            print(f"  NO numeric text found! PDF mungkin pakai CID/Identity-H font.")
    
    return modified


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "pdf-editor-v14-td-wrapper"}


@app.post("/edit")
async def edit_pdf(
    file: UploadFile = File(...),
    edits: str = Form(...),
    password: Optional[str] = Form(None)
):
    try:
        # 1. Parse Edits
        try:
            edit_list = json.loads(edits)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in edits")
            
        operations = [EditOperation(e) for e in edit_list]
        if not operations:
            raise HTTPException(status_code=400, detail="No edits provided")

        # 2. Open PDF
        pdf_content = await file.read()
        try:
            pdf = Pdf.open(io.BytesIO(pdf_content), password=password if password else "")
        except pikepdf.PasswordError:
             raise HTTPException(status_code=400, detail="Password incorrect or required")
        
        # 3. Group Edits by Page
        ops_by_page: Dict[int, List[EditOperation]] = {}
        for op in operations:
             if op.page_index not in ops_by_page:
                 ops_by_page[op.page_index] = []
             ops_by_page[op.page_index].append(op)
        
        # 4. Apply Edits
        total = 0
        for page_idx, ops in ops_by_page.items():
            if page_idx < len(pdf.pages):
                page = pdf.pages[page_idx]
                if replace_text_in_content_stream(pdf, page, ops):
                    total += 1
        
        print(f"Modified {total} pages")
        
        # 5. Save Output
        output = io.BytesIO()
        try:
            # Try saving with original encryption (default)
            pdf.save(output)
        except Exception as e:
            print(f"Save with strict encryption failed: {e}")
            try:
                # Fallback: Try removing encryption
                print("Attempting to save with encryption=False...")
                output = io.BytesIO() # Reset output
                pdf.save(output, encryption=False)
            except Exception as e2:
                print(f"Save fallback failed: {e2}")
                raise e2
        
        pdf.close()
        
        output.seek(0)
        return Response(
            content=output.read(),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=edited.pdf"}
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Python Service Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)
