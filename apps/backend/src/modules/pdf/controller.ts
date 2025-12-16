import type { FastifyRequest, FastifyReply } from "fastify";
import {
  parsePdf,
  applyEdits,
  getEditedPdfPath,
  getFontData,
  PasswordRequiredError,
} from "./service.js";
import { editPdfSchema, type EditPdfInput } from "./schema.js";
import { config } from "../../config/index.js";

export async function uploadPdfController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({
        success: false,
        error: "No file uploaded",
      });
    }

    // Validate MIME type
    if (!config.upload.allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({
        success: false,
        error: "Only PDF files are allowed",
      });
    }

    const buffer = await data.toBuffer();

    // Check file size
    if (buffer.length > config.upload.maxFileSize) {
      return reply.status(400).send({
        success: false,
        error: "File size exceeds 50MB limit",
      });
    }

    // Get password from header
    const password = request.headers["x-pdf-password"] as string | undefined;

    const result = await parsePdf(buffer, data.filename, password);

    return reply.send({
      success: true,
      document: result,
    });
  } catch (error) {
    request.log.error(error);
    if (error instanceof PasswordRequiredError) {
      return reply.status(400).send({
        success: false,
        code: "PASSWORD_REQUIRED",
        error: "Password required to open this PDF",
      });
    }
    return reply.status(500).send({
      success: false,
      error: "Failed to parse PDF",
    });
  }
}

export async function editPdfController(
  request: FastifyRequest<{ Body: EditPdfInput }>,
  reply: FastifyReply
) {
  try {
    const validation = editPdfSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid request body",
        details: validation.error.issues,
      });
    }

    const { documentId, edits, password } = validation.data;

    await applyEdits(documentId, edits, password);

    return reply.send({
      success: true,
      downloadUrl: `/api/pdf/${documentId}/download`,
      message: "PDF edited successfully",
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : "Failed to edit PDF",
    });
  }
}

export async function downloadPdfController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const filePath = await getEditedPdfPath(id);

    if (!filePath) {
      return reply.status(404).send({
        success: false,
        error: "Edited PDF not found",
      });
    }

    return reply.sendFile(`${id}-edited.pdf`, "./output");
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to download PDF",
    });
  }
}

export async function getFontController(
  request: FastifyRequest<{ Params: { id: string; fontName: string } }>,
  reply: FastifyReply
) {
  try {
    const { id, fontName } = request.params;
    const fontData = getFontData(id, fontName);

    if (!fontData) {
      return reply.status(404).send({
        success: false,
        error: "Font not found",
      });
    }

    reply.header("Content-Type", "font/ttf");
    reply.header("Cache-Control", "public, max-age=31536000");
    return reply.send(Buffer.from(fontData));
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to get font",
    });
  }
}
