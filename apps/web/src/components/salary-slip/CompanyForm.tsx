import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Building2, Upload, X } from "lucide-react";
import { useSalarySlipStore } from "@/stores/salarySlipStore";

interface CompanyFormProps {
  onNext: () => void;
}

export function CompanyForm({ onNext }: CompanyFormProps) {
  const { company, setCompany } = useSalarySlipStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(
    company.logoBase64 || null
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setLogoPreview(base64);
          setCompany({ logoBase64: base64 });
        };
        reader.readAsDataURL(file);
      }
    },
    [setCompany]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".svg"] },
    maxFiles: 1,
    multiple: false,
  });

  const removeLogo = () => {
    setLogoPreview(null);
    setCompany({ logoBase64: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.name.trim()) {
      return;
    }
    onNext();
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Informasi Perusahaan
          </h2>
          <p className="text-dark-400">
            Masukkan detail perusahaan untuk slip gaji
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Logo Perusahaan{" "}
            <span className="text-amber-400 text-xs">
              (Opsional tapi disarankan)
            </span>
          </label>
          {logoPreview ? (
            <div className="relative inline-block">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-20 object-contain rounded-lg bg-white p-2"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`upload-zone rounded-xl p-6 text-center cursor-pointer ${
                isDragActive ? "active" : ""
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-dark-400" />
              <p className="text-dark-300 text-sm">
                Drag & drop logo atau klik untuk upload
              </p>
              <p className="text-dark-500 text-xs mt-1">PNG, JPG, SVG</p>
            </div>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Nama Perusahaan <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => setCompany({ name: e.target.value })}
            placeholder="PT Contoh Indonesia"
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Alamat{" "}
            <span className="text-amber-400 text-xs">
              (Opsional tapi disarankan)
            </span>
          </label>
          <textarea
            value={company.address || ""}
            onChange={(e) => setCompany({ address: e.target.value })}
            placeholder="Jl. Contoh No. 123, Jakarta Selatan 12345"
            rows={2}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition resize-none"
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              No. Telepon{" "}
              <span className="text-amber-400 text-xs">
                (Opsional tapi disarankan)
              </span>
            </label>
            <input
              type="tel"
              value={company.phone || ""}
              onChange={(e) => setCompany({ phone: e.target.value })}
              placeholder="021-1234567"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Email <span className="text-dark-500 text-xs">(Opsional)</span>
            </label>
            <input
              type="email"
              value={company.email || ""}
              onChange={(e) => setCompany({ email: e.target.value })}
              placeholder="info@perusahaan.com"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            />
          </div>
        </div>

        {/* NPWP */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            NPWP Perusahaan{" "}
            <span className="text-amber-400 text-xs">
              (Opsional tapi disarankan)
            </span>
          </label>
          <input
            type="text"
            value={company.npwp || ""}
            onChange={(e) => setCompany({ npwp: e.target.value })}
            placeholder="00.000.000.0-000.000"
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
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
