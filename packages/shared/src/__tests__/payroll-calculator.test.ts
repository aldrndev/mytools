import { describe, it, expect } from "vitest";
import {
  calculateGrossSalary,
  calculatePPh21TER,
  calculateBPJSKesehatan,
  calculateBPJSJKK,
  calculateBPJSJKM,
  calculateBPJSJHT,
  calculateBPJSJP,
  calculateAllDeductions,
  calculateNetSalary,
  getTERCategory,
  formatRupiah,
  BPJS_KESEHATAN,
  BPJS_KETENAGAKERJAAN,
} from "../payroll-calculator";
import type { Earnings, DeductionsConfig, PTKPStatus } from "../payroll.schema";

describe("Indonesian Payroll Calculator", () => {
  // Default earnings for testing
  const createEarnings = (basicSalary: number): Earnings => ({
    basicSalary,
    positionAllowance: 0,
    transportAllowance: 0,
    mealAllowance: 0,
    housingAllowance: 0,
    communicationAllowance: 0,
    overtime: 0,
    bonus: 0,
    thr: 0,
    otherEarnings: [],
  });

  const defaultConfig: DeductionsConfig = {
    jkkRiskLevel: "LOW",
    includeBpjsKesehatan: true,
    includeBpjsKetenagakerjaan: true,
    customDeductions: [],
  };

  describe("TER Category Mapping", () => {
    it("should map TK/0 to Category A", () => {
      expect(getTERCategory("TK/0")).toBe("A");
    });

    it("should map K/1 to Category B", () => {
      expect(getTERCategory("K/1")).toBe("B");
    });

    it("should map K/3 to Category C", () => {
      expect(getTERCategory("K/3")).toBe("C");
    });

    it("should map K/I/0 to Category A", () => {
      expect(getTERCategory("K/I/0")).toBe("A");
    });
  });

  describe("Gross Salary Calculation", () => {
    it("should calculate basic salary only", () => {
      const earnings = createEarnings(10_000_000);
      expect(calculateGrossSalary(earnings)).toBe(10_000_000);
    });

    it("should include all allowances", () => {
      const earnings: Earnings = {
        basicSalary: 10_000_000,
        positionAllowance: 1_000_000,
        transportAllowance: 500_000,
        mealAllowance: 500_000,
        housingAllowance: 0,
        communicationAllowance: 0,
        overtime: 500_000,
        bonus: 0,
        thr: 0,
        otherEarnings: [{ name: "Project Bonus", amount: 500_000 }],
      };
      expect(calculateGrossSalary(earnings)).toBe(13_000_000);
    });
  });

  describe("PPh 21 TER Calculation", () => {
    it("should return 0 for salary below threshold (TK/0)", () => {
      // TK/0 threshold is 5,400,000
      expect(calculatePPh21TER(5_000_000, "TK/0")).toBe(0);
    });

    it("should calculate tax for Category A at 6 million", () => {
      // 6,000,000 falls in 0.75% bracket for Category A (5,950,001 - 6,300,000)
      const tax = calculatePPh21TER(6_000_000, "TK/0");
      expect(tax).toBe(45_000); // 6,000,000 * 0.75%
    });

    it("should calculate tax for Category B at 15 million", () => {
      // 15,000,000 falls in 4.5% bracket for Category B (14,950,001 - 16,400,000)
      const tax = calculatePPh21TER(15_000_000, "K/1");
      expect(tax).toBe(675_000); // 15,000,000 * 4.5%
    });

    it("should calculate tax for Category C at 10 million", () => {
      // 10,000,000 falls in 1.5% bracket for Category C (9,800,001 - 10,950,000)
      const tax = calculatePPh21TER(10_000_000, "K/3");
      expect(tax).toBe(150_000); // 10,000,000 * 1.5%
    });

    it("should calculate tax for high salary", () => {
      const tax = calculatePPh21TER(50_000_000, "TK/0");
      // 50,000,000 falls in 13% bracket for Category A (51,400,001 - 56,300,000)
      expect(tax).toBe(6_500_000); // 50,000,000 * 13%
    });
  });

  describe("BPJS Kesehatan Calculation", () => {
    it("should calculate for salary below cap", () => {
      const result = calculateBPJSKesehatan(10_000_000);
      expect(result.employee).toBe(100_000); // 1%
      expect(result.employer).toBe(400_000); // 4%
      expect(result.total).toBe(500_000); // 5%
    });

    it("should cap calculation at 12 million", () => {
      const result = calculateBPJSKesehatan(20_000_000);
      expect(result.employee).toBe(120_000); // 1% of 12M
      expect(result.employer).toBe(480_000); // 4% of 12M
      expect(result.total).toBe(600_000); // 5% of 12M
    });

    it("should calculate exactly at cap", () => {
      const result = calculateBPJSKesehatan(12_000_000);
      expect(result.employee).toBe(120_000);
      expect(result.employer).toBe(480_000);
    });
  });

  describe("BPJS Ketenagakerjaan JKK Calculation", () => {
    it("should calculate very low risk", () => {
      const result = calculateBPJSJKK(10_000_000, "VERY_LOW");
      expect(result).toBe(24_000); // 0.24%
    });

    it("should calculate low risk", () => {
      const result = calculateBPJSJKK(10_000_000, "LOW");
      expect(result).toBe(54_000); // 0.54%
    });

    it("should calculate very high risk", () => {
      const result = calculateBPJSJKK(10_000_000, "VERY_HIGH");
      expect(result).toBe(174_000); // 1.74%
    });
  });

  describe("BPJS Ketenagakerjaan JKM Calculation", () => {
    it("should calculate JKM at 0.30%", () => {
      const result = calculateBPJSJKM(10_000_000);
      expect(result).toBe(30_000);
    });
  });

  describe("BPJS Ketenagakerjaan JHT Calculation", () => {
    it("should calculate JHT contributions", () => {
      const result = calculateBPJSJHT(10_000_000);
      expect(result.employee).toBe(200_000); // 2%
      expect(result.employer).toBe(370_000); // 3.7%
      expect(result.total).toBe(570_000); // 5.7%
    });

    it("should not have salary cap for JHT", () => {
      const result = calculateBPJSJHT(50_000_000);
      expect(result.employee).toBe(1_000_000); // 2%
      expect(result.employer).toBe(1_850_000); // 3.7%
    });
  });

  describe("BPJS Ketenagakerjaan JP Calculation", () => {
    it("should calculate JP for salary below cap", () => {
      const result = calculateBPJSJP(8_000_000);
      expect(result.employee).toBe(80_000); // 1%
      expect(result.employer).toBe(160_000); // 2%
      expect(result.total).toBe(240_000); // 3%
    });

    it("should cap JP calculation at max salary base", () => {
      const result = calculateBPJSJP(15_000_000);
      const maxBase = BPJS_KETENAGAKERJAAN.JP_MAX_SALARY_BASE;
      expect(result.employee).toBe(Math.round(maxBase * 0.01)); // 1% of cap
      expect(result.employer).toBe(Math.round(maxBase * 0.02)); // 2% of cap
    });
  });

  describe("Full Deduction Calculation", () => {
    it("should calculate all deductions for standard employee", () => {
      const earnings = createEarnings(15_000_000);
      const result = calculateAllDeductions(earnings, defaultConfig, "K/1");

      // Verify individual components are calculated
      expect(result.pph21).toBeGreaterThan(0);
      expect(result.bpjsKesehatanEmployee).toBe(120_000); // capped at 12M
      expect(result.bpjsKesehatanEmployer).toBe(480_000);
      expect(result.bpjsJhtEmployee).toBe(300_000); // 2% of 15M
      expect(result.bpjsJhtEmployer).toBe(555_000); // 3.7% of 15M
      expect(result.bpjsJkkEmployer).toBe(81_000); // 0.54% of 15M (LOW)
      expect(result.bpjsJkmEmployer).toBe(45_000); // 0.30% of 15M

      // JP capped
      const jpBase = BPJS_KETENAGAKERJAAN.JP_MAX_SALARY_BASE;
      expect(result.bpjsJpEmployee).toBe(Math.round(jpBase * 0.01));
      expect(result.bpjsJpEmployer).toBe(Math.round(jpBase * 0.02));

      // Total employee deductions
      const expectedEmployeeTotal =
        result.pph21 +
        result.bpjsKesehatanEmployee +
        result.bpjsJhtEmployee +
        result.bpjsJpEmployee;
      expect(result.totalEmployeeDeductions).toBe(expectedEmployeeTotal);
    });

    it("should skip BPJS when disabled", () => {
      const earnings = createEarnings(10_000_000);
      const config: DeductionsConfig = {
        jkkRiskLevel: "LOW",
        includeBpjsKesehatan: false,
        includeBpjsKetenagakerjaan: false,
        customDeductions: [],
      };
      const result = calculateAllDeductions(earnings, config, "TK/0");

      expect(result.bpjsKesehatanEmployee).toBe(0);
      expect(result.bpjsKesehatanEmployer).toBe(0);
      expect(result.bpjsJhtEmployee).toBe(0);
      expect(result.bpjsJpEmployee).toBe(0);
      expect(result.totalEmployerContributions).toBe(0);
    });

    it("should include custom deductions", () => {
      const earnings = createEarnings(10_000_000);
      const config: DeductionsConfig = {
        jkkRiskLevel: "LOW",
        includeBpjsKesehatan: true,
        includeBpjsKetenagakerjaan: true,
        customDeductions: [
          { name: "Loan", amount: 500_000 },
          { name: "Advance", amount: 200_000 },
        ],
      };
      const result = calculateAllDeductions(earnings, config, "TK/0");

      expect(result.customDeductions).toHaveLength(2);
      expect(result.totalEmployeeDeductions).toBeGreaterThan(
        result.pph21 +
          result.bpjsKesehatanEmployee +
          result.bpjsJhtEmployee +
          result.bpjsJpEmployee
      );
    });
  });

  describe("Net Salary Calculation", () => {
    it("should calculate take home pay correctly", () => {
      const earnings = createEarnings(15_000_000);
      const grossSalary = calculateGrossSalary(earnings);
      const deductions = calculateAllDeductions(earnings, defaultConfig, "K/1");
      const netSalary = calculateNetSalary(grossSalary, deductions);

      expect(netSalary).toBe(grossSalary - deductions.totalEmployeeDeductions);
      expect(netSalary).toBeLessThan(grossSalary);
      expect(netSalary).toBeGreaterThan(0);
    });
  });

  describe("Utility Functions", () => {
    it("should format rupiah correctly", () => {
      expect(formatRupiah(1_000_000)).toMatch(/1\.000\.000/);
      expect(formatRupiah(15_500_000)).toMatch(/15\.500\.000/);
    });
  });
});
