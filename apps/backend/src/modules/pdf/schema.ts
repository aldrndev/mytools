import { z } from "zod";

export const uploadPdfSchema = z.object({
  file: z.any(), // Handled by multipart
});

export const editPdfSchema = z.object({
  documentId: z.string().uuid(),
  edits: z.array(
    z.object({
      textItemId: z.string(),
      pageIndex: z.number().int().min(0),
      originalText: z.string(),
      newText: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      fontSize: z.number(),
      fontName: z.string(),
    })
  ),
  password: z.string().optional(),
});

export type EditPdfInput = z.infer<typeof editPdfSchema>;
