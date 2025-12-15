import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fs from "fs";
import util from "util";
import { pipeline } from "stream";
import { PdfParserService } from "../../infrastructure/pdf-parser.service.js";
import { TemplateExtractorService } from "../../application/template-extractor.service.js";

const pump = util.promisify(pipeline);

export default async function statementsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post(
    "/upload",
    {
      schema: {
        summary: "Upload a bank statement PDF",
        consumes: ["multipart/form-data"],
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              filename: { type: "string" },
              data: { type: "object", additionalProperties: true },
            },
          },
          500: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const parts = request.parts();

      let fileName = "";
      let parsedData = null;

      for await (const part of parts) {
        if (part.type === "file") {
          fileName = part.filename;

          // Save to temp file
          const tmpPath = `/tmp/${fileName}`;
          await pump(part.file, fs.createWriteStream(tmpPath));

          // Parse PDF
          const parser = new PdfParserService();
          try {
            parsedData = await parser.parse(tmpPath);

            // Extract template
            const extractor = new TemplateExtractorService();
            const template = extractor.extract(parsedData);

            return {
              message: "File processed successfully",
              filename: fileName,
              data: template, // Send template instead of raw data
            };
          } catch (e) {
            request.log.error(e);
            return reply.status(500).send({ message: "Failed to parse PDF" });
          }
        }
      }

      return {
        message: "File processed successfully",
        filename: fileName,
        data: parsedData,
      };
    }
  );
}
