import { z } from "zod";

// ============================================
// Enum Definitions
// ============================================

/**
 * PTKP Status (Penghasilan Tidak Kena Pajak)
 * - TK = Tidak Kawin (Single)
 * - K = Kawin (Married)
 * - Number suffix = number of dependents (0-3)
 */
export const PTKPStatusSchema = z.enum([
  "TK/0", // Single, no dependents
  "TK/1", // Single, 1 dependent
  "TK/2", // Single, 2 dependents
  "TK/3", // Single, 3 dependents
  "K/0", // Married, no dependents (spouse not working)
  "K/1", // Married, 1 dependent
  "K/2", // Married, 2 dependents
  "K/3", // Married, 3 dependents
  "K/I/0", // Married, spouse working, no dependents
  "K/I/1", // Married, spouse working, 1 dependent
  "K/I/2", // Married, spouse working, 2 dependents
  "K/I/3", // Married, spouse working, 3 dependents
]);

export type PTKPStatus = z.infer<typeof PTKPStatusSchema>;

/**
 * TER Category based on PTKP Status (PP 58/2023)
 */
export const TERCategorySchema = z.enum(["A", "B", "C"]);
export type TERCategory = z.infer<typeof TERCategorySchema>;

/**
 * JKK Risk Level for BPJS Ketenagakerjaan
 */
export const JKKRiskLevelSchema = z.enum([
  "VERY_LOW", // 0.24%
  "LOW", // 0.54%
  "MEDIUM", // 0.89%
  "HIGH", // 1.27%
  "VERY_HIGH", // 1.74%
]);

export type JKKRiskLevel = z.infer<typeof JKKRiskLevelSchema>;

// ============================================
// Schema Definitions
// ============================================

export const CompanyInfoSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
  npwp: z.string().optional().default(""),
  logoUrl: z.string().optional().default(""),
  logoBase64: z.string().optional().default(""),
});

export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;

export const EmployeeInfoSchema = z.object({
  name: z.string().min(1, "Employee name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  position: z.string().optional(),
  department: z.string().optional(),
  joinDate: z.string().optional(),
  npwp: z.string().optional(),
  ptkpStatus: PTKPStatusSchema,
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
});

export type EmployeeInfo = z.infer<typeof EmployeeInfoSchema>;

export const EarningsSchema = z.object({
  basicSalary: z.number().min(0, "Basic salary must be positive"),
  positionAllowance: z.number().min(0).default(0),
  transportAllowance: z.number().min(0).default(0),
  mealAllowance: z.number().min(0).default(0),
  housingAllowance: z.number().min(0).default(0),
  communicationAllowance: z.number().min(0).default(0),
  overtime: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  thr: z.number().min(0).default(0),
  otherEarnings: z
    .array(
      z.object({
        name: z.string(),
        amount: z.number(),
      })
    )
    .default([]),
});

export type Earnings = z.infer<typeof EarningsSchema>;

export const DeductionsConfigSchema = z.object({
  jkkRiskLevel: JKKRiskLevelSchema.default("LOW"),
  includeBpjsKesehatan: z.boolean().default(true),
  includeBpjsKetenagakerjaan: z.boolean().default(true),
  customDeductions: z
    .array(
      z.object({
        name: z.string(),
        amount: z.number(),
      })
    )
    .default([]),
});

export type DeductionsConfig = z.infer<typeof DeductionsConfigSchema>;

export const CalculatedDeductionsSchema = z.object({
  pph21: z.number(),
  bpjsKesehatanEmployee: z.number(),
  bpjsKesehatanEmployer: z.number(),
  bpjsJkkEmployer: z.number(),
  bpjsJkmEmployer: z.number(),
  bpjsJhtEmployee: z.number(),
  bpjsJhtEmployer: z.number(),
  bpjsJpEmployee: z.number(),
  bpjsJpEmployer: z.number(),
  customDeductions: z.array(
    z.object({
      name: z.string(),
      amount: z.number(),
    })
  ),
  totalEmployeeDeductions: z.number(),
  totalEmployerContributions: z.number(),
});

export type CalculatedDeductions = z.infer<typeof CalculatedDeductionsSchema>;

export const PayrollPeriodSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

export type PayrollPeriod = z.infer<typeof PayrollPeriodSchema>;

export const SalarySlipDataSchema = z.object({
  company: CompanyInfoSchema,
  employee: EmployeeInfoSchema,
  period: PayrollPeriodSchema,
  earnings: EarningsSchema,
  deductionsConfig: DeductionsConfigSchema,
  calculatedDeductions: CalculatedDeductionsSchema.optional(),
  grossSalary: z.number().optional(),
  netSalary: z.number().optional(),
  generatedAt: z.string().optional(),
});

export type SalarySlipData = z.infer<typeof SalarySlipDataSchema>;

export const SlipThemeSchema = z.enum([
  "default",
  "blue",
  "green",
  "dark",
  "red",
  "gold",
  "grey",
  "orange",
  "navy",
  "monochrome",
]);

export type SlipTheme = z.infer<typeof SlipThemeSchema>;

export const OrientationSchema = z.enum(["portrait", "landscape"]);

export type Orientation = z.infer<typeof OrientationSchema>;

// Template & Theme Types
export const TemplateIdSchema = z.enum([
  "formal_standar",
  "formal_bordered",
  "formal_compact",
  "formal_detailed",
  "formal_executive",
  "formal_simple",
  "formal_corporate",
  "formal_classic",
  "formal_clean",
  "formal_professional",
  "formal_elegant",
  "formal_business",
  "formal_structured",
]);
export type TemplateId = z.infer<typeof TemplateIdSchema>;

export const GenerateSalarySlipRequestSchema = z.object({
  data: SalarySlipDataSchema,
  templateId: TemplateIdSchema,
  theme: SlipThemeSchema.default("default"),
  orientation: OrientationSchema.default("portrait"),
});

export type GenerateSalarySlipRequest = z.infer<
  typeof GenerateSalarySlipRequestSchema
>;
