import { promises as fs } from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import type {
  PdfDocument,
  PdfPage,
  PdfTextItem,
  EditOperation,
} from "@pdf-editor/shared";
import { config } from "../../config/index.js";

// Store document metadata in memory
const documentMetaStore = new Map<string, PdfDocument>();

// Python PDF service URL
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || "http://localhost:3002";

// Ensure directories exist
async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Directory exists
  }
}

// Custom error class for password required
export class PasswordRequiredError extends Error {
  constructor() {
    super("Password required to open this PDF");
    this.name = "PasswordRequiredError";
  }
}

export async function parsePdf(
  buffer: Buffer,
  filename: string,
  password?: string
): Promise<PdfDocument> {
  await ensureDir(config.storage.tempDir);

  const docId = uuidv4();

  // Save original PDF to disk for later editing
  const pdfPath = path.join(config.storage.tempDir, `${docId}.pdf`);
  await fs.writeFile(pdfPath, buffer);

  // Convert Buffer to Uint8Array for pdfjs-dist
  const uint8Array = new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength
  );

  // Load PDF with pdf.js for text extraction
  let pdfDoc;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      password: password, // Pass optional password
    });
    pdfDoc = await loadingTask.promise;
  } catch (error: any) {
    if (error.name === "PasswordException" || error.code === 1) {
      throw new PasswordRequiredError();
    }
    throw error;
  }

  const pages: PdfPage[] = [];

  for (let i = 0; i < pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i + 1);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    const textItems: PdfTextItem[] = textContent.items
      .filter((item: any) => "str" in item && item.str.trim())
      .map((item: any, index: number) => {
        const transform = item.transform || [1, 0, 0, 1, 0, 0];

        // Calculate coordinates using viewport transform handles rotation (0, 90, 180, 270)
        // [scaleX, skewY, skewX, scaleY, transX, transY]
        const m = viewport.transform;
        const tx = transform[4];
        const ty = transform[5];

        // PDF point (tx, ty) to Viewport/Canvas point (x, y)
        const x = tx * m[0] + ty * m[2] + m[4];
        const y = tx * m[1] + ty * m[3] + m[5];

        return {
          id: `${docId}-p${i}-t${index}`,
          text: item.str,
          x: x,
          y: y,
          width: item.width || 100,
          height: item.height || Math.abs(transform[0]) || 12,
          fontSize: Math.abs(transform[0]) || 12,
          fontName: item.fontName || "Helvetica",
          pageIndex: i,
          transform: transform,
        };
      });

    pages.push({
      pageIndex: i,
      width: viewport.width,
      height: viewport.height,
      textItems,
    });
  }

  const document: PdfDocument = {
    id: docId,
    filename,
    totalPages: pdfDoc.numPages,
    pages,
    uploadedAt: new Date().toISOString(),
  };

  documentMetaStore.set(docId, document);

  return document;
}

export async function applyEdits(
  documentId: string,
  edits: EditOperation[],
  password?: string
): Promise<Buffer> {
  await ensureDir(config.storage.outputDir);

  const pdfPath = path.join(config.storage.tempDir, `${documentId}.pdf`);

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await fs.readFile(pdfPath);
  } catch {
    throw new Error("Document not found. Please re-upload the PDF.");
  }

  // Get original text for each edit from stored document
  const doc = documentMetaStore.get(documentId);
  const enrichedEdits = edits.map((edit) => {
    let originalText = edit.originalText;

    // If originalText is empty, try to find it from stored document
    if (!originalText && doc) {
      const page = doc.pages[edit.pageIndex];
      if (page) {
        const item = page.textItems.find((t) => t.id === edit.textItemId);
        if (item) {
          originalText = item.text;
        }
      }
    }

    // Calculate matchIndex (which occurrence of this text string is it?)
    let matchIndex = 0;
    if (doc && originalText) {
      const page = doc.pages[edit.pageIndex];
      if (page) {
        let count = 0;
        let found = false;
        // Iterate text items in order to find our target and count duplicates
        for (const item of page.textItems) {
          if (item.text === originalText) {
            if (item.id === edit.textItemId) {
              matchIndex = count;
              found = true;
              break;
            }
            count++;
          }
        }
        // If we didn't find exact ID match (fallback), use 0
        if (!found) matchIndex = 0;
      }
    }

    return {
      pageIndex: edit.pageIndex,
      originalText,
      newText: edit.newText,
      x: edit.x,
      y: edit.y,
      fontSize: edit.fontSize,
      fontName: edit.fontName,
      width: edit.width,
      matchIndex, // Send the occurrence index
    };
  });

  // Call Python PDF service
  const formData = new FormData();
  const uint8Array = new Uint8Array(pdfBuffer);
  formData.append(
    "file",
    new Blob([uint8Array], { type: "application/pdf" }),
    "input.pdf"
  );
  formData.append("edits", JSON.stringify(enrichedEdits));
  if (password) {
    formData.append("password", password);
  }

  try {
    const response = await fetch(`${PDF_SERVICE_URL}/edit`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("PDF Service failed:", errText);
      try {
        const errJson = JSON.parse(errText);
        throw new Error(
          errJson.detail || errJson.message || "PDF Service processing failed"
        );
      } catch (e) {
        throw new Error(`PDF Service error: ${errText || response.statusText}`);
      }
    }

    const editedPdfBuffer = Buffer.from(await response.arrayBuffer());

    // Save to output directory
    const outputPath = path.join(
      config.storage.outputDir,
      `${documentId}-edited.pdf`
    );
    await fs.writeFile(outputPath, editedPdfBuffer);

    return editedPdfBuffer;
  } catch (error) {
    // If Python service is not available, throw helpful error
    if (error instanceof Error && error.message.includes("fetch failed")) {
      throw new Error(
        "PDF editing service not available. Please start the Python service with: python apps/pdf-service/main.py"
      );
    }
    throw error;
  }
}

export function getDocument(documentId: string) {
  return documentMetaStore.get(documentId);
}

export async function getEditedPdfPath(
  documentId: string
): Promise<string | null> {
  const outputPath = path.join(
    config.storage.outputDir,
    `${documentId}-edited.pdf`
  );
  try {
    await fs.access(outputPath);
    return outputPath;
  } catch {
    return null;
  }
}

export function getFontData(
  documentId: string,
  fontName: string
): Uint8Array | null {
  return null;
}
