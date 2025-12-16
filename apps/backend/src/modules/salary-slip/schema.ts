import { z } from "zod";
import {
  CompanyInfoSchema,
  EmployeeInfoSchema,
  EarningsSchema,
  DeductionsConfigSchema,
  PayrollPeriodSchema,
  TemplateIdSchema,
} from "@pdf-editor/shared";

// Request Schemas
export const GenerateSalarySlipBodySchema = z.object({
  company: CompanyInfoSchema,
  employee: EmployeeInfoSchema,
  period: PayrollPeriodSchema,
  earnings: EarningsSchema,
  deductionsConfig: DeductionsConfigSchema,
  templateId: TemplateIdSchema,
});

export type GenerateSalarySlipBody = z.infer<
  typeof GenerateSalarySlipBodySchema
>;

// Response Schemas
export const GenerateSalarySlipResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    downloadUrl: z.string(),
    filename: z.string(),
    grossSalary: z.number(),
    netSalary: z.number(),
    deductions: z.object({
      pph21: z.number(),
      bpjsKesehatanEmployee: z.number(),
      bpjsJhtEmployee: z.number(),
      bpjsJpEmployee: z.number(),
      totalEmployeeDeductions: z.number(),
    }),
  }),
});

export type GenerateSalarySlipResponse = z.infer<
  typeof GenerateSalarySlipResponseSchema
>;

export const ListTemplatesResponseSchema = z.object({
  success: z.boolean(),
  templates: z.array(
    z.object({
      id: TemplateIdSchema,
      name: z.string(),
      description: z.string(),
      thumbnailUrl: z.string().optional(),
    })
  ),
});

export type ListTemplatesResponse = z.infer<typeof ListTemplatesResponseSchema>;
