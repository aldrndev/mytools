import {
  calculateGrossSalary,
  calculateAllDeductions,
  calculateNetSalary,
  formatRupiah,
  type CompanyInfo,
  type EmployeeInfo,
  type Earnings,
  type DeductionsConfig,
  type PayrollPeriod,
  type CalculatedDeductions,
  type TemplateId,
  type SlipTheme,
  type Orientation,
} from "@pdf-editor/shared";

export const TEMPLATES = [
  {
    id: "formal_standar" as const,
    name: "Standar",
    description: "Format dasar slip gaji",
  },
  {
    id: "formal_bordered" as const,
    name: "Berbingkai",
    description: "Dengan border lengkap",
  },
  {
    id: "formal_compact" as const,
    name: "Kompak",
    description: "Format hemat ruang",
  },
  {
    id: "formal_detailed" as const,
    name: "Detail",
    description: "Informasi lengkap",
  },
  {
    id: "formal_executive" as const,
    name: "Eksekutif",
    description: "Format ringkas profesional",
  },
  {
    id: "formal_simple" as const,
    name: "Simpel",
    description: "Minimalis tanpa hiasan",
  },
  {
    id: "formal_corporate" as const,
    name: "Korporat",
    description: "Gaya perusahaan besar",
  },
  {
    id: "formal_classic" as const,
    name: "Klasik",
    description: "Tampilan tradisional",
  },
  {
    id: "formal_clean" as const,
    name: "Bersih",
    description: "Ruang putih lega",
  },
  {
    id: "formal_professional" as const,
    name: "Profesional",
    description: "Kesan formal kuat",
  },
  {
    id: "formal_elegant" as const,
    name: "Elegan",
    description: "Sentuhan tipografi halus",
  },
  {
    id: "formal_business" as const,
    name: "Bisnis",
    description: "Format standar bisnis",
  },
  {
    id: "formal_structured" as const,
    name: "Terstruktur",
    description: "Grid yang rapi",
  },
];

export interface SalarySlipResult {
  grossSalary: number;
  netSalary: number;
  deductions: CalculatedDeductions;
  company: CompanyInfo;
  employee: EmployeeInfo;
  period: PayrollPeriod;
  earnings: Earnings;
  generatedAt: string;
}

export function calculateSalarySlip(
  company: CompanyInfo,
  employee: EmployeeInfo,
  period: PayrollPeriod,
  earnings: Earnings,
  deductionsConfig: DeductionsConfig
): SalarySlipResult {
  const grossSalary = calculateGrossSalary(earnings);
  const deductions = calculateAllDeductions(
    earnings,
    deductionsConfig,
    employee.ptkpStatus
  );
  const netSalary = calculateNetSalary(grossSalary, deductions);
  return {
    grossSalary,
    netSalary,
    deductions,
    company,
    employee,
    period,
    earnings,
    generatedAt: new Date().toISOString(),
  };
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatPeriod(period: PayrollPeriod): string {
  return `${MONTH_NAMES[period.month - 1]} ${period.year}`;
}

export function generateSalarySlipHTML(
  result: SalarySlipResult,
  templateId: TemplateId,
  _theme: SlipTheme = "default",
  orientation: Orientation = "portrait",
  isPreview: boolean = false
): string {
  const {
    company,
    employee,
    period,
    earnings,
    deductions,
    grossSalary,
    netSalary,
  } = result;
  const periodText = formatPeriod(period);

  const earningsItems = [
    { label: "Gaji Pokok", amount: earnings.basicSalary },
    { label: "Tunjangan Jabatan", amount: earnings.positionAllowance },
    { label: "Tunjangan Transport", amount: earnings.transportAllowance },
    { label: "Tunjangan Makan", amount: earnings.mealAllowance },
    { label: "Tunjangan Perumahan", amount: earnings.housingAllowance },
    { label: "Tunjangan Komunikasi", amount: earnings.communicationAllowance },
    { label: "Lembur", amount: earnings.overtime },
    { label: "Bonus", amount: earnings.bonus },
    { label: "THR", amount: earnings.thr },
    ...earnings.otherEarnings.map((e) => ({ label: e.name, amount: e.amount })),
  ].filter((e) => e.amount > 0);

  const deductionItems = [
    { label: "PPh 21", amount: deductions.pph21 },
    { label: "BPJS Kesehatan", amount: deductions.bpjsKesehatanEmployee },
    { label: "BPJS JHT (2%)", amount: deductions.bpjsJhtEmployee },
    { label: "BPJS JP (1%)", amount: deductions.bpjsJpEmployee },
    ...deductions.customDeductions.map((d) => ({
      label: d.name,
      amount: d.amount,
    })),
  ].filter((d) => d.amount > 0);

  const totalDed = deductionItems.reduce((a, b) => a + b.amount, 0);
  const printScript = !isPreview
    ? `<script>window.onload=function(){setTimeout(function(){window.print();},500);};</script>`
    : "";

  const data = {
    company,
    employee,
    periodText,
    earningsItems,
    deductionItems,
    grossSalary,
    netSalary,
    totalDed,
    orientation,
    printScript,
  };

  switch (templateId) {
    case "formal_bordered":
      return generateTemplate(data, "bordered");
    case "formal_compact":
      return generateTemplate(data, "compact");
    case "formal_detailed":
      return generateTemplate(data, "detailed");
    case "formal_executive":
      return generateTemplate(data, "executive");
    case "formal_simple":
      return generateTemplate(data, "simple");
    case "formal_corporate":
      return generateTemplate(data, "corporate");
    case "formal_classic":
      return generateTemplate(data, "classic");
    case "formal_clean":
      return generateTemplate(data, "clean");
    case "formal_professional":
      return generateTemplate(data, "professional");
    case "formal_elegant":
      return generateTemplate(data, "elegant");
    case "formal_business":
      return generateTemplate(data, "business");
    case "formal_structured":
      return generateTemplate(data, "structured");
    case "formal_standar":
    default:
      return generateTemplate(data, "standar");
  }
}

interface TemplateData {
  company: CompanyInfo;
  employee: EmployeeInfo;
  periodText: string;
  earningsItems: Array<{ label: string; amount: number }>;
  deductionItems: Array<{ label: string; amount: number }>;
  grossSalary: number;
  netSalary: number;
  totalDed: number;
  orientation: Orientation;
  printScript: string;
}

// ============================================
// SHARED COMPONENTS - Hide empty fields
// ============================================

function getBaseCSS(orientation: Orientation): string {
  // A4 dimensions in mm
  const width = orientation === "landscape" ? "297mm" : "210mm";
  const height = orientation === "landscape" ? "210mm" : "297mm";

  return `
    @page { 
      size: A4 ${orientation};
      margin: 0; 
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    html, body {
      width: 100%;
      height: 100%;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
      line-height: 1.3; /* Tighter line height for professional look */
      color: #111;
      background: #fff;
    }

    .container {
      width: 100%;
      display: flex;
      flex-direction: column;
      padding: 15mm; 
      min-height: 100vh;
      margin: 0 auto;
    }

    @media screen {
      .container {
        max-width: ${orientation === "landscape" ? "1000px" : "800px"};
        border: 1px solid #ccc; /* Darker border for visibility */
        margin: 20px auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    }

    @media print {
      body { width: ${width}; height: ${height}; }
      .container {
        width: ${width};
        /* Use auto height for print so footer flows naturally */
        height: auto; 
        min-height: 0;
        padding: 15mm 20mm; 
        box-shadow: none;
        margin: 0;
        border: none;
      }
    }

    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 5px 8px; text-align: left; vertical-align: top; }
    
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 600; }
  `;
}

// Company header - only shows filled fields
function companySection(
  c: CompanyInfo,
  style: "inline" | "block" | "centered" = "inline"
): string {
  const logo = c.logoBase64 || c.logoUrl;
  const logoImg = logo
    ? `<img src="${logo}" alt="" style="height:40px;max-width:120px;object-fit:contain;">`
    : "";
  const details = [
    c.address,
    c.phone ? `Tel: ${c.phone}` : "",
    c.email,
    c.npwp ? `NPWP: ${c.npwp}` : "",
  ].filter(Boolean);

  if (style === "centered") {
    return `<div style="text-align:center;margin-bottom:16px;">
      ${logoImg ? `<div style="margin-bottom:8px;">${logoImg}</div>` : ""}
      <div style="font-size:15px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${
        c.name
      }</div>
      ${
        details.length
          ? `<div style="font-size:9px;color:#555;margin-top:4px;">${details.join(
              " | "
            )}</div>`
          : ""
      }
    </div>`;
  }

  if (style === "block") {
    return `<div style="margin-bottom:16px;">
      ${logoImg ? `<div style="margin-bottom:8px;">${logoImg}</div>` : ""}
      <div style="font-size:14px;font-weight:600;">${c.name}</div>
      ${
        details.length
          ? `<div style="font-size:9px;color:#555;margin-top:3px;">${details.join(
              "<br>"
            )}</div>`
          : ""
      }
    </div>`;
  }

  return `<div style="display:flex;align-items:center;gap:12px;">
    ${logoImg}
    <div>
      <div style="font-size:14px;font-weight:600;">${c.name}</div>
      ${
        details.length
          ? `<div style="font-size:9px;color:#555;margin-top:3px;">${details.join(
              " | "
            )}</div>`
          : ""
      }
    </div>
  </div>`;
}

// Employee table - only shows filled fields (hide empty)
function employeeTable(e: EmployeeInfo, cols: 2 | 3 = 2): string {
  const items: [string, string][] = [];

  // Only add fields that have values
  items.push(["Nama Karyawan", e.name]);
  items.push(["NIK", e.employeeId]);
  if (e.position) items.push(["Jabatan", e.position]);
  if (e.department) items.push(["Departemen", e.department]);
  items.push(["Status PTKP", e.ptkpStatus]);
  if (e.npwp) items.push(["NPWP", e.npwp]);
  if (e.bankName) items.push(["Bank", e.bankName]);
  if (e.bankAccount) items.push(["No. Rekening", e.bankAccount]);

  const rows = [];
  for (let i = 0; i < items.length; i += cols) {
    const cells = items
      .slice(i, i + cols)
      .map(
        ([l, v]) =>
          `<td style="width:${
            cols === 3 ? "15%" : "18%"
          };color:#555;font-size:9px;padding:5px 8px;">${l}</td><td style="font-weight:500;padding:5px 8px;">${v}</td>`
      )
      .join("");
    rows.push(`<tr>${cells}</tr>`);
  }

  return `<table style="margin-bottom:16px;background:#f9f9f9;"><tbody>${rows.join(
    ""
  )}</tbody></table>`;
}

// Employee inline - only shows filled fields
function employeeInline(e: EmployeeInfo): string {
  const parts = [e.name, e.employeeId];
  if (e.position) parts.push(e.position);
  if (e.department) parts.push(e.department);
  parts.push(`PTKP: ${e.ptkpStatus}`);
  return parts.join(" | ");
}

// Employee cards - only shows filled fields
function employeeCards(e: EmployeeInfo): string {
  const items: { label: string; value: string }[] = [];
  items.push({ label: "Nama", value: e.name });
  items.push({ label: "NIK", value: e.employeeId });
  if (e.position) items.push({ label: "Jabatan", value: e.position });
  if (e.department) items.push({ label: "Departemen", value: e.department });

  return items
    .map(
      (i) =>
        `<div><div style="font-size:9px;color:#666;">${i.label}</div><div style="font-weight:600;">${i.value}</div></div>`
    )
    .join("");
}

// Employee sidebar - only shows filled fields
function employeeSidebar(e: EmployeeInfo): string {
  const items: { label: string; value: string }[] = [];
  items.push({ label: "Nama", value: e.name });
  items.push({ label: "NIK", value: e.employeeId });
  if (e.position) items.push({ label: "Jabatan", value: e.position });
  if (e.department) items.push({ label: "Departemen", value: e.department });
  items.push({ label: "PTKP", value: e.ptkpStatus });
  if (e.bankName)
    items.push({
      label: "Bank",
      value: `${e.bankName}${e.bankAccount ? ` - ${e.bankAccount}` : ""}`,
    });

  return items
    .map(
      (i) =>
        `<div style="margin-bottom:10px;"><div style="font-size:8px;opacity:0.7;text-transform:uppercase;">${i.label}</div><div style="font-size:11px;">${i.value}</div></div>`
    )
    .join("");
}

function dataTable(
  title: string,
  items: Array<{ label: string; amount: number }>,
  total: number,
  totalLabel: string
): string {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 10px;">${
          i.label
        }</td><td class="text-right" style="padding:6px 10px;">${formatRupiah(
          i.amount
        )}</td></tr>`
    )
    .join("");
  return `<div>
    <div style="background:#e8e8e8;padding:8px 10px;font-weight:600;font-size:10px;border:1px solid #ccc;border-bottom:none;">${title}</div>
    <table style="border:1px solid #ccc;">
      <tbody>${rows}</tbody>
      <tfoot><tr style="background:#f0f0f0;font-weight:600;border-top:2px solid #999;"><td style="padding:8px 10px;">${totalLabel}</td><td class="text-right" style="padding:8px 10px;">${formatRupiah(
    total
  )}</td></tr></tfoot>
    </table>
  </div>`;
}

function netPayBox(
  amount: number,
  style: "dark" | "bordered" | "light" = "dark"
): string {
  if (style === "bordered") {
    return `<div style="border:2px solid #333;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
      <span style="font-weight:600;font-size:11px;">GAJI BERSIH (Take Home Pay)</span>
      <span style="font-size:18px;font-weight:700;">${formatRupiah(
        amount
      )}</span>
    </div>`;
  }
  if (style === "light") {
    return `<div style="background:#f0f0f0;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-top:16px;border:1px solid #ccc;">
      <span style="font-weight:600;font-size:11px;">GAJI BERSIH (Take Home Pay)</span>
      <span style="font-size:18px;font-weight:700;">${formatRupiah(
        amount
      )}</span>
    </div>`;
  }
  return `<div style="background:#444;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
    <span style="font-weight:600;font-size:11px;">GAJI BERSIH (Take Home Pay)</span>
    <span style="font-size:18px;font-weight:700;">${formatRupiah(amount)}</span>
  </div>`;
}

function footer(): string {
  return `<div style="margin-top:30px;padding-top:10px;border-top:1px solid #ccc;text-align:center;font-size:8px;color:#666;">Dokumen ini dicetak secara otomatis oleh sistem dan sah tanpa tanda tangan.</div>`;
}

// ============================================
// 13 TEMPLATE VARIATIONS
// ============================================

function generateTemplate(d: TemplateData, variant: string): string {
  const {
    company,
    employee,
    periodText,
    earningsItems,
    deductionItems,
    grossSalary,
    netSalary,
    totalDed,
    orientation,
    printScript,
  } = d;
  const css = getBaseCSS(orientation);
  const isLandscape = orientation === "landscape";

  switch (variant) {
    // 1. STANDAR
    case "standar":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 18px; }
      </style>${printScript}</head><body><div class="container">
        <div class="header">${companySection(
          company
        )}<div style="text-align:right;"><div style="font-size:12px;font-weight:600;">SLIP GAJI</div><div style="font-size:10px;color:#555;">${periodText}</div></div></div>
        ${employeeTable(employee, isLandscape ? 3 : 2)}
        <div style="display:grid;grid-template-columns:${
          isLandscape ? "1fr 1fr" : "1fr"
        };gap:16px;margin-bottom:16px;">
          ${dataTable(
            "PENDAPATAN",
            earningsItems,
            grossSalary,
            "Total Pendapatan"
          )}
          ${dataTable("POTONGAN", deductionItems, totalDed, "Total Potongan")}
        </div>
        ${netPayBox(netSalary)}
        ${footer()}
      </div></body></html>`;

    // 2. BORDERED
    case "bordered":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        .outer { border: 2px solid #333; padding: 20px; }
        .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 12px; margin-bottom: 16px; }
      </style>${printScript}</head><body><div class="container"><div class="outer">
        <div class="header">${companySection(
          company,
          "centered"
        )}<div style="font-size:12px;font-weight:600;margin-top:10px;text-transform:uppercase;letter-spacing:1px;">Slip Gaji Karyawan</div><div style="font-size:10px;color:#555;">${periodText}</div></div>
        ${employeeTable(employee, isLandscape ? 3 : 2)}
        <div style="display:grid;grid-template-columns:${
          isLandscape ? "1fr 1fr" : "1fr"
        };gap:16px;margin-bottom:16px;">
          ${dataTable(
            "PENDAPATAN",
            earningsItems,
            grossSalary,
            "Total Pendapatan"
          )}
          ${dataTable("POTONGAN", deductionItems, totalDed, "Total Potongan")}
        </div>
        ${netPayBox(netSalary, "bordered")}
        ${footer()}
      </div></div></body></html>`;

    // 3. COMPACT
    case "compact":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        body { font-size: 9px; }
        .header { display: flex; justify-content: space-between; border-bottom: 1px solid #999; padding-bottom: 8px; margin-bottom: 12px; }
      </style>${printScript}</head><body><div class="container">
        <div class="header">
          ${companySection(company)}
          <div style="font-size:9px;color:#555;text-align:right;">${periodText}</div>
        </div>
        <div style="font-size:9px;color:#555;margin-bottom:12px;">${employeeInline(
          employee
        )}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px;">
          <div><div style="font-weight:600;margin-bottom:6px;font-size:10px;">Pendapatan</div>${earningsItems
            .map(
              (e) =>
                `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dotted #ddd;"><span>${
                  e.label
                }</span><span>${formatRupiah(e.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:600;border-top:1px solid #999;margin-top:6px;"><span>Total</span><span>${formatRupiah(
        grossSalary
      )}</span></div></div>
          <div><div style="font-weight:600;margin-bottom:6px;font-size:10px;">Potongan</div>${deductionItems
            .map(
              (d) =>
                `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dotted #ddd;"><span>${
                  d.label
                }</span><span>${formatRupiah(d.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:600;border-top:1px solid #999;margin-top:6px;"><span>Total</span><span>${formatRupiah(
        totalDed
      )}</span></div></div>
        </div>
        <div style="background:#444;color:#fff;padding:10px 14px;display:flex;justify-content:space-between;font-weight:600;"><span>GAJI BERSIH</span><span style="font-size:14px;">${formatRupiah(
          netSalary
        )}</span></div>
      </div></body></html>`;

    // 4. DETAILED
    case "detailed":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        .section { margin-bottom: 16px; }
        .section-title { background: #e5e5e5; padding: 8px 12px; font-weight: 600; font-size: 10px; border-left: 3px solid #666; margin-bottom: 10px; }
      </style>${printScript}</head><body><div class="container">
        <div style="text-align:center;margin-bottom:18px;">${companySection(
          company,
          "centered"
        )}<div style="font-size:13px;font-weight:600;margin-top:8px;text-transform:uppercase;">Slip Gaji Karyawan</div><div style="font-size:10px;color:#555;">Periode: ${periodText}</div></div>
        <div class="section"><div class="section-title">DATA KARYAWAN</div>${employeeTable(
          employee,
          isLandscape ? 3 : 2
        )}</div>
        <div style="display:grid;grid-template-columns:${
          isLandscape ? "1fr 1fr" : "1fr"
        };gap:16px;">
          <div class="section"><div class="section-title">PENDAPATAN</div>${earningsItems
            .map(
              (e) =>
                `<div style="display:flex;justify-content:space-between;padding:6px 12px;border-bottom:1px solid #eee;"><span>${
                  e.label
                }</span><span>${formatRupiah(e.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:8px 12px;font-weight:600;background:#f0f0f0;border-top:1px solid #aaa;"><span>Total Pendapatan</span><span>${formatRupiah(
        grossSalary
      )}</span></div></div>
          <div class="section"><div class="section-title">POTONGAN</div>${deductionItems
            .map(
              (d) =>
                `<div style="display:flex;justify-content:space-between;padding:6px 12px;border-bottom:1px solid #eee;"><span>${
                  d.label
                }</span><span>${formatRupiah(d.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:8px 12px;font-weight:600;background:#f0f0f0;border-top:1px solid #aaa;"><span>Total Potongan</span><span>${formatRupiah(
        totalDed
      )}</span></div></div>
        </div>
        ${netPayBox(netSalary)}
        ${footer()}
      </div></body></html>`;

    // 5. EXECUTIVE
    case "executive":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
        .summary-box { padding: 16px; background: #f5f5f5; text-align: center; }
        .summary-label { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-value { font-size: 16px; font-weight: 700; margin-top: 6px; }
      </style>${printScript}</head><body><div class="container">
        <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid #ccc;margin-bottom:18px;">
          ${companySection(company)}
          <div style="text-align:right;"><div style="font-size:9px;color:#666;text-transform:uppercase;">Slip Gaji</div><div style="font-size:12px;font-weight:600;">${periodText}</div></div>
        </div>
        <div style="display:flex;gap:24px;margin-bottom:18px;padding:12px;background:#fafafa;">${employeeCards(
          employee
        )}</div>
        <div class="summary-grid">
          <div class="summary-box"><div class="summary-label">Total Pendapatan</div><div class="summary-value">${formatRupiah(
            grossSalary
          )}</div></div>
          <div class="summary-box"><div class="summary-label">Total Potongan</div><div class="summary-value">${formatRupiah(
            totalDed
          )}</div></div>
          <div class="summary-box" style="background:#e8e8e8;"><div class="summary-label">Gaji Bersih</div><div class="summary-value" style="font-size:20px;">${formatRupiah(
            netSalary
          )}</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:9px;color:#666;">
          <div><div style="font-weight:600;color:#333;margin-bottom:8px;">Rincian Pendapatan</div>${earningsItems
            .map(
              (e) =>
                `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #ddd;"><span>${
                  e.label
                }</span><span>${formatRupiah(e.amount)}</span></div>`
            )
            .join("")}</div>
          <div><div style="font-weight:600;color:#333;margin-bottom:8px;">Rincian Potongan</div>${deductionItems
            .map(
              (d) =>
                `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #ddd;"><span>${
                  d.label
                }</span><span>${formatRupiah(d.amount)}</span></div>`
            )
            .join("")}</div>
        </div>
        ${footer()}
      </div></body></html>`;

    // 6. SIMPLE
    case "simple":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}</style>${printScript}</head><body><div class="container">
        <div style="margin-bottom:18px;border-bottom:1px solid #ddd;padding-bottom:12px;">
          ${companySection(company)}
          <div style="font-size:10px;color:#666;margin-top:6px;">${
            employee.name
          } | ${employee.employeeId} | ${periodText}</div>
        </div>
        <div style="display:grid;grid-template-columns:${
          isLandscape ? "1fr 1fr" : "1fr"
        };gap:16px;">
          <div style="margin-bottom:16px;"><div style="font-weight:600;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #ddd;">Pendapatan</div>${earningsItems
            .map(
              (e) =>
                `<div style="display:flex;justify-content:space-between;padding:5px 0;"><span>${
                  e.label
                }</span><span>${formatRupiah(e.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:600;border-top:1px solid #999;margin-top:8px;"><span>Total</span><span>${formatRupiah(
        grossSalary
      )}</span></div></div>
          <div style="margin-bottom:16px;"><div style="font-weight:600;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #ddd;">Potongan</div>${deductionItems
            .map(
              (d) =>
                `<div style="display:flex;justify-content:space-between;padding:5px 0;"><span>${
                  d.label
                }</span><span>${formatRupiah(d.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:600;border-top:1px solid #999;margin-top:8px;"><span>Total</span><span>${formatRupiah(
        totalDed
      )}</span></div></div>
        </div>
        ${netPayBox(netSalary, "light")}
      </div></body></body></html>`;

    // 7. CORPORATE
    case "corporate":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        .header-bar { background: #4a4a4a; color: #fff; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 20px; }
      </style>${printScript}</head><body><div class="container">
        <div style="margin-bottom:5px;">${companySection(company)}</div>
        <div class="header-bar">
          <div style="font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">SLIP GAJI KARYAWAN</div>
          <div style="font-size:11px;">${periodText}</div>
        </div>
        <div>
          ${employeeTable(employee, isLandscape ? 3 : 2)}
          <div style="display:grid;grid-template-columns:${
            isLandscape ? "1fr 1fr" : "1fr"
          };gap:16px;margin-bottom:16px;">
            ${dataTable("PENDAPATAN", earningsItems, grossSalary, "Total")}
            ${dataTable("POTONGAN", deductionItems, totalDed, "Total")}
          </div>
          ${netPayBox(netSalary)}
          ${footer()}
        </div>
      </div></body></html>`;

    // 8. CLASSIC
    case "classic":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 15px; margin-bottom: 20px; }
      </style>${printScript}</head><body><div class="container">
        <div class="header">
          ${companySection(company, "centered")}
          <div style="font-size:12px;margin-top:10px;text-decoration:underline;font-weight:600;">SLIP GAJI / PAYSLIP</div>
          <div style="font-size:10px;color:#555;">${periodText}</div>
        </div>
        ${employeeTable(employee, isLandscape ? 3 : 2)}
        <div style="display:grid;grid-template-columns:${
          isLandscape ? "1fr 1fr" : "1fr"
        };gap:16px;margin-bottom:16px;">
          <table style="border:1px solid #999;"><thead><tr style="background:#666;color:#fff;"><th style="padding:8px 10px;">PENDAPATAN</th><th class="text-right" style="padding:8px 10px;">JUMLAH</th></tr></thead><tbody>${earningsItems
            .map(
              (e) =>
                `<tr style="border-bottom:1px solid #ccc;"><td style="padding:6px 10px;">${
                  e.label
                }</td><td class="text-right" style="padding:6px 10px;">${formatRupiah(
                  e.amount
                )}</td></tr>`
            )
            .join(
              ""
            )}<tr style="background:#e8e8e8;font-weight:600;"><td style="padding:8px 10px;">TOTAL</td><td class="text-right" style="padding:8px 10px;">${formatRupiah(
        grossSalary
      )}</td></tr></tbody></table>
          <table style="border:1px solid #999;"><thead><tr style="background:#666;color:#fff;"><th style="padding:8px 10px;">POTONGAN</th><th class="text-right" style="padding:8px 10px;">JUMLAH</th></tr></thead><tbody>${deductionItems
            .map(
              (d) =>
                `<tr style="border-bottom:1px solid #ccc;"><td style="padding:6px 10px;">${
                  d.label
                }</td><td class="text-right" style="padding:6px 10px;">${formatRupiah(
                  d.amount
                )}</td></tr>`
            )
            .join(
              ""
            )}<tr style="background:#e8e8e8;font-weight:600;"><td style="padding:8px 10px;">TOTAL</td><td class="text-right" style="padding:8px 10px;">${formatRupiah(
        totalDed
      )}</td></tr></tbody></table>
        </div>
        <table style="width:50%;margin-left:auto;"><tr style="background:#444;color:#fff;"><td style="padding:12px;font-weight:600;">GAJI BERSIH</td><td class="text-right" style="padding:12px;font-size:16px;font-weight:700;">${formatRupiah(
          netSalary
        )}</td></tr></table>
        ${footer()}
      </div></body></html>`;

    // 9. CLEAN
    case "clean":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        body { font-size: 11px; }
      </style>${printScript}</head><body><div class="container">
        <div style="margin-bottom:25px;border-bottom:1px solid #eee;padding-bottom:15px;display:flex;justify-content:space-between;align-items:flex-end;">
          ${companySection(company)}
          <div style="font-size:11px;color:#888;">${periodText}</div>
        </div>
        <div style="padding:16px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd;margin-bottom:24px;display:flex;gap:36px;">${employeeCards(
          employee
        )}</div>
        <div style="display:grid;grid-template-columns:${
          isLandscape ? "1fr 1fr" : "1fr"
        };gap:36px;margin-bottom:24px;">
          <div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Pendapatan</div>${earningsItems
            .map(
              (e) =>
                `<div style="display:flex;justify-content:space-between;padding:7px 0;"><span>${
                  e.label
                }</span><span>${formatRupiah(e.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:10px 0;font-weight:600;border-top:1px solid #333;margin-top:10px;"><span>Total</span><span>${formatRupiah(
        grossSalary
      )}</span></div></div>
          <div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Potongan</div>${deductionItems
            .map(
              (d) =>
                `<div style="display:flex;justify-content:space-between;padding:7px 0;"><span>${
                  d.label
                }</span><span>${formatRupiah(d.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:10px 0;font-weight:600;border-top:1px solid #333;margin-top:10px;"><span>Total</span><span>${formatRupiah(
        totalDed
      )}</span></div></div>
        </div>
        <div style="text-align:center;padding:24px;border:1px solid #333;"><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Gaji Bersih</div><div style="font-size:28px;font-weight:700;margin-top:8px;">${formatRupiah(
          netSalary
        )}</div></div>
      </div></body></html>`;

    // 10. PROFESSIONAL
    case "professional":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        .header-bar { background: #555; color: #fff; padding: 10px 15px; display: flex; justify-content: space-between; margin-bottom: 20px; }
      </style>${printScript}</head><body><div class="container">
        <div style="margin-bottom:5px;">${companySection(company)}</div>
        <div class="header-bar"><div style="font-size:12px;font-weight:600;letter-spacing:1px;">SLIP GAJI</div><div>${periodText}</div></div>
        <div>
          ${employeeTable(employee, isLandscape ? 3 : 2)}
          <div style="display:grid;grid-template-columns:${
            isLandscape ? "1fr 1fr" : "1fr"
          };gap:16px;margin-bottom:16px;">
            <div style="border:1px solid #ddd;"><div style="background:#666;color:#fff;padding:8px 12px;font-weight:600;font-size:10px;">PENDAPATAN</div>${earningsItems
              .map(
                (e) =>
                  `<div style="display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid #eee;"><span>${
                    e.label
                  }</span><span>${formatRupiah(e.amount)}</span></div>`
              )
              .join(
                ""
              )}<div style="display:flex;justify-content:space-between;padding:8px 12px;font-weight:600;background:#f0f0f0;border-top:1px solid #aaa;"><span>Total</span><span>${formatRupiah(
        grossSalary
      )}</span></div></div>
            <div style="border:1px solid #ddd;"><div style="background:#666;color:#fff;padding:8px 12px;font-weight:600;font-size:10px;">POTONGAN</div>${deductionItems
              .map(
                (d) =>
                  `<div style="display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid #eee;"><span>${
                    d.label
                  }</span><span>${formatRupiah(d.amount)}</span></div>`
              )
              .join(
                ""
              )}<div style="display:flex;justify-content:space-between;padding:8px 12px;font-weight:600;background:#f0f0f0;border-top:1px solid #aaa;"><span>Total</span><span>${formatRupiah(
        totalDed
      )}</span></div></div>
          </div>
          ${netPayBox(netSalary)}
          ${footer()}
        </div>
      </div></body></html>`;

    // 11. ELEGANT
    case "elegant":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}</style>${printScript}</head><body><div class="container">
        <div style="text-align:center;padding-bottom:15px;margin-bottom:20px;border-bottom:1px solid #999;">
          ${companySection(company, "centered")}
          <div style="margin-top:10px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:2px;">Slip Gaji &bull; ${periodText}</div>
        </div>
        <div style="display:flex;justify-content:center;gap:28px;margin-bottom:20px;padding:12px;background:#f5f5f5;">
          ${[
            { l: "Nama", v: employee.name },
            { l: "NIK", v: employee.employeeId },
            ...(employee.position
              ? [{ l: "Jabatan", v: employee.position }]
              : []),
            { l: "PTKP", v: employee.ptkpStatus },
          ]
            .map(
              (i) =>
                `<div style="text-align:center;"><div style="font-size:8px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">${i.l}</div><div style="font-weight:600;">${i.v}</div></div>`
            )
            .join("")}
        </div>
        <div style="display:grid;grid-template-columns:${
          isLandscape ? "1fr 1fr" : "1fr"
        };gap:28px;margin-bottom:20px;">
          <div><div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;padding-bottom:8px;border-bottom:1px solid #ddd;margin-bottom:10px;">Pendapatan</div>${earningsItems
            .map(
              (e) =>
                `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted #ddd;"><span>${
                  e.label
                }</span><span>${formatRupiah(e.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:10px 0;font-weight:600;border-top:1px solid #999;margin-top:8px;"><span>Total</span><span>${formatRupiah(
        grossSalary
      )}</span></div></div>
          <div><div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;padding-bottom:8px;border-bottom:1px solid #ddd;margin-bottom:10px;">Potongan</div>${deductionItems
            .map(
              (d) =>
                `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted #ddd;"><span>${
                  d.label
                }</span><span>${formatRupiah(d.amount)}</span></div>`
            )
            .join(
              ""
            )}<div style="display:flex;justify-content:space-between;padding:10px 0;font-weight:600;border-top:1px solid #999;margin-top:8px;"><span>Total</span><span>${formatRupiah(
        totalDed
      )}</span></div></div>
        </div>
        <div style="text-align:center;padding:20px;border:2px solid #333;"><div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1.5px;">Gaji Bersih Diterima</div><div style="font-size:26px;font-weight:700;margin-top:8px;">${formatRupiah(
          netSalary
        )}</div></div>
        ${footer()}
      </div></body></html>`;

    // 12. BUSINESS
    case "business":
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 16px; }
      </style>${printScript}</head><body><div class="container">
        <div class="header">${companySection(
          company,
          "block"
        )}<div style="text-align:right;"><div style="font-size:9px;color:#666;text-transform:uppercase;">Slip Gaji</div><div style="font-size:12px;font-weight:600;">${periodText}</div></div></div>
        ${employeeTable(employee, isLandscape ? 3 : 2)}
        <div style="display:grid;grid-template-columns:${
          isLandscape ? "1fr 1fr" : "1fr"
        };gap:16px;margin-bottom:16px;">
          <table style="border:1px solid #ccc;"><thead><tr style="background:#e0e0e0;"><th style="font-size:10px;text-transform:uppercase;padding:8px 10px;">Pendapatan</th><th class="text-right" style="font-size:10px;padding:8px 10px;">Jumlah</th></tr></thead><tbody>${earningsItems
            .map(
              (e) =>
                `<tr style="border-bottom:1px solid #eee;"><td style="padding:6px 10px;">${
                  e.label
                }</td><td class="text-right" style="padding:6px 10px;">${formatRupiah(
                  e.amount
                )}</td></tr>`
            )
            .join(
              ""
            )}<tr style="font-weight:600;background:#f0f0f0;border-top:1px solid #999;"><td style="padding:8px 10px;">Total</td><td class="text-right" style="padding:8px 10px;">${formatRupiah(
        grossSalary
      )}</td></tr></tbody></table>
          <table style="border:1px solid #ccc;"><thead><tr style="background:#e0e0e0;"><th style="font-size:10px;text-transform:uppercase;padding:8px 10px;">Potongan</th><th class="text-right" style="font-size:10px;padding:8px 10px;">Jumlah</th></tr></thead><tbody>${deductionItems
            .map(
              (d) =>
                `<tr style="border-bottom:1px solid #eee;"><td style="padding:6px 10px;">${
                  d.label
                }</td><td class="text-right" style="padding:6px 10px;">${formatRupiah(
                  d.amount
                )}</td></tr>`
            )
            .join(
              ""
            )}<tr style="font-weight:600;background:#f0f0f0;border-top:1px solid #999;"><td style="padding:8px 10px;">Total</td><td class="text-right" style="padding:8px 10px;">${formatRupiah(
        totalDed
      )}</td></tr></tbody></table>
        </div>
        ${netPayBox(netSalary)}
        ${footer()}
      </div></body></html>`;

    // 13. STRUCTURED
    case "structured":
    default:
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Slip Gaji - ${
        employee.name
      }</title><style>${css}
        .grid-layout { display: grid; grid-template-columns: 200px 1fr; border: 1px solid #ccc; }
        .sidebar { background: #333; color: #fff; padding: 20px 15px; }
        .main { padding: 20px; }
      </style>${printScript}</head><body><div class="container">
        <div class="grid-layout">
          <div class="sidebar">
            <div style="margin-bottom:20px;border-bottom:1px solid #555;padding-bottom:15px;">
              ${
                company.logoBase64 || company.logoUrl
                  ? `<img src="${
                      company.logoBase64 || company.logoUrl
                    }" style="width:100%;max-width:80px;margin-bottom:10px;display:block;">`
                  : ""
              }
              <div style="font-size:14px;font-weight:600;line-height:1.3;">${
                company.name
              }</div>
              <div style="font-size:9px;color:#aaa;margin-top:5px;">${
                company.address || ""
              }</div>
            </div>
            ${employeeSidebar(employee)}
          </div>
          <div class="main">
            <div style="background:#e8e8e8;padding:8px 12px;margin-bottom:14px;display:flex;justify-content:space-between;"><span style="font-weight:600;">SLIP GAJI</span><span>${periodText}</span></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
              <div><div style="background:#ddd;padding:6px 10px;font-weight:600;font-size:9px;margin-bottom:8px;">Pendapatan</div>${earningsItems
                .map(
                  (e) =>
                    `<div style="display:flex;justify-content:space-between;padding:5px 10px;border-bottom:1px solid #eee;"><span>${
                      e.label
                    }</span><span>${formatRupiah(e.amount)}</span></div>`
                )
                .join(
                  ""
                )}<div style="display:flex;justify-content:space-between;padding:6px 10px;font-weight:600;background:#f0f0f0;"><span>Total</span><span>${formatRupiah(
        grossSalary
      )}</span></div></div>
              <div><div style="background:#ddd;padding:6px 10px;font-weight:600;font-size:9px;margin-bottom:8px;">Potongan</div>${deductionItems
                .map(
                  (d) =>
                    `<div style="display:flex;justify-content:space-between;padding:5px 10px;border-bottom:1px solid #eee;"><span>${
                      d.label
                    }</span><span>${formatRupiah(d.amount)}</span></div>`
                )
                .join(
                  ""
                )}<div style="display:flex;justify-content:space-between;padding:6px 10px;font-weight:600;background:#f0f0f0;"><span>Total</span><span>${formatRupiah(
        totalDed
      )}</span></div></div>
            </div>
            <div style="background:#333;color:#fff;padding:12px 14px;display:flex;justify-content:space-between;"><span style="font-weight:600;">GAJI BERSIH</span><span style="font-size:16px;font-weight:700;">${formatRupiah(
              netSalary
            )}</span></div>
          </div>
        </div>
      </div></body></html>`;
  }
}
