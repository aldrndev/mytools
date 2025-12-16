import type { FastifyRequest, FastifyReply } from "fastify";
import {
  GenerateSalarySlipBodySchema,
  type GenerateSalarySlipBody,
} from "./schema.js";
import {
  calculateSalarySlip,
  generateSalarySlipHTML,
  TEMPLATES,
  formatPeriod,
} from "./service.js";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "output",
  "salary-slips"
);

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

export async function generateSalarySlip(
  request: FastifyRequest<{ Body: GenerateSalarySlipBody }>,
  reply: FastifyReply
) {
  try {
    // Validate request body
    const parseResult = GenerateSalarySlipBodySchema.safeParse(request.body);
    if (!parseResult.success) {
      console.log(
        "Generate - Validation error:",
        JSON.stringify(parseResult.error.flatten(), null, 2)
      );
      console.log(
        "Generate - Request body:",
        JSON.stringify(request.body, null, 2)
      );
      return reply.status(400).send({
        success: false,
        error: "Validation failed",
        details: parseResult.error.flatten(),
      });
    }

    const {
      company,
      employee,
      period,
      earnings,
      deductionsConfig,
      templateId,
      theme,
      orientation,
    } = parseResult.data;

    // Calculate salary slip
    const result = calculateSalarySlip(
      company,
      employee,
      period,
      earnings,
      deductionsConfig
    );

    // Generate HTML
    const html = generateSalarySlipHTML(result, templateId, theme, orientation);

    // Save HTML file
    await ensureOutputDir();
    const filename = `slip-gaji-${employee.employeeId}-${period.year}-${String(
      period.month
    ).padStart(2, "0")}-${randomUUID().slice(0, 8)}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);
    await fs.writeFile(filepath, html, "utf-8");

    // Return response
    return reply.send({
      success: true,
      data: {
        downloadUrl: `/files/salary-slips/${filename}`,
        filename,
        grossSalary: result.grossSalary,
        netSalary: result.netSalary,
        deductions: {
          pph21: result.deductions.pph21,
          bpjsKesehatanEmployee: result.deductions.bpjsKesehatanEmployee,
          bpjsJhtEmployee: result.deductions.bpjsJhtEmployee,
          bpjsJpEmployee: result.deductions.bpjsJpEmployee,
          totalEmployeeDeductions: result.deductions.totalEmployeeDeductions,
        },
      },
    });
  } catch (error) {
    request.log.error(error, "Failed to generate salary slip");
    return reply.status(500).send({
      success: false,
      error: "Failed to generate salary slip",
    });
  }
}

export async function listTemplates(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.send({
    success: true,
    templates: TEMPLATES,
  });
}

export async function previewSalarySlip(
  request: FastifyRequest<{ Body: GenerateSalarySlipBody }>,
  reply: FastifyReply
) {
  try {
    const parseResult = GenerateSalarySlipBodySchema.safeParse(request.body);
    if (!parseResult.success) {
      console.log(
        "Validation error:",
        JSON.stringify(parseResult.error.flatten(), null, 2)
      );
      console.log("Request body:", JSON.stringify(request.body, null, 2));
      return reply.status(400).send({
        success: false,
        error: "Validation failed",
        details: parseResult.error.flatten(),
      });
    }

    const {
      company,
      employee,
      period,
      earnings,
      deductionsConfig,
      templateId,
      theme,
      orientation,
    } = parseResult.data;

    // Calculate salary slip
    const result = calculateSalarySlip(
      company,
      employee,
      period,
      earnings,
      deductionsConfig
    );

    // Generate HTML
    const html = generateSalarySlipHTML(
      result,
      templateId,
      theme,
      orientation,
      true
    );

    // Return HTML directly for preview
    return reply.header("Content-Type", "text/html").send(html);
  } catch (error) {
    request.log.error(error, "Failed to generate preview");
    return reply.status(500).send({
      success: false,
      error: "Failed to generate preview",
    });
  }
}

export async function calculateDeductions(
  request: FastifyRequest<{ Body: GenerateSalarySlipBody }>,
  reply: FastifyReply
) {
  try {
    const parseResult = GenerateSalarySlipBodySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Validation failed",
        details: parseResult.error.flatten(),
      });
    }

    const { company, employee, period, earnings, deductionsConfig } =
      parseResult.data;

    // Calculate salary slip
    const result = calculateSalarySlip(
      company,
      employee,
      period,
      earnings,
      deductionsConfig
    );

    // Return calculation results only (no HTML generation)
    return reply.send({
      success: true,
      data: {
        grossSalary: result.grossSalary,
        netSalary: result.netSalary,
        period: formatPeriod(period),
        deductions: result.deductions,
        earnings: {
          ...earnings,
          total: result.grossSalary,
        },
      },
    });
  } catch (error) {
    request.log.error(error, "Failed to calculate deductions");
    return reply.status(500).send({
      success: false,
      error: "Failed to calculate deductions",
    });
  }
}
