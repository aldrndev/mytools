// PDF Text Item - represents a single text element in the PDF
export interface PdfTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  pageIndex: number;
  transform: number[];
}

// PDF Page - represents a single page
export interface PdfPage {
  pageIndex: number;
  width: number;
  height: number;
  textItems: PdfTextItem[];
}

// PDF Document - full document structure
export interface PdfDocument {
  id: string;
  filename: string;
  totalPages: number;
  pages: PdfPage[];
  uploadedAt: string;
}

// Edit Operation - a single text change
export interface EditOperation {
  textItemId: string;
  pageIndex: number;
  originalText: string;
  newText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
}

// API Request/Response types
export interface UploadPdfResponse {
  success: boolean;
  document: PdfDocument;
  message?: string;
}

export interface EditPdfRequest {
  documentId: string;
  edits: EditOperation[];
}

export interface EditPdfResponse {
  success: boolean;
  downloadUrl: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

// Payroll/Salary Slip exports
export {
  // Schemas
  PTKPStatusSchema,
  TERCategorySchema,
  JKKRiskLevelSchema,
  CompanyInfoSchema,
  EmployeeInfoSchema,
  EarningsSchema,
  DeductionsConfigSchema,
  CalculatedDeductionsSchema,
  PayrollPeriodSchema,
  SalarySlipDataSchema,
  TemplateIdSchema,
  SlipThemeSchema,
  OrientationSchema,
  GenerateSalarySlipRequestSchema,
  // Types
  type PTKPStatus,
  type TERCategory,
  type JKKRiskLevel,
  type CompanyInfo,
  type EmployeeInfo,
  type Earnings,
  type DeductionsConfig,
  type CalculatedDeductions,
  type PayrollPeriod,
  type SalarySlipData,
  type TemplateId,
  type SlipTheme,
  type Orientation,
  type GenerateSalarySlipRequest,
} from "./payroll.schema";

export {
  // Constants
  PTKP_ANNUAL,
  PTKP_TO_TER_CATEGORY,
  TER_MONTHLY_RATES,
  BPJS_KESEHATAN,
  BPJS_KETENAGAKERJAAN,
  // Functions
  getTERCategory,
  calculateGrossSalary,
  calculatePPh21TER,
  calculateBPJSKesehatan,
  calculateBPJSJKK,
  calculateBPJSJKM,
  calculateBPJSJHT,
  calculateBPJSJP,
  calculateAllDeductions,
  calculateNetSalary,
  formatRupiah,
  formatNumber,
} from "./payroll-calculator";
