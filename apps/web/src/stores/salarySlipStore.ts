import { create } from "zustand";
import type {
  CompanyInfo,
  EmployeeInfo,
  Earnings,
  DeductionsConfig,
  CalculatedDeductions,
  PayrollPeriod,
  TemplateId,
} from "@pdf-editor/shared";

export type WizardStep =
  | "company"
  | "employee"
  | "salary"
  | "template"
  | "preview";

interface SalarySlipState {
  // Wizard navigation
  currentStep: WizardStep;

  // Form data
  company: CompanyInfo;
  employee: EmployeeInfo;
  period: PayrollPeriod;
  earnings: Earnings;
  deductionsConfig: DeductionsConfig;
  selectedTemplate: TemplateId;

  // Calculated values
  grossSalary: number;
  netSalary: number;
  calculatedDeductions: CalculatedDeductions | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  setCompany: (company: Partial<CompanyInfo>) => void;
  setEmployee: (employee: Partial<EmployeeInfo>) => void;
  setPeriod: (period: Partial<PayrollPeriod>) => void;
  setEarnings: (earnings: Partial<Earnings>) => void;
  setDeductionsConfig: (config: Partial<DeductionsConfig>) => void;
  setSelectedTemplate: (template: TemplateId) => void;

  setCalculatedValues: (
    gross: number,
    net: number,
    deductions: CalculatedDeductions
  ) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const STEP_ORDER: WizardStep[] = [
  "company",
  "employee",
  "salary",
  "template",
  "preview",
];

const initialCompany: CompanyInfo = {
  name: "",
  address: "",
  phone: "",
  email: "",
  npwp: "",
  logoUrl: "",
  logoBase64: "",
};

const initialEmployee: EmployeeInfo = {
  name: "",
  employeeId: "",
  position: "",
  department: "",
  joinDate: "",
  npwp: "",
  ptkpStatus: "TK/0",
  bankName: "",
  bankAccount: "",
};

const currentDate = new Date();
const initialPeriod: PayrollPeriod = {
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear(),
};

const initialEarnings: Earnings = {
  basicSalary: 0,
  positionAllowance: 0,
  transportAllowance: 0,
  mealAllowance: 0,
  housingAllowance: 0,
  communicationAllowance: 0,
  overtime: 0,
  bonus: 0,
  thr: 0,
  otherEarnings: [],
};

const initialDeductionsConfig: DeductionsConfig = {
  jkkRiskLevel: "LOW",
  includeBpjsKesehatan: true,
  includeBpjsKetenagakerjaan: true,
  customDeductions: [],
};

export const useSalarySlipStore = create<SalarySlipState>((set) => ({
  // Initial state
  currentStep: "company",
  company: initialCompany,
  employee: initialEmployee,
  period: initialPeriod,
  earnings: initialEarnings,
  deductionsConfig: initialDeductionsConfig,
  selectedTemplate: "modern",
  grossSalary: 0,
  netSalary: 0,
  calculatedDeductions: null,
  isLoading: false,
  error: null,

  // Navigation actions
  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      if (currentIndex < STEP_ORDER.length - 1) {
        return { currentStep: STEP_ORDER[currentIndex + 1] };
      }
      return state;
    }),

  prevStep: () =>
    set((state) => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      if (currentIndex > 0) {
        return { currentStep: STEP_ORDER[currentIndex - 1] };
      }
      return state;
    }),

  // Form data actions
  setCompany: (company) =>
    set((state) => ({ company: { ...state.company, ...company } })),

  setEmployee: (employee) =>
    set((state) => ({ employee: { ...state.employee, ...employee } })),

  setPeriod: (period) =>
    set((state) => ({ period: { ...state.period, ...period } })),

  setEarnings: (earnings) =>
    set((state) => ({ earnings: { ...state.earnings, ...earnings } })),

  setDeductionsConfig: (config) =>
    set((state) => ({
      deductionsConfig: { ...state.deductionsConfig, ...config },
    })),

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  setCalculatedValues: (gross, net, deductions) =>
    set({
      grossSalary: gross,
      netSalary: net,
      calculatedDeductions: deductions,
    }),

  // UI actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  reset: () =>
    set({
      currentStep: "company",
      company: initialCompany,
      employee: initialEmployee,
      period: initialPeriod,
      earnings: initialEarnings,
      deductionsConfig: initialDeductionsConfig,
      selectedTemplate: "modern",
      grossSalary: 0,
      netSalary: 0,
      calculatedDeductions: null,
      isLoading: false,
      error: null,
    }),
}));
