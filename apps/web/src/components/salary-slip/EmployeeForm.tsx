import { useState } from "react";
import { User, ArrowLeft, HelpCircle, X } from "lucide-react";
import { useSalarySlipStore } from "@/stores/salarySlipStore";
import type { PTKPStatus } from "@pdf-editor/shared";

interface EmployeeFormProps {
  onNext: () => void;
  onPrev: () => void;
}

const PTKP_OPTIONS: { value: PTKPStatus; label: string }[] = [
  { value: "TK/0", label: "TK/0 - Tidak Kawin, Tanpa Tanggungan" },
  { value: "TK/1", label: "TK/1 - Tidak Kawin, 1 Tanggungan" },
  { value: "TK/2", label: "TK/2 - Tidak Kawin, 2 Tanggungan" },
  { value: "TK/3", label: "TK/3 - Tidak Kawin, 3 Tanggungan" },
  { value: "K/0", label: "K/0 - Kawin, Tanpa Tanggungan" },
  { value: "K/1", label: "K/1 - Kawin, 1 Tanggungan" },
  { value: "K/2", label: "K/2 - Kawin, 2 Tanggungan" },
  { value: "K/3", label: "K/3 - Kawin, 3 Tanggungan" },
  {
    value: "K/I/0",
    label: "K/I/0 - Kawin (Suami/Istri Bekerja), Tanpa Tanggungan",
  },
  {
    value: "K/I/1",
    label: "K/I/1 - Kawin (Suami/Istri Bekerja), 1 Tanggungan",
  },
  {
    value: "K/I/2",
    label: "K/I/2 - Kawin (Suami/Istri Bekerja), 2 Tanggungan",
  },
  {
    value: "K/I/3",
    label: "K/I/3 - Kawin (Suami/Istri Bekerja), 3 Tanggungan",
  },
];

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

export function EmployeeForm({ onNext, onPrev }: EmployeeFormProps) {
  const { employee, setEmployee, period, setPeriod } = useSalarySlipStore();
  const [showPtkpHelp, setShowPtkpHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee.name.trim() || !employee.employeeId.trim()) {
      return;
    }
    onNext();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <User className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Informasi Karyawan</h2>
          <p className="text-dark-400">
            Masukkan detail karyawan dan periode gaji
          </p>
        </div>
      </div>

      {/* PTKP Help Modal */}
      {showPtkpHelp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-800 p-4 border-b border-dark-600 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Panduan Status PTKP
              </h3>
              <button
                onClick={() => setShowPtkpHelp(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-dark-300" />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
                <p className="text-primary-300 font-medium mb-2">
                  Apa itu PTKP?
                </p>
                <p className="text-dark-300">
                  <strong>PTKP (Penghasilan Tidak Kena Pajak)</strong> adalah
                  batas penghasilan yang tidak dikenakan pajak PPh 21. Status
                  PTKP menentukan besarnya pengurangan penghasilan kena pajak
                  berdasarkan status pernikahan dan tanggungan.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="font-medium text-emerald-400 mb-1">
                    TK (Tidak Kawin)
                  </p>
                  <p className="text-dark-300 text-xs">
                    Untuk karyawan yang belum menikah atau lajang.
                  </p>
                  <ul className="text-dark-400 text-xs mt-1 ml-4 list-disc">
                    <li>TK/0 = Tanpa tanggungan</li>
                    <li>TK/1-3 = Dengan 1-3 tanggungan (orang tua/saudara)</li>
                  </ul>
                </div>

                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="font-medium text-blue-400 mb-1">K (Kawin)</p>
                  <p className="text-dark-300 text-xs">
                    Untuk karyawan yang sudah menikah, pasangan tidak bekerja.
                  </p>
                  <ul className="text-dark-400 text-xs mt-1 ml-4 list-disc">
                    <li>K/0 = Kawin tanpa anak</li>
                    <li>K/1-3 = Kawin dengan 1-3 anak</li>
                  </ul>
                </div>

                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="font-medium text-purple-400 mb-1">
                    K/I (Kawin, Penghasilan Digabung)
                  </p>
                  <p className="text-dark-300 text-xs">
                    Untuk karyawan yang sudah menikah dan pasangan juga bekerja,
                    dimana penghasilan digabungkan untuk perhitungan pajak.
                  </p>
                  <ul className="text-dark-400 text-xs mt-1 ml-4 list-disc">
                    <li>K/I/0-3 = Sesuai jumlah anak (0-3)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-300 text-xs">
                  💡 <strong>Tips:</strong> Jika ragu, tanyakan ke bagian HRD
                  atau lihat SPT (Surat Pemberitahuan Tahunan) karyawan. Umumnya
                  karyawan lajang menggunakan TK/0.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Period Selection */}
        <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-600">
          <label className="block text-sm font-medium text-dark-200 mb-3">
            Periode Gaji <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={period.month}
              onChange={(e) => setPeriod({ month: parseInt(e.target.value) })}
              className="px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={period.year}
              onChange={(e) => setPeriod({ year: parseInt(e.target.value) })}
              className="px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Name & Employee ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Nama Lengkap <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={employee.name}
              onChange={(e) => setEmployee({ name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              ID Karyawan <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={employee.employeeId}
              onChange={(e) => setEmployee({ employeeId: e.target.value })}
              placeholder="EMP-001"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
              required
            />
          </div>
        </div>

        {/* Position & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Jabatan{" "}
              <span className="text-amber-400 text-xs">
                (Opsional tapi disarankan)
              </span>
            </label>
            <input
              type="text"
              value={employee.position || ""}
              onChange={(e) => setEmployee({ position: e.target.value })}
              placeholder="Software Engineer"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Departemen{" "}
              <span className="text-amber-400 text-xs">
                (Opsional tapi disarankan)
              </span>
            </label>
            <input
              type="text"
              value={employee.department || ""}
              onChange={(e) => setEmployee({ department: e.target.value })}
              placeholder="Engineering"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            />
          </div>
        </div>

        {/* NPWP & PTKP Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              NPWP Karyawan{" "}
              <span className="text-amber-400 text-xs">
                (Opsional tapi disarankan)
              </span>
            </label>
            <input
              type="text"
              value={employee.npwp || ""}
              onChange={(e) => setEmployee({ npwp: e.target.value })}
              placeholder="00.000.000.0-000.000"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
              Status PTKP <span className="text-red-400">*</span>
              <button
                type="button"
                onClick={() => setShowPtkpHelp(true)}
                className="text-primary-400 hover:text-primary-300 transition"
                title="Klik untuk panduan PTKP"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </label>
            <select
              value={employee.ptkpStatus}
              onChange={(e) =>
                setEmployee({ ptkpStatus: e.target.value as PTKPStatus })
              }
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
              required
            >
              {PTKP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bank Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Nama Bank{" "}
              <span className="text-dark-500 text-xs">(Opsional)</span>
            </label>
            <input
              type="text"
              value={employee.bankName || ""}
              onChange={(e) => setEmployee({ bankName: e.target.value })}
              placeholder="BCA"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              No. Rekening{" "}
              <span className="text-dark-500 text-xs">(Opsional)</span>
            </label>
            <input
              type="text"
              value={employee.bankAccount || ""}
              onChange={(e) => setEmployee({ bankAccount: e.target.value })}
              placeholder="1234567890"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
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
