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
} from "@pdf-editor/shared";

// Template metadata
export const TEMPLATES = [
  {
    id: "modern" as const,
    name: "Modern Professional",
    description: "Clean gradient design with card-based layout",
  },
  {
    id: "classic" as const,
    name: "Corporate Classic",
    description: "Traditional formal design with bordered tables",
  },
  {
    id: "minimal" as const,
    name: "Minimal Clean",
    description: "Simple whitespace-focused design",
  },
  {
    id: "indonesian" as const,
    name: "Indonesian Standard",
    description: "Standard Indonesian slip gaji format",
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

// Month names in Indonesian
const MONTH_NAMES_ID = [
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
  return `${MONTH_NAMES_ID[period.month - 1]} ${period.year}`;
}

// Generate HTML for salary slip based on template
export function generateSalarySlipHTML(
  result: SalarySlipResult,
  templateId: TemplateId
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

  // Common data formatting
  const periodText = formatPeriod(period);

  // Earnings items
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

  // Deduction items (employee portion only)
  const deductionItems = [
    { label: "PPh 21", amount: deductions.pph21 },
    { label: "BPJS Kesehatan", amount: deductions.bpjsKesehatanEmployee },
    { label: "BPJS JHT", amount: deductions.bpjsJhtEmployee },
    { label: "BPJS JP", amount: deductions.bpjsJpEmployee },
    ...deductions.customDeductions.map((d) => ({
      label: d.name,
      amount: d.amount,
    })),
  ].filter((d) => d.amount > 0);

  // Generate based on template
  switch (templateId) {
    case "modern":
      return generateModernTemplate(
        company,
        employee,
        periodText,
        earningsItems,
        deductionItems,
        grossSalary,
        netSalary
      );
    case "classic":
      return generateClassicTemplate(
        company,
        employee,
        periodText,
        earningsItems,
        deductionItems,
        grossSalary,
        netSalary
      );
    case "minimal":
      return generateMinimalTemplate(
        company,
        employee,
        periodText,
        earningsItems,
        deductionItems,
        grossSalary,
        netSalary
      );
    case "indonesian":
    default:
      return generateIndonesianTemplate(
        company,
        employee,
        periodText,
        earningsItems,
        deductionItems,
        grossSalary,
        netSalary
      );
  }
}

// Template generators
function generateModernTemplate(
  company: CompanyInfo,
  employee: EmployeeInfo,
  period: string,
  earnings: Array<{ label: string; amount: number }>,
  deductions: Array<{ label: string; amount: number }>,
  grossSalary: number,
  netSalary: number
): string {
  const generatedDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slip Gaji - ${employee.name} - ${period}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f8fafc; padding: 40px; }
    @media print { body { padding: 20px; background: white; } }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 32px; }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header p { opacity: 0.9; font-size: 13px; }
    .company-info { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .company-logo { width: 60px; height: 60px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #3b82f6; font-size: 24px; }
    .company-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 12px; }
    .content { padding: 32px; }
    .employee-card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .info-item label { font-size: 11px; color: #64748b; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-item span { font-weight: 600; color: #1e293b; font-size: 14px; }
    .items-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .earnings-card, .deductions-card { border-radius: 12px; padding: 20px; }
    .earnings-card { background: #ecfdf5; border: 1px solid #a7f3d0; }
    .deductions-card { background: #fef2f2; border: 1px solid #fecaca; }
    .section-title { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 13px; }
    .item-row:last-child { border-bottom: none; }
    .item-label { color: #475569; }
    .item-amount { font-weight: 600; }
    .total-row { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 8px; border-top: 2px solid rgba(0,0,0,0.1); font-weight: 700; font-size: 14px; }
    .summary { background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 12px; padding: 24px; text-align: center; margin-top: 24px; }
    .summary-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .summary-amount { font-size: 28px; font-weight: 700; }
    .bank-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-top: 16px; display: flex; justify-content: space-between; font-size: 13px; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        ${
          company.logoBase64
            ? `<div class="company-logo"><img src="${company.logoBase64}" alt="Logo"></div>`
            : `<div class="company-logo">${company.name.charAt(0)}</div>`
        }
        <div>
          <h1>${company.name}</h1>
          ${company.address ? `<p>${company.address}</p>` : ""}
          ${company.npwp ? `<p>NPWP: ${company.npwp}</p>` : ""}
        </div>
      </div>
      <p style="margin-top: 16px; font-size: 16px; font-weight: 500;">Slip Gaji Periode ${period}</p>
    </div>
    
    <div class="content">
      <div class="employee-card">
        <div class="info-item">
          <label>Nama Karyawan</label>
          <span>${employee.name}</span>
        </div>
        <div class="info-item">
          <label>ID Karyawan</label>
          <span>${employee.employeeId}</span>
        </div>
        <div class="info-item">
          <label>Status PTKP</label>
          <span>${employee.ptkpStatus}</span>
        </div>
        <div class="info-item">
          <label>Jabatan</label>
          <span>${employee.position || "-"}</span>
        </div>
        <div class="info-item">
          <label>Departemen</label>
          <span>${employee.department || "-"}</span>
        </div>
        <div class="info-item">
          <label>NPWP</label>
          <span>${employee.npwp || "-"}</span>
        </div>
      </div>

      <div class="items-grid">
        <div class="earnings-card">
          <div class="section-title">Pendapatan</div>
          ${earnings
            .map(
              (e) => `
            <div class="item-row">
              <span class="item-label">${e.label}</span>
              <span class="item-amount">${formatRupiah(e.amount)}</span>
            </div>
          `
            )
            .join("")}
          <div class="total-row">
            <span>Total Pendapatan</span>
            <span>${formatRupiah(grossSalary)}</span>
          </div>
        </div>

        <div class="deductions-card">
          <div class="section-title">Potongan</div>
          ${deductions
            .map(
              (d) => `
            <div class="item-row">
              <span class="item-label">${d.label}</span>
              <span class="item-amount">${formatRupiah(d.amount)}</span>
            </div>
          `
            )
            .join("")}
          <div class="total-row">
            <span>Total Potongan</span>
            <span>${formatRupiah(
              deductions.reduce((sum, d) => sum + d.amount, 0)
            )}</span>
          </div>
        </div>
      </div>

      <div class="summary">
        <div class="summary-label">Gaji Bersih (Take Home Pay)</div>
        <div class="summary-amount">${formatRupiah(netSalary)}</div>
      </div>

      ${
        employee.bankName && employee.bankAccount
          ? `
      <div class="bank-info">
        <span>Transfer ke: <strong>${employee.bankName}</strong></span>
        <span>No. Rekening: <strong>${employee.bankAccount}</strong></span>
      </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      <p>Dokumen ini dibuat secara elektronik dan sah tanpa tanda tangan.</p>
      <p style="margin-top: 4px;">Dicetak pada: ${generatedDate}</p>
    </div>
  </div>
</body>
</html>
`;
}

function generateClassicTemplate(
  company: CompanyInfo,
  employee: EmployeeInfo,
  period: string,
  earnings: Array<{ label: string; amount: number }>,
  deductions: Array<{ label: string; amount: number }>,
  grossSalary: number,
  netSalary: number
): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Slip Gaji - ${employee.name} - ${period}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; background: white; padding: 40px; font-size: 14px; }
    .container { max-width: 800px; margin: 0 auto; border: 2px solid #333; }
    .header { text-align: center; border-bottom: 2px solid #333; padding: 20px; }
    .header h1 { font-size: 20px; margin-bottom: 8px; text-transform: uppercase; }
    .header h2 { font-size: 16px; font-weight: normal; }
    .subheader { background: #f5f5f5; padding: 12px; text-align: center; border-bottom: 1px solid #333; font-weight: bold; }
    .info-section { display: flex; border-bottom: 1px solid #333; }
    .info-left, .info-right { flex: 1; padding: 16px; }
    .info-left { border-right: 1px solid #333; }
    .info-row { display: flex; margin-bottom: 8px; }
    .info-row label { width: 120px; font-weight: bold; }
    .main-table { width: 100%; border-collapse: collapse; }
    .main-table th, .main-table td { border: 1px solid #333; padding: 10px; text-align: left; }
    .main-table th { background: #e5e5e5; }
    .main-table .amount { text-align: right; }
    .total-row { font-weight: bold; background: #f5f5f5; }
    .net-row { font-weight: bold; background: #333; color: white; font-size: 16px; }
    .footer { padding: 20px; display: flex; justify-content: space-between; }
    .signature { text-align: center; width: 200px; }
    .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${company.name}</h1>
      <p>${company.address || ""}</p>
      ${company.npwp ? `<p>NPWP: ${company.npwp}</p>` : ""}
    </div>
    
    <div class="subheader">SLIP GAJI - ${period.toUpperCase()}</div>

    <div class="info-section">
      <div class="info-left">
        <div class="info-row"><label>Nama</label><span>: ${
          employee.name
        }</span></div>
        <div class="info-row"><label>ID Karyawan</label><span>: ${
          employee.employeeId
        }</span></div>
        <div class="info-row"><label>NPWP</label><span>: ${
          employee.npwp || "-"
        }</span></div>
      </div>
      <div class="info-right">
        <div class="info-row"><label>Jabatan</label><span>: ${
          employee.position || "-"
        }</span></div>
        <div class="info-row"><label>Departemen</label><span>: ${
          employee.department || "-"
        }</span></div>
        <div class="info-row"><label>Status PTKP</label><span>: ${
          employee.ptkpStatus
        }</span></div>
      </div>
    </div>

    <table class="main-table">
      <thead>
        <tr>
          <th style="width: 50%">PENDAPATAN</th>
          <th style="width: 25%" class="amount">JUMLAH</th>
          <th style="width: 25%">POTONGAN</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: Math.max(earnings.length, deductions.length) })
          .map(
            (_, i) => `
          <tr>
            <td>${earnings[i]?.label || ""}</td>
            <td class="amount">${
              earnings[i] ? formatRupiah(earnings[i].amount) : ""
            }</td>
            <td>${
              deductions[i]
                ? `${deductions[i].label}: ${formatRupiah(
                    deductions[i].amount
                  )}`
                : ""
            }</td>
          </tr>
        `
          )
          .join("")}
        <tr class="total-row">
          <td>TOTAL PENDAPATAN</td>
          <td class="amount">${formatRupiah(grossSalary)}</td>
          <td>Total Potongan: ${formatRupiah(
            deductions.reduce((sum, d) => sum + d.amount, 0)
          )}</td>
        </tr>
        <tr class="net-row">
          <td colspan="2">GAJI BERSIH (TAKE HOME PAY)</td>
          <td class="amount">${formatRupiah(netSalary)}</td>
        </tr>
      </tbody>
    </table>

    ${
      employee.bankName && employee.bankAccount
        ? `
    <div style="padding: 12px 16px; margin-top: 16px; background: #f9f9f9; border: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 12px;">
      <span>Transfer ke: <strong>${employee.bankName}</strong></span>
      <span>No. Rekening: <strong>${employee.bankAccount}</strong></span>
    </div>
    `
        : ""
    }

    <div class="footer" style="text-align: center; padding: 20px; font-size: 11px; color: #666;">
      <p>Dokumen ini dibuat secara elektronik dan sah tanpa tanda tangan.</p>
      <p style="margin-top: 8px;">Dicetak pada: ${new Date().toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      )}</p>
    </div>
  </div>
</body>
</html>
`;
}

function generateMinimalTemplate(
  company: CompanyInfo,
  employee: EmployeeInfo,
  period: string,
  earnings: Array<{ label: string; amount: number }>,
  deductions: Array<{ label: string; amount: number }>,
  grossSalary: number,
  netSalary: number
): string {
  const generatedDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Slip Gaji - ${employee.name} - ${period}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: white; padding: 60px; color: #333; font-size: 13px; }
    @media print { body { padding: 40px; } }
    .container { max-width: 600px; margin: 0 auto; }
    .header { margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid #e5e5e5; }
    .company { font-size: 22px; font-weight: 300; color: #000; margin-bottom: 4px; }
    .company-detail { font-size: 12px; color: #888; }
    .period { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-top: 16px; }
    .employee-section { margin-bottom: 32px; padding: 20px; background: #fafafa; border-radius: 4px; }
    .employee-name { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
    .employee-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .employee-item { font-size: 12px; }
    .employee-item label { color: #888; display: block; margin-bottom: 2px; }
    .employee-item span { font-weight: 500; color: #333; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 12px; }
    .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .item:last-child { border-bottom: none; }
    .item-label { color: #666; }
    .item-amount { font-weight: 500; }
    .total { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #e5e5e5; font-weight: 600; margin-top: 8px; }
    .net-pay { background: #000; color: white; padding: 24px; margin-top: 32px; text-align: center; }
    .net-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; margin-bottom: 8px; }
    .net-amount { font-size: 26px; font-weight: 300; }
    .bank-info { margin-top: 16px; padding: 12px 16px; background: #f5f5f5; display: flex; justify-content: space-between; font-size: 12px; }
    .footer { margin-top: 40px; font-size: 10px; color: #999; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company">${company.name}</div>
      ${
        company.address
          ? `<div class="company-detail">${company.address}</div>`
          : ""
      }
      ${
        company.npwp
          ? `<div class="company-detail">NPWP: ${company.npwp}</div>`
          : ""
      }
      <div class="period">Slip Gaji ${period}</div>
    </div>

    <div class="employee-section">
      <div class="employee-name">${employee.name}</div>
      <div class="employee-grid">
        <div class="employee-item">
          <label>ID Karyawan</label>
          <span>${employee.employeeId}</span>
        </div>
        <div class="employee-item">
          <label>Jabatan</label>
          <span>${employee.position || "-"}</span>
        </div>
        <div class="employee-item">
          <label>Departemen</label>
          <span>${employee.department || "-"}</span>
        </div>
        <div class="employee-item">
          <label>Status PTKP</label>
          <span>${employee.ptkpStatus}</span>
        </div>
        <div class="employee-item">
          <label>NPWP</label>
          <span>${employee.npwp || "-"}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Pendapatan</div>
      ${earnings
        .map(
          (e) => `
        <div class="item">
          <span class="item-label">${e.label}</span>
          <span class="item-amount">${formatRupiah(e.amount)}</span>
        </div>
      `
        )
        .join("")}
      <div class="total">
        <span>Total Pendapatan</span>
        <span>${formatRupiah(grossSalary)}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Potongan</div>
      ${deductions
        .map(
          (d) => `
        <div class="item">
          <span class="item-label">${d.label}</span>
          <span class="item-amount">${formatRupiah(d.amount)}</span>
        </div>
      `
        )
        .join("")}
      <div class="total">
        <span>Total Potongan</span>
        <span>${formatRupiah(
          deductions.reduce((sum, d) => sum + d.amount, 0)
        )}</span>
      </div>
    </div>

    <div class="net-pay">
      <div class="net-label">Gaji Bersih (Take Home Pay)</div>
      <div class="net-amount">${formatRupiah(netSalary)}</div>
    </div>

    ${
      employee.bankName && employee.bankAccount
        ? `
    <div class="bank-info">
      <span>Transfer ke: <strong>${employee.bankName}</strong></span>
      <span>No. Rekening: <strong>${employee.bankAccount}</strong></span>
    </div>
    `
        : ""
    }

    <div class="footer">
      <p>Dokumen ini dibuat secara elektronik dan sah tanpa tanda tangan.</p>
      <p>Dicetak pada: ${generatedDate}</p>
    </div>
  </div>
</body>
</html>
`;
}

function generateIndonesianTemplate(
  company: CompanyInfo,
  employee: EmployeeInfo,
  period: string,
  earnings: Array<{ label: string; amount: number }>,
  deductions: Array<{ label: string; amount: number }>,
  grossSalary: number,
  netSalary: number
): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Slip Gaji ${employee.name} - ${period}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; padding: 20px; font-size: 12px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px double #333; }
    .logo-area { margin-bottom: 10px; }
    .company-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
    .company-address { font-size: 11px; color: #555; }
    .title { font-size: 16px; font-weight: bold; margin: 20px 0; text-align: center; text-decoration: underline; }
    .info-table { width: 100%; margin-bottom: 15px; }
    .info-table td { padding: 4px 8px; }
    .info-table .label { width: 150px; font-weight: bold; }
    .main-section { display: flex; gap: 20px; margin-bottom: 20px; }
    .earnings-section, .deductions-section { flex: 1; }
    .section-title { font-weight: bold; background: #e0e0e0; padding: 8px; text-align: center; border: 1px solid #999; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table td { border: 1px solid #999; padding: 6px 10px; }
    .data-table .label-col { width: 60%; }
    .data-table .amount-col { width: 40%; text-align: right; }
    .data-table .total-row { font-weight: bold; background: #f0f0f0; }
    .summary-table { width: 50%; margin-left: auto; margin-top: 20px; }
    .summary-table td { border: 1px solid #333; padding: 8px 12px; }
    .summary-table .net-row { background: #333; color: white; font-weight: bold; font-size: 14px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
    .signature-box { width: 200px; text-align: center; }
    .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; }
    .footer-note { margin-top: 30px; font-size: 10px; color: #666; text-align: center; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-area">
        ${
          company.logoBase64
            ? `<img src="${company.logoBase64}" alt="Logo" style="height: 50px;">`
            : ""
        }
      </div>
      <div class="company-name">${company.name}</div>
      <div class="company-address">${company.address || ""}</div>
      ${
        company.phone
          ? `<div class="company-address">Telp: ${company.phone}</div>`
          : ""
      }
      ${
        company.npwp
          ? `<div class="company-address">NPWP: ${company.npwp}</div>`
          : ""
      }
    </div>

    <div class="title">SLIP GAJI / PAYSLIP</div>
    <div style="text-align: center; margin-bottom: 20px;">Periode: ${period}</div>

    <table class="info-table">
      <tr>
        <td class="label">Nama Karyawan</td>
        <td>: ${employee.name}</td>
        <td class="label">Jabatan</td>
        <td>: ${employee.position || "-"}</td>
      </tr>
      <tr>
        <td class="label">NIK / ID Karyawan</td>
        <td>: ${employee.employeeId}</td>
        <td class="label">Departemen</td>
        <td>: ${employee.department || "-"}</td>
      </tr>
      <tr>
        <td class="label">NPWP</td>
        <td>: ${employee.npwp || "-"}</td>
        <td class="label">Status PTKP</td>
        <td>: ${employee.ptkpStatus}</td>
      </tr>
      ${
        employee.bankName && employee.bankAccount
          ? `
      <tr>
        <td class="label">Bank</td>
        <td>: ${employee.bankName}</td>
        <td class="label">No. Rekening</td>
        <td>: ${employee.bankAccount}</td>
      </tr>
      `
          : ""
      }
    </table>

    <div class="main-section">
      <div class="earnings-section">
        <div class="section-title">PENDAPATAN / EARNINGS</div>
        <table class="data-table">
          ${earnings
            .map(
              (e) => `
            <tr>
              <td class="label-col">${e.label}</td>
              <td class="amount-col">${formatRupiah(e.amount)}</td>
            </tr>
          `
            )
            .join("")}
          <tr class="total-row">
            <td class="label-col">TOTAL PENDAPATAN</td>
            <td class="amount-col">${formatRupiah(grossSalary)}</td>
          </tr>
        </table>
      </div>

      <div class="deductions-section">
        <div class="section-title">POTONGAN / DEDUCTIONS</div>
        <table class="data-table">
          ${deductions
            .map(
              (d) => `
            <tr>
              <td class="label-col">${d.label}</td>
              <td class="amount-col">${formatRupiah(d.amount)}</td>
            </tr>
          `
            )
            .join("")}
          <tr class="total-row">
            <td class="label-col">TOTAL POTONGAN</td>
            <td class="amount-col">${formatRupiah(
              deductions.reduce((sum, d) => sum + d.amount, 0)
            )}</td>
          </tr>
        </table>
      </div>
    </div>

    <table class="summary-table">
      <tr>
        <td style="font-weight: bold;">GAJI KOTOR (GROSS)</td>
        <td style="text-align: right;">${formatRupiah(grossSalary)}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">TOTAL POTONGAN</td>
        <td style="text-align: right;">${formatRupiah(
          deductions.reduce((sum, d) => sum + d.amount, 0)
        )}</td>
      </tr>
      <tr class="net-row">
        <td>GAJI BERSIH (TAKE HOME PAY)</td>
        <td style="text-align: right;">${formatRupiah(netSalary)}</td>
      </tr>
    </table>

    <div class="footer-note" style="margin-top: 30px; text-align: center; font-size: 11px; color: #555; padding: 20px; border-top: 1px solid #ccc;">
      <p><strong>Dokumen ini dibuat secara elektronik dan sah tanpa tanda tangan.</strong></p>
      <p style="margin-top: 8px;">Slip gaji ini adalah dokumen rahasia. Jika ada pertanyaan, silakan hubungi bagian HRD.</p>
      <p style="margin-top: 8px; font-style: italic;">Dicetak pada: ${new Date().toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      )}</p>
    </div>
  </div>
</body>
</html>
`;
}
