import type {
  PTKPStatus,
  TERCategory,
  JKKRiskLevel,
  Earnings,
  DeductionsConfig,
  CalculatedDeductions,
} from "./payroll.schema";

// ============================================
// Constants
// ============================================

/**
 * PTKP Annual Values (2025)
 * Used for reference, but TER already incorporates these
 */
export const PTKP_ANNUAL = {
  SELF: 54_000_000,
  MARRIED: 4_500_000,
  DEPENDENT: 4_500_000, // per dependent, max 3
} as const;

/**
 * Mapping PTKP Status to TER Category (PP 58/2023, PMK 168/2023)
 */
export const PTKP_TO_TER_CATEGORY: Record<PTKPStatus, TERCategory> = {
  "TK/0": "A",
  "TK/1": "A",
  "K/0": "A",
  "TK/2": "B",
  "TK/3": "B",
  "K/1": "B",
  "K/2": "B",
  "K/3": "C",
  "K/I/0": "A",
  "K/I/1": "B",
  "K/I/2": "B",
  "K/I/3": "C",
};

/**
 * TER Monthly Rates (Tarif Efektif Rata-rata) - PP 58/2023
 * Rates are progressive based on monthly gross income
 * Format: [maxIncome, rate] - rate applies if income <= maxIncome
 */
export const TER_MONTHLY_RATES: Record<TERCategory, Array<[number, number]>> = {
  A: [
    [5_400_000, 0],
    [5_650_000, 0.0025],
    [5_950_000, 0.005],
    [6_300_000, 0.0075],
    [6_750_000, 0.01],
    [7_500_000, 0.0125],
    [8_550_000, 0.015],
    [9_650_000, 0.0175],
    [10_050_000, 0.02],
    [10_350_000, 0.0225],
    [10_700_000, 0.025],
    [11_050_000, 0.03],
    [11_600_000, 0.035],
    [12_500_000, 0.04],
    [13_750_000, 0.045],
    [15_100_000, 0.05],
    [16_950_000, 0.055],
    [19_750_000, 0.06],
    [24_150_000, 0.07],
    [26_450_000, 0.075],
    [28_000_000, 0.08],
    [30_050_000, 0.085],
    [32_400_000, 0.09],
    [35_400_000, 0.095],
    [39_100_000, 0.1],
    [43_850_000, 0.11],
    [47_800_000, 0.12],
    [51_400_000, 0.13],
    [56_300_000, 0.14],
    [62_200_000, 0.15],
    [68_600_000, 0.16],
    [77_500_000, 0.17],
    [89_000_000, 0.18],
    [103_000_000, 0.19],
    [125_000_000, 0.2],
    [157_000_000, 0.21],
    [206_000_000, 0.22],
    [337_000_000, 0.23],
    [454_000_000, 0.24],
    [550_000_000, 0.25],
    [695_000_000, 0.26],
    [910_000_000, 0.27],
    [1_400_000_000, 0.28],
    [Infinity, 0.34],
  ],
  B: [
    [6_200_000, 0],
    [6_500_000, 0.0025],
    [6_850_000, 0.005],
    [7_300_000, 0.0075],
    [9_200_000, 0.01],
    [10_750_000, 0.015],
    [11_250_000, 0.02],
    [11_600_000, 0.025],
    [12_600_000, 0.03],
    [13_600_000, 0.035],
    [14_950_000, 0.04],
    [16_400_000, 0.045],
    [18_450_000, 0.05],
    [21_850_000, 0.055],
    [26_000_000, 0.06],
    [27_700_000, 0.07],
    [29_350_000, 0.075],
    [31_450_000, 0.08],
    [33_950_000, 0.085],
    [37_100_000, 0.09],
    [41_100_000, 0.095],
    [45_800_000, 0.1],
    [49_500_000, 0.11],
    [53_800_000, 0.12],
    [58_500_000, 0.13],
    [64_000_000, 0.14],
    [71_000_000, 0.15],
    [80_000_000, 0.16],
    [93_000_000, 0.17],
    [109_000_000, 0.18],
    [129_000_000, 0.19],
    [163_000_000, 0.2],
    [211_000_000, 0.21],
    [374_000_000, 0.22],
    [459_000_000, 0.23],
    [555_000_000, 0.24],
    [704_000_000, 0.25],
    [957_000_000, 0.26],
    [1_405_000_000, 0.27],
    [Infinity, 0.34],
  ],
  C: [
    [6_600_000, 0],
    [6_950_000, 0.0025],
    [7_350_000, 0.005],
    [7_800_000, 0.0075],
    [8_850_000, 0.01],
    [9_800_000, 0.0125],
    [10_950_000, 0.015],
    [11_200_000, 0.0175],
    [12_050_000, 0.02],
    [12_950_000, 0.025],
    [14_150_000, 0.03],
    [15_550_000, 0.035],
    [17_050_000, 0.04],
    [19_500_000, 0.045],
    [22_700_000, 0.05],
    [26_600_000, 0.055],
    [28_100_000, 0.06],
    [30_100_000, 0.07],
    [32_600_000, 0.08],
    [35_400_000, 0.085],
    [38_900_000, 0.09],
    [43_000_000, 0.095],
    [47_400_000, 0.1],
    [51_200_000, 0.11],
    [55_800_000, 0.12],
    [60_400_000, 0.13],
    [66_700_000, 0.14],
    [74_500_000, 0.15],
    [83_200_000, 0.16],
    [95_600_000, 0.17],
    [110_000_000, 0.18],
    [134_000_000, 0.19],
    [169_000_000, 0.2],
    [221_000_000, 0.21],
    [390_000_000, 0.22],
    [463_000_000, 0.23],
    [561_000_000, 0.24],
    [709_000_000, 0.25],
    [965_000_000, 0.26],
    [1_419_000_000, 0.27],
    [Infinity, 0.34],
  ],
};

/**
 * BPJS Kesehatan Constants
 */
export const BPJS_KESEHATAN = {
  TOTAL_RATE: 0.05, // 5%
  EMPLOYER_RATE: 0.04, // 4%
  EMPLOYEE_RATE: 0.01, // 1%
  MAX_SALARY_BASE: 12_000_000, // Maximum salary for calculation
} as const;

/**
 * BPJS Ketenagakerjaan Constants
 */
export const BPJS_KETENAGAKERJAAN = {
  JKK_RATES: {
    VERY_LOW: 0.0024, // 0.24%
    LOW: 0.0054, // 0.54%
    MEDIUM: 0.0089, // 0.89%
    HIGH: 0.0127, // 1.27%
    VERY_HIGH: 0.0174, // 1.74%
  } as Record<JKKRiskLevel, number>,
  JKM_RATE: 0.003, // 0.30% - employer only
  JHT_TOTAL_RATE: 0.057, // 5.7%
  JHT_EMPLOYER_RATE: 0.037, // 3.7%
  JHT_EMPLOYEE_RATE: 0.02, // 2%
  JP_TOTAL_RATE: 0.03, // 3%
  JP_EMPLOYER_RATE: 0.02, // 2%
  JP_EMPLOYEE_RATE: 0.01, // 1%
  JP_MAX_SALARY_BASE: 10_547_400, // Maximum salary for JP calculation (2025, effective March 2025)
} as const;

// ============================================
// Calculation Functions
// ============================================

/**
 * Get TER Category from PTKP Status
 */
export function getTERCategory(ptkpStatus: PTKPStatus): TERCategory {
  return PTKP_TO_TER_CATEGORY[ptkpStatus];
}

/**
 * Calculate gross salary from earnings
 */
export function calculateGrossSalary(earnings: Earnings): number {
  const otherEarningsTotal = earnings.otherEarnings.reduce(
    (sum: number, item: { name: string; amount: number }) => sum + item.amount,
    0
  );

  return (
    earnings.basicSalary +
    earnings.positionAllowance +
    earnings.transportAllowance +
    earnings.mealAllowance +
    earnings.housingAllowance +
    earnings.communicationAllowance +
    earnings.overtime +
    earnings.bonus +
    earnings.thr +
    otherEarningsTotal
  );
}

/**
 * Calculate PPh 21 using TER Monthly Rate (Jan-Nov)
 * For December, use progressive rates (not implemented in v1)
 */
export function calculatePPh21TER(
  grossSalary: number,
  ptkpStatus: PTKPStatus
): number {
  const category = getTERCategory(ptkpStatus);
  const rates = TER_MONTHLY_RATES[category];

  // Find applicable rate
  for (const [maxIncome, rate] of rates) {
    if (grossSalary <= maxIncome) {
      return Math.round(grossSalary * rate);
    }
  }

  // Fallback to highest rate (should not reach here)
  return Math.round(grossSalary * 0.34);
}

/**
 * Calculate BPJS Kesehatan contributions
 */
export function calculateBPJSKesehatan(grossSalary: number): {
  employee: number;
  employer: number;
  total: number;
} {
  const salaryBase = Math.min(grossSalary, BPJS_KESEHATAN.MAX_SALARY_BASE);

  const employee = Math.round(salaryBase * BPJS_KESEHATAN.EMPLOYEE_RATE);
  const employer = Math.round(salaryBase * BPJS_KESEHATAN.EMPLOYER_RATE);

  return {
    employee,
    employer,
    total: employee + employer,
  };
}

/**
 * Calculate BPJS Ketenagakerjaan JKK (Jaminan Kecelakaan Kerja)
 * Employer only
 */
export function calculateBPJSJKK(
  grossSalary: number,
  riskLevel: JKKRiskLevel
): number {
  const rate = BPJS_KETENAGAKERJAAN.JKK_RATES[riskLevel];
  return Math.round(grossSalary * rate);
}

/**
 * Calculate BPJS Ketenagakerjaan JKM (Jaminan Kematian)
 * Employer only
 */
export function calculateBPJSJKM(grossSalary: number): number {
  return Math.round(grossSalary * BPJS_KETENAGAKERJAAN.JKM_RATE);
}

/**
 * Calculate BPJS Ketenagakerjaan JHT (Jaminan Hari Tua)
 */
export function calculateBPJSJHT(grossSalary: number): {
  employee: number;
  employer: number;
  total: number;
} {
  const employee = Math.round(
    grossSalary * BPJS_KETENAGAKERJAAN.JHT_EMPLOYEE_RATE
  );
  const employer = Math.round(
    grossSalary * BPJS_KETENAGAKERJAAN.JHT_EMPLOYER_RATE
  );

  return {
    employee,
    employer,
    total: employee + employer,
  };
}

/**
 * Calculate BPJS Ketenagakerjaan JP (Jaminan Pensiun)
 */
export function calculateBPJSJP(grossSalary: number): {
  employee: number;
  employer: number;
  total: number;
} {
  const salaryBase = Math.min(
    grossSalary,
    BPJS_KETENAGAKERJAAN.JP_MAX_SALARY_BASE
  );

  const employee = Math.round(
    salaryBase * BPJS_KETENAGAKERJAAN.JP_EMPLOYEE_RATE
  );
  const employer = Math.round(
    salaryBase * BPJS_KETENAGAKERJAAN.JP_EMPLOYER_RATE
  );

  return {
    employee,
    employer,
    total: employee + employer,
  };
}

/**
 * Calculate all deductions based on earnings and config
 */
export function calculateAllDeductions(
  earnings: Earnings,
  config: DeductionsConfig,
  ptkpStatus: PTKPStatus
): CalculatedDeductions {
  const grossSalary = calculateGrossSalary(earnings);

  // PPh 21
  const pph21 = calculatePPh21TER(grossSalary, ptkpStatus);

  // BPJS Kesehatan
  let bpjsKesehatan = { employee: 0, employer: 0 };
  if (config.includeBpjsKesehatan) {
    bpjsKesehatan = calculateBPJSKesehatan(grossSalary);
  }

  // BPJS Ketenagakerjaan
  let bpjsJkk = 0;
  let bpjsJkm = 0;
  let bpjsJht = { employee: 0, employer: 0 };
  let bpjsJp = { employee: 0, employer: 0 };

  if (config.includeBpjsKetenagakerjaan) {
    bpjsJkk = calculateBPJSJKK(grossSalary, config.jkkRiskLevel);
    bpjsJkm = calculateBPJSJKM(grossSalary);
    bpjsJht = calculateBPJSJHT(grossSalary);
    bpjsJp = calculateBPJSJP(grossSalary);
  }

  // Custom deductions
  const customDeductionsTotal = config.customDeductions.reduce(
    (sum: number, item: { name: string; amount: number }) => sum + item.amount,
    0
  );

  // Calculate totals
  const totalEmployeeDeductions =
    pph21 +
    bpjsKesehatan.employee +
    bpjsJht.employee +
    bpjsJp.employee +
    customDeductionsTotal;

  const totalEmployerContributions =
    bpjsKesehatan.employer +
    bpjsJkk +
    bpjsJkm +
    bpjsJht.employer +
    bpjsJp.employer;

  return {
    pph21,
    bpjsKesehatanEmployee: bpjsKesehatan.employee,
    bpjsKesehatanEmployer: bpjsKesehatan.employer,
    bpjsJkkEmployer: bpjsJkk,
    bpjsJkmEmployer: bpjsJkm,
    bpjsJhtEmployee: bpjsJht.employee,
    bpjsJhtEmployer: bpjsJht.employer,
    bpjsJpEmployee: bpjsJp.employee,
    bpjsJpEmployer: bpjsJp.employer,
    customDeductions: config.customDeductions,
    totalEmployeeDeductions,
    totalEmployerContributions,
  };
}

/**
 * Calculate net salary (Take Home Pay)
 */
export function calculateNetSalary(
  grossSalary: number,
  deductions: CalculatedDeductions
): number {
  return grossSalary - deductions.totalEmployeeDeductions;
}

/**
 * Format currency to Indonesian Rupiah format
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}
