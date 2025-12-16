import type { FastifyInstance } from "fastify";
import {
  generateSalarySlip,
  listTemplates,
  previewSalarySlip,
  calculateDeductions,
} from "./controller.js";

export async function salarySlipRoutes(fastify: FastifyInstance) {
  // Generate salary slip and save as HTML file
  fastify.post("/generate", generateSalarySlip);

  // Preview salary slip (returns HTML directly)
  fastify.post("/preview", previewSalarySlip);

  // Calculate deductions only (no PDF generation)
  fastify.post("/calculate", calculateDeductions);

  // List available templates
  fastify.get("/templates", listTemplates);
}
