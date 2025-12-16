import { useState, useEffect } from "react";
import { Eye, ArrowLeft, RefreshCw, Printer } from "lucide-react";
import { useSalarySlipStore } from "@/stores/salarySlipStore";
import { formatRupiah } from "@pdf-editor/shared";

interface SlipPreviewProps {
  onPrev: () => void;
}

const API_BASE = "http://localhost:3001";

export function SlipPreview({ onPrev }: SlipPreviewProps) {
  const {
    company,
    employee,
    period,
    earnings,
    deductionsConfig,
    selectedTemplate,
    selectedTheme,
    orientation,
    grossSalary,
    netSalary,
    calculatedDeductions,
    isLoading,
    setLoading,
    setError,
  } = useSalarySlipStore();

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Legacy state handling: default to formal_standar for old template IDs
      const safeTemplateId = (selectedTemplate as string).startsWith(
        "indonesian"
      )
        ? "formal_standar"
        : selectedTemplate;

      const requestBody = {
        company,
        employee,
        period,
        earnings,
        deductionsConfig,
        templateId: safeTemplateId,
        theme: "default", // Always use formal black theme
        orientation,
      };

      console.log("Preview request body:", requestBody);

      const response = await fetch(`${API_BASE}/api/salary-slip/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Preview error response:", errorData);
        const errorMessage =
          errorData?.details?.formErrors?.join(", ") ||
          errorData?.error ||
          `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const html = await response.text();
      setPreviewHtml(html);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate preview";
      console.error("Preview failed:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Legacy state handling: default to formal_standar for old template IDs
      const safeTemplateId = (selectedTemplate as string).startsWith(
        "indonesian"
      )
        ? "formal_standar"
        : selectedTemplate;

      const requestBody = {
        company,
        employee,
        period,
        earnings,
        deductionsConfig,
        templateId: safeTemplateId,
        theme: "default", // Always use formal black theme
        orientation,
      };

      console.log("Generate request body:", requestBody);

      const response = await fetch(`${API_BASE}/api/salary-slip/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Generate error response:", errorData);
        const errorMessage =
          errorData?.details?.formErrors?.join(", ") ||
          errorData?.error ||
          `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Generate success:", data);

      if (data.success && data.data.downloadUrl) {
        // Open the HTML file in a new tab for printing/saving
        window.open(`${API_BASE}${data.data.downloadUrl}`, "_blank");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate";
      console.error("Generate failed:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (previewHtml) {
      // Open print dialog for PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(previewHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  // Auto-fetch preview on mount and when template changes
  useEffect(() => {
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, selectedTheme, orientation]);

  const MONTHS = [
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

  return (
    <div className="glass-card p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Eye className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Preview & Download
            </h2>
            <p className="text-dark-400">
              Periksa hasil slip gaji sebelum download
            </p>
          </div>
        </div>

        <button
          onClick={fetchPreview}
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-600">
          <p className="text-dark-400 text-sm mb-1">Periode</p>
          <p className="text-white font-semibold">
            {MONTHS[period.month - 1]} {period.year}
          </p>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-600">
          <p className="text-dark-400 text-sm mb-1">Gaji Kotor</p>
          <p className="text-emerald-400 font-semibold">
            {formatRupiah(grossSalary)}
          </p>
        </div>
        <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-500/50">
          <p className="text-emerald-300 text-sm mb-1">Take Home Pay</p>
          <p className="text-emerald-400 font-bold text-xl">
            {formatRupiah(netSalary)}
          </p>
        </div>
      </div>

      {/* Deductions Breakdown */}
      {calculatedDeductions && (
        <div className="bg-dark-800/30 rounded-xl p-4 mb-6 sm:mb-8 border border-dark-600">
          <h4 className="font-medium text-white mb-3">Rincian Potongan</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-dark-400">PPh 21</p>
              <p className="text-red-400 font-medium">
                {formatRupiah(calculatedDeductions.pph21)}
              </p>
            </div>
            <div>
              <p className="text-dark-400">BPJS Kesehatan</p>
              <p className="text-red-400 font-medium">
                {formatRupiah(calculatedDeductions.bpjsKesehatanEmployee)}
              </p>
            </div>
            <div>
              <p className="text-dark-400">BPJS JHT</p>
              <p className="text-red-400 font-medium">
                {formatRupiah(calculatedDeductions.bpjsJhtEmployee)}
              </p>
            </div>
            <div>
              <p className="text-dark-400">BPJS JP</p>
              <p className="text-red-400 font-medium">
                {formatRupiah(calculatedDeductions.bpjsJpEmployee)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Frame */}
      <div
        className="bg-white rounded-xl overflow-hidden mb-6 sm:mb-8"
        style={{ minHeight: "500px" }}
      >
        {previewHtml ? (
          <iframe
            srcDoc={previewHtml}
            className="w-full h-[500px] sm:h-[600px] border-0"
            title="Salary Slip Preview"
          />
        ) : (
          <div className="h-[500px] flex items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-dark-400">Memuat preview...</p>
              </div>
            ) : (
              <div className="text-center px-4">
                <p className="text-dark-400 mb-4">
                  Klik tombol di bawah untuk generate slip gaji
                </p>
                <button
                  onClick={handleGenerate}
                  className="btn-gradient px-6 py-3 rounded-xl font-semibold text-white w-full sm:w-auto"
                >
                  Generate Slip Gaji
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse lg:flex-row justify-between pt-4 border-t border-dark-700 gap-4 lg:gap-0">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-dark-300 hover:text-white hover:bg-dark-700 transition w-full lg:w-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-dark-700 text-white hover:bg-dark-600 transition disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
            Regenerate
          </button>

          <button
            onClick={handlePrint}
            disabled={!previewHtml || isLoading}
            className="btn-gradient flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-white disabled:opacity-50 w-full sm:w-auto"
          >
            <Printer className="w-5 h-5" />
            Cetak PDF
          </button>
        </div>
      </div>
    </div>
  );
}
