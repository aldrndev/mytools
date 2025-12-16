import { Palette, ArrowLeft, Check } from "lucide-react";
import { useSalarySlipStore } from "@/stores/salarySlipStore";
import type { TemplateId } from "@pdf-editor/shared";

interface TemplateSelectorProps {
  onNext: () => void;
  onPrev: () => void;
}

const TEMPLATES: {
  id: TemplateId;
  name: string;
  description: string;
  preview: string; // CSS gradient for preview
}[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Desain modern dengan gradient dan card-based layout",
    preview: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  },
  {
    id: "classic",
    name: "Corporate Classic",
    description: "Desain formal tradisional dengan tabel berborder",
    preview: "linear-gradient(135deg, #374151, #1f2937)",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Desain minimalis dengan fokus pada whitespace",
    preview: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
  },
  {
    id: "indonesian",
    name: "Indonesian Standard",
    description: "Format standar slip gaji Indonesia",
    preview: "linear-gradient(135deg, #059669, #047857)",
  },
];

export function TemplateSelector({ onNext, onPrev }: TemplateSelectorProps) {
  const { selectedTemplate, setSelectedTemplate } = useSalarySlipStore();

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
          <p className="text-dark-400">
            Pilih desain slip gaji yang sesuai dengan kebutuhan
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {TEMPLATES.map((template) => {
            const isSelected = selectedTemplate === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-dark-600 bg-dark-800/50 hover:border-dark-500"
                }`}
              >
                {/* Preview */}
                <div
                  className="h-32 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden"
                  style={{ background: template.preview }}
                >
                  {/* Mockup content */}
                  <div className="absolute inset-4 bg-white/10 backdrop-blur rounded-md">
                    <div className="p-3 space-y-2">
                      <div className="h-2 bg-white/30 rounded w-1/2" />
                      <div className="h-1.5 bg-white/20 rounded w-3/4" />
                      <div className="h-1.5 bg-white/20 rounded w-2/3" />
                      <div className="mt-3 flex gap-2">
                        <div className="h-8 bg-white/20 rounded flex-1" />
                        <div className="h-8 bg-white/20 rounded flex-1" />
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3
                  className={`font-semibold mb-1 ${
                    isSelected ? "text-primary-400" : "text-white"
                  }`}
                >
                  {template.name}
                </h3>
                <p className="text-sm text-dark-400">{template.description}</p>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 border-t border-dark-700 gap-4 sm:gap-0">
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
