import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useEditorStore, type TextItem } from "@/stores/editorStore";

// Import worker correctly for Vite
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Set worker to local bundled file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Track loaded fonts globally
const loadedFontFaces = new Set<string>();

interface EditableTextLayerProps {
  pageWidth: number;
  pageHeight: number;
  scale: number;
}

export function EditableTextLayer({
  pageWidth,
  pageHeight,
  scale,
}: EditableTextLayerProps) {
  const {
    document,
    currentPage,
    editingItemId,
    setEditingItemId,
    updateTextItem,
    addLoadedFont,
  } = useEditorStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  const page = document?.pages[currentPage];

  // Load fonts from backend
  useEffect(() => {
    const loadFonts = async () => {
      if (!document?.fonts || !document.id) return;

      for (const [fontId, fontInfo] of Object.entries(document.fonts)) {
        if (loadedFontFaces.has(fontId)) continue;

        try {
          const fontUrl = `/api/pdf/${document.id}/font/${fontId}`;
          const fontFace = new FontFace(fontId, `url(${fontUrl})`);
          await fontFace.load();
          (window.document as any).fonts.add(fontFace);
          loadedFontFaces.add(fontId);
          addLoadedFont(fontId);
          console.log(`Loaded font: ${fontId} (${fontInfo.name})`);
        } catch (err) {
          console.log(`Could not load font ${fontId}:`, err);
        }
      }
    };

    loadFonts();
  }, [document?.id, document?.fonts, addLoadedFont]);

  useEffect(() => {
    if (editingItemId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingItemId]);

  const handleTextClick = (item: TextItem) => {
    setEditingItemId(item.id);
    setInputValue(item.text);
  };

  const handleInputBlur = () => {
    if (editingItemId) {
      updateTextItem(editingItemId, inputValue);
      setEditingItemId(null);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setEditingItemId(null);
    }
  };

  if (!page) return null;

  return (
    <div
      className="text-overlay"
      style={{
        width: pageWidth * scale,
        height: pageHeight * scale,
      }}
    >
      {page.textItems.map((item) => {
        const isEditing = editingItemId === item.id;
        const scaledX = item.x * scale;
        const scaledY = item.y * scale;
        const scaledFontSize = item.fontSize * scale;

        // Original width from backend (stable)
        const originalScaledWidth = item.width * scale;

        // Dynamic width based on current text (for non-numeric display)
        const dynamicScaledWidth = Math.max(
          originalScaledWidth,
          scaledFontSize * item.text.length * 0.6
        );

        const scaledHeight = item.height * scale + 4;

        // Check if ORIGINAL text is numeric (for right alignment)
        // Use originalText if available, otherwise current text
        const textToCheck = item.originalText || item.text;
        const isNumeric =
          /^[\d.,\s]+$/.test(textToCheck.trim()) &&
          textToCheck.trim().length > 0;

        // Calculate right position using ORIGINAL width (stable anchor point)
        const rightPos = pageWidth * scale - (scaledX + originalScaledWidth);

        // For numeric items, use original width to keep right edge stable
        const displayWidth = isNumeric
          ? originalScaledWidth
          : dynamicScaledWidth;

        return (
          <div
            key={item.id}
            className={`text-item ${isEditing ? "editing" : ""} ${
              item.isModified ? "modified" : ""
            }`}
            style={{
              // Conditional positioning: Right align for numbers, Left for others
              ...(isNumeric
                ? {
                    right: rightPos,
                    left: "auto",
                    textAlign: "right",
                  }
                : {
                    left: scaledX,
                    right: "auto",
                    textAlign: "left",
                  }),
              top: scaledY - scaledFontSize,
              fontSize: scaledFontSize,
              // For numeric items: auto width lets content determine size (grows left)
              // Add extra padding-left for modified items to cover original text
              width: isNumeric ? "auto" : displayWidth,
              minWidth: isNumeric ? originalScaledWidth : displayWidth,
              // For modified numeric items, add left padding to cover original text when new text is longer
              paddingLeft:
                isNumeric &&
                item.isModified &&
                item.text.length >
                  (item.originalText?.length || item.text.length)
                  ? `${
                      (item.text.length -
                        (item.originalText?.length || item.text.length)) *
                      scaledFontSize *
                      0.55
                    }px`
                  : 0,
              height: scaledHeight,
              lineHeight: `${scaledHeight}px`,
              backgroundColor:
                item.isModified || isEditing ? "white" : "transparent",

              // If modified, show text in black. If not modified, text is transparent (show canvas).

              // If modified, show text in black. If not modified, text is transparent (show canvas).
              color: item.isModified ? "#000000" : "transparent",

              // "Apa tidak bisa sama?" -> The original font is wider than Arial Narrow.
              // Reverting to standard Arial/Helvetica which has wider glyphs closer to the original.
              fontFamily: loadedFontFaces.has(item.fontName)
                ? `"${item.fontName}", Arial, sans-serif`
                : "Arial, Helvetica, sans-serif",

              // Revert weight/spacing to normal
              fontWeight: item.fontName.toLowerCase().includes("bold")
                ? "bold"
                : "normal",

              letterSpacing: "normal",

              // Show border for modified items to indicate change
              outline: item.isModified
                ? "2px solid rgba(34, 197, 94, 0.6)"
                : "none",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: isNumeric ? "flex-end" : "flex-start",
            }}
            onClick={() => !isEditing && handleTextClick(item)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="edit-input"
                style={{
                  fontSize: "inherit",
                  lineHeight: "inherit",
                  fontFamily: "inherit",
                  fontWeight: "inherit",
                  letterSpacing: "inherit",
                  // Tweak: Use slightly softer black to match PDF antialiasing look
                  color: "#1a1a1a",
                  // Transparent background - original PDF shows through
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "2px",
                  outline: "none",
                  width: isNumeric ? "auto" : "100%", // Allow auto width for right align to let it grow? No, container grows.
                  minWidth: "100%", // Input should fill container
                  textAlign: isNumeric ? "right" : "left",
                  padding: 0, // Reset padding again for standard font
                  margin: 0,
                }}
              />
            ) : (
              <span
                style={{
                  width: "100%",
                  textAlign: isNumeric ? "right" : "left",
                }}
              >
                {item.text}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface PdfViewerProps {
  file: File;
  password?: string | null;
}

export function PdfViewer({ file, password }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  const { currentPage, zoom, document } = useEditorStore();

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Pass password if provided (for protected files)
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          password: password || undefined,
        });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
      } catch (err) {
        console.error("Error loading PDF in viewer:", err);
      }
    };

    loadPdf();
  }, [file, password]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask: pdfjsLib.RenderTask | null = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage + 1);

        if (isCancelled) return;

        const viewport = page.getViewport({ scale: zoom });

        const canvas = canvasRef.current;
        if (!canvas || isCancelled) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // Clear the canvas before rendering
        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        setPageSize({
          width: viewport.width / zoom,
          height: viewport.height / zoom,
        });

        if (isCancelled) return;

        renderTask = page.render({
          canvasContext: context,
          viewport,
        });

        await renderTask.promise;
      } catch (err: unknown) {
        // Ignore cancellation errors
        if (
          err instanceof Error &&
          err.message.includes("Rendering cancelled")
        ) {
          return;
        }
        // Also ignore the specific canvas conflict error during cleanup
        if (
          err instanceof Error &&
          err.message.includes("Cannot use the same canvas")
        ) {
          return;
        }
        console.error("Error rendering PDF page:", err);
      }
    };

    renderPage();

    // Cleanup function to cancel any in-progress render
    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, zoom]);

  return (
    <div ref={containerRef} className="pdf-canvas-wrapper">
      <canvas ref={canvasRef} className="block rounded-lg shadow-2xl" />
      {document && pageSize.width > 0 && (
        <EditableTextLayer
          pageWidth={pageSize.width}
          pageHeight={pageSize.height}
          scale={zoom}
        />
      )}
    </div>
  );
}
