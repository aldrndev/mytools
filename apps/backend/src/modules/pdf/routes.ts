import type { FastifyInstance } from "fastify";
import {
  uploadPdfController,
  editPdfController,
  downloadPdfController,
  getFontController,
} from "./controller.js";

export async function pdfRoutes(fastify: FastifyInstance) {
  // Upload PDF and get text items with positions
  fastify.post("/upload", uploadPdfController);

  // Apply edits to PDF
  fastify.post("/edit", editPdfController);

  // Download edited PDF
  fastify.get("/:id/download", downloadPdfController);

  // Get font file for preview
  fastify.get("/:id/font/:fontName", getFontController);
}
