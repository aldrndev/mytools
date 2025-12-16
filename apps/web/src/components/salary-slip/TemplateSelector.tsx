import { Palette, ArrowLeft } from "lucide-react";
import { useSalarySlipStore } from "@/stores/salarySlipStore";
import type { TemplateId } from "@pdf-editor/shared";

interface TemplateSelectorProps {
  onNext: () => void;
  onPrev: () => void;
}

const TEMPLATES: { id: TemplateId; name: string; desc: string }[] = [
  { id: "formal_standar", name: "Standar", desc: "Format dasar slip gaji" },
  { id: "formal_bordered", name: "Berbingkai", desc: "Dengan border lengkap" },
  { id: "formal_compact", name: "Kompak", desc: "Format hemat ruang" },
  { id: "formal_detailed", name: "Detail", desc: "Informasi lengkap" },
  {
    id: "formal_executive",
    name: "Eksekutif",
    desc: "Format ringkas profesional",
  },
  { id: "formal_simple", name: "Simpel", desc: "Minimalis tanpa hiasan" },
  { id: "formal_corporate", name: "Korporat", desc: "Gaya perusahaan besar" },
  { id: "formal_classic", name: "Klasik", desc: "Tampilan tradisional" },
  { id: "formal_clean", name: "Bersih", desc: "Ruang putih lega" },
  { id: "formal_professional", name: "Profesional", desc: "Kesan formal kuat" },
  { id: "formal_elegant", name: "Elegan", desc: "Sentuhan tipografi halus" },
  { id: "formal_business", name: "Bisnis", desc: "Format standar bisnis" },
  { id: "formal_structured", name: "Terstruktur", desc: "Grid yang rapi" },
];

export function TemplateSelector({ onNext, onPrev }: TemplateSelectorProps) {
  const { selectedTemplate, setSelectedTemplate, orientation, setOrientation } =
    useSalarySlipStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="glass-card p-4 sm:p-8">
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Palette className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Pilih Template</h2>
          <p className="text-dark-400">Pilih layout dan orientasi kertas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Template Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Layout Template
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedTemplate === t.id
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-dark-600 bg-dark-800/50 hover:border-dark-500"
                }`}
              >
                <span
                  className={`text-sm font-semibold block ${
                    selectedTemplate === t.id
                      ? "text-primary-400"
                      : "text-white"
                  }`}
                >
                  {t.name}
                </span>
                <span className="text-xs text-dark-400 line-clamp-2">
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orientation Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Orientasi Kertas
          </h3>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <button
              type="button"
              onClick={() => setOrientation("portrait")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                orientation === "portrait"
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-dark-600 bg-dark-800/50 hover:border-dark-500"
              }`}
            >
              <div className="w-10 h-14 border-2 border-current rounded flex items-center justify-center opacity-50">
                <span className="text-xs">A4</span>
              </div>
              <span
                className={`font-medium ${
                  orientation === "portrait"
                    ? "text-primary-400"
                    : "text-dark-300"
                }`}
              >
                Portrait
              </span>
            </button>
            <button
              type="button"
              onClick={() => setOrientation("landscape")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                orientation === "landscape"
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-dark-600 bg-dark-800/50 hover:border-dark-500"
              }`}
            >
              <div className="w-14 h-10 border-2 border-current rounded flex items-center justify-center opacity-50">
                <span className="text-xs">A4</span>
              </div>
              <span
                className={`font-medium ${
                  orientation === "landscape"
                    ? "text-primary-400"
                    : "text-dark-300"
                }`}
              >
                Landscape
              </span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 border-t border-dark-700 gap-4 sm:gap-0 mt-8">
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-dark-300 hover:text-white hover:bg-dark-700 transition w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <button
            type="submit"
            className="btn-gradient px-8 py-3 rounded-xl font-semibold text-white w-full sm:w-auto"
          >
            Lihat Preview
          </button>
        </div>
      </form>
    </div>
  );
}
