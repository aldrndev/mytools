import { useEffect, useState } from "react";
import {
  DollarSign,
  ArrowLeft,
  Plus,
  Trash2,
  Info,
  HelpCircle,
  X,
} from "lucide-react";
import { useSalarySlipStore } from "@/stores/salarySlipStore";
import {
  calculateGrossSalary,
  calculateAllDeductions,
  calculateNetSalary,
  formatRupiah,
} from "@pdf-editor/shared";
import type { JKKRiskLevel } from "@pdf-editor/shared";

interface SalaryFormProps {
  onNext: () => void;
  onPrev: () => void;
}

const JKK_RISK_OPTIONS: { value: JKKRiskLevel; label: string; rate: string }[] =
  [
    { value: "VERY_LOW", label: "Sangat Rendah", rate: "0.24%" },
    { value: "LOW", label: "Rendah (Kantor)", rate: "0.54%" },
    { value: "MEDIUM", label: "Sedang", rate: "0.89%" },
    { value: "HIGH", label: "Tinggi", rate: "1.27%" },
    { value: "VERY_HIGH", label: "Sangat Tinggi", rate: "1.74%" },
  ];

export function SalaryForm({ onNext, onPrev }: SalaryFormProps) {
  const {
    earnings,
    setEarnings,
    deductionsConfig,
    setDeductionsConfig,
    employee,
    setCalculatedValues,
  } = useSalarySlipStore();

  const [showJkkHelp, setShowJkkHelp] = useState(false);

  // Calculate deductions whenever earnings or config changes
  useEffect(() => {
    const gross = calculateGrossSalary(earnings);
    const deductions = calculateAllDeductions(
      earnings,
      deductionsConfig,
      employee.ptkpStatus
    );
    const net = calculateNetSalary(gross, deductions);
    setCalculatedValues(gross, net, deductions);
  }, [earnings, deductionsConfig, employee.ptkpStatus, setCalculatedValues]);

  const grossSalary = calculateGrossSalary(earnings);
  const deductions = calculateAllDeductions(
    earnings,
    deductionsConfig,
    employee.ptkpStatus
  );
  const netSalary = calculateNetSalary(grossSalary, deductions);

  const handleAddCustomDeduction = () => {
    setDeductionsConfig({
      customDeductions: [
        ...deductionsConfig.customDeductions,
        { name: "", amount: 0 },
      ],
    });
  };

  const handleRemoveCustomDeduction = (index: number) => {
    setDeductionsConfig({
      customDeductions: deductionsConfig.customDeductions.filter(
        (_: { name: string; amount: number }, i: number) => i !== index
      ),
    });
  };

  const handleUpdateCustomDeduction = (
    index: number,
    field: "name" | "amount",
    value: string | number
  ) => {
    const updated = deductionsConfig.customDeductions.map(
      (d: { name: string; amount: number }, i: number) =>
        i === index ? { ...d, [field]: value } : d
    );
    setDeductionsConfig({ customDeductions: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (earnings.basicSalary <= 0) {
      return;
    }
    onNext();
  };

  const formatInput = (value: number) => (value === 0 ? "" : value.toString());

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Komponen Gaji</h2>
          <p className="text-dark-400">
            Masukkan detail pendapatan dan konfigurasi potongan
          </p>
        </div>
      </div>

      {/* JKK Help Modal */}
      {showJkkHelp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-800 p-4 border-b border-dark-600 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Panduan Tingkat Risiko JKK
              </h3>
              <button
                onClick={() => setShowJkkHelp(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-dark-300" />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
                <p className="text-primary-300 font-medium mb-2">
                  Apa itu JKK?
                </p>
                <p className="text-dark-300">
                  <strong>JKK (Jaminan Kecelakaan Kerja)</strong> adalah program
                  BPJS Ketenagakerjaan yang memberikan perlindungan risiko
                  kecelakaan saat bekerja. Tarif iuran berbeda berdasarkan
                  tingkat risiko pekerjaan.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <p className="font-medium text-emerald-400 mb-1">
                    Sangat Rendah (0.24%)
                  </p>
                  <p className="text-dark-400 text-xs">
                    Pekerjaan administratif, jasa keuangan, konsultan, asuransi,
                    perdagangan retail, pertanian padi.
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="font-medium text-blue-400 mb-1">
                    Rendah (0.54%) - Paling Umum
                  </p>
                  <p className="text-dark-400 text-xs">
                    Perkantoran umum, IT/software, angkutan umum, tekstil,
                    percetakan, industri ringan.
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="font-medium text-amber-400 mb-1">
                    Sedang (0.89%)
                  </p>
                  <p className="text-dark-400 text-xs">
                    Industri makanan/minuman, farmasi, otomotif, elektronik,
                    pengolahan kayu.
                  </p>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <p className="font-medium text-orange-400 mb-1">
                    Tinggi (1.27%)
                  </p>
                  <p className="text-dark-400 text-xs">
                    Konstruksi bangunan, pertambangan non-migas, pengolahan
                    logam, industri kimia.
                  </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="font-medium text-red-400 mb-1">
                    Sangat Tinggi (1.74%)
                  </p>
                  <p className="text-dark-400 text-xs">
                    Pertambangan migas, penerbangan, penyelaman, pekerjaan
                    dengan bahan peledak.
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-300 text-xs">
                  💡 <strong>Tips:</strong> Kebanyakan perusahaan kantor/IT
                  menggunakan tarif "Rendah (0.54%)". Jika ragu, tanyakan ke
                  bagian HRD atau lihat SK penetapan kelas JKK dari BPJS.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Earnings */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-dark-700 pb-2">
              Pendapatan
            </h3>

            {/* Basic Salary */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Gaji Pokok <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={formatInput(earnings.basicSalary)}
                  onChange={(e) =>
                    setEarnings({ basicSalary: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Allowances Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Tunjangan Jabatan
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formatInput(earnings.positionAllowance)}
                    onChange={(e) =>
                      setEarnings({
                        positionAllowance: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 outline-none transition text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Tunjangan Transport
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formatInput(earnings.transportAllowance)}
                    onChange={(e) =>
                      setEarnings({
                        transportAllowance: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 outline-none transition text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Tunjangan Makan
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formatInput(earnings.mealAllowance)}
                    onChange={(e) =>
                      setEarnings({
                        mealAllowance: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 outline-none transition text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Lembur
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formatInput(earnings.overtime)}
                    onChange={(e) =>
                      setEarnings({ overtime: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 outline-none transition text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Bonus
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formatInput(earnings.bonus)}
                    onChange={(e) =>
                      setEarnings({ bonus: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 outline-none transition text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  THR
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formatInput(earnings.thr)}
                    onChange={(e) =>
                      setEarnings({ thr: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 outline-none transition text-sm"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Deductions Config & Summary */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-dark-700 pb-2">
              Konfigurasi Potongan
            </h3>

            {/* BPJS Toggles */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductionsConfig.includeBpjsKesehatan}
                  onChange={(e) =>
                    setDeductionsConfig({
                      includeBpjsKesehatan: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded bg-dark-800 border-dark-600 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-dark-200">
                  BPJS Kesehatan (5%: 4% perusahaan, 1% karyawan)
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductionsConfig.includeBpjsKetenagakerjaan}
                  onChange={(e) =>
                    setDeductionsConfig({
                      includeBpjsKetenagakerjaan: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded bg-dark-800 border-dark-600 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-dark-200">
                  BPJS Ketenagakerjaan (JKK, JKM, JHT, JP)
                </span>
              </label>
            </div>

            {/* JKK Risk Level */}
            {deductionsConfig.includeBpjsKetenagakerjaan && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                  Tingkat Risiko JKK
                  <button
                    type="button"
                    onClick={() => setShowJkkHelp(true)}
                    className="text-primary-400 hover:text-primary-300 transition"
                    title="Klik untuk panduan tingkat risiko JKK"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </label>
                <select
                  value={deductionsConfig.jkkRiskLevel}
                  onChange={(e) =>
                    setDeductionsConfig({
                      jkkRiskLevel: e.target.value as JKKRiskLevel,
                    })
                  }
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:border-primary-500 outline-none transition text-sm"
                >
                  {JKK_RISK_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.rate})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Deductions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-dark-200">
                  Potongan Lain
                </label>
                <button
                  type="button"
                  onClick={handleAddCustomDeduction}
                  className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </div>
              {deductionsConfig.customDeductions.map(
                (
                  deduction: { name: string; amount: number },
                  index: number
                ) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={deduction.name}
                      onChange={(e) =>
                        handleUpdateCustomDeduction(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Nama potongan"
                      className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 text-sm"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={deduction.amount || ""}
                        onChange={(e) =>
                          handleUpdateCustomDeduction(
                            index,
                            "amount",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="w-full pl-8 pr-2 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomDeduction(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Calculation Summary */}
            <div className="bg-dark-800/50 rounded-xl p-4 space-y-3 border border-dark-600">
              <h4 className="font-medium text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-primary-400" />
                Ringkasan Perhitungan
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-dark-300">
                  <span>Total Pendapatan (Gross)</span>
                  <span className="text-emerald-400 font-medium">
                    {formatRupiah(grossSalary)}
                  </span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>PPh 21</span>
                  <span className="text-red-400">
                    -{formatRupiah(deductions.pph21)}
                  </span>
                </div>
                {deductionsConfig.includeBpjsKesehatan && (
                  <div className="flex justify-between text-dark-300">
                    <span>BPJS Kesehatan</span>
                    <span className="text-red-400">
                      -{formatRupiah(deductions.bpjsKesehatanEmployee)}
                    </span>
                  </div>
                )}
                {deductionsConfig.includeBpjsKetenagakerjaan && (
                  <>
                    <div className="flex justify-between text-dark-300">
                      <span>BPJS JHT</span>
                      <span className="text-red-400">
                        -{formatRupiah(deductions.bpjsJhtEmployee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-dark-300">
                      <span>BPJS JP</span>
                      <span className="text-red-400">
                        -{formatRupiah(deductions.bpjsJpEmployee)}
                      </span>
                    </div>
                  </>
                )}
                {deductionsConfig.customDeductions.map(
                  (d: { name: string; amount: number }, i: number) => (
                    <div key={i} className="flex justify-between text-dark-300">
                      <span>{d.name || "Potongan lain"}</span>
                      <span className="text-red-400">
                        -{formatRupiah(d.amount)}
                      </span>
                    </div>
                  )
                )}
                <div className="border-t border-dark-600 pt-2 flex justify-between font-semibold">
                  <span className="text-white">Take Home Pay</span>
                  <span className="text-emerald-400 text-lg">
                    {formatRupiah(netSalary)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t border-dark-700 mt-8">
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-dark-300 hover:text-white hover:bg-dark-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <button
            type="submit"
            className="btn-gradient px-8 py-3 rounded-xl font-semibold text-white"
          >
            Lanjutkan
          </button>
        </div>
      </form>
    </div>
  );
}
