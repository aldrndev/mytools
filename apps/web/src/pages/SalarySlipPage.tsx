import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  User,
  DollarSign,
  Palette,
  Eye,
  Check,
} from "lucide-react";
import { useSalarySlipStore, type WizardStep } from "@/stores/salarySlipStore";
import { CompanyForm } from "@/components/salary-slip/CompanyForm";
import { EmployeeForm } from "@/components/salary-slip/EmployeeForm";
import { SalaryForm } from "@/components/salary-slip/SalaryForm";
import { TemplateSelector } from "@/components/salary-slip/TemplateSelector";
import { SlipPreview } from "@/components/salary-slip/SlipPreview";

const STEPS: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
  {
    id: "company",
    label: "Perusahaan",
    icon: <Building2 className="w-4 h-4" />,
  },
  { id: "employee", label: "Karyawan", icon: <User className="w-4 h-4" /> },
  { id: "salary", label: "Gaji", icon: <DollarSign className="w-4 h-4" /> },
  { id: "template", label: "Template", icon: <Palette className="w-4 h-4" /> },
  { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
];

export function SalarySlipPage() {
  const { currentStep, setCurrentStep, nextStep, prevStep, isLoading } =
    useSalarySlipStore();

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-3 sm:py-4 px-4 sm:px-6 border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>
          <h1 className="text-lg font-semibold text-white">
            Slip Gaji Generator
          </h1>
          <div className="w-10 sm:w-24" /> {/* Spacer */}
        </div>
      </header>

      {/* Progress Steps */}
      <div className="py-4 sm:py-6 px-4 sm:px-6 border-b border-dark-700/50 overflow-x-auto">
        <div className="max-w-4xl mx-auto min-w-max sm:min-w-0">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() =>
                      index <= currentStepIndex && setCurrentStep(step.id)
                    }
                    disabled={index > currentStepIndex}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all ${
                      isCurrent
                        ? "bg-primary-500/20 text-primary-400 border border-primary-500/50"
                        : isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 cursor-pointer hover:bg-emerald-500/30"
                        : "bg-dark-800 text-dark-400 cursor-not-allowed"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
                    <span className="hidden sm:inline text-sm font-medium">
                      {step.label}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 ${
                        index < currentStepIndex
                          ? "bg-emerald-500"
                          : "bg-dark-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === "company" && <CompanyForm onNext={nextStep} />}
            {currentStep === "employee" && (
              <EmployeeForm onNext={nextStep} onPrev={prevStep} />
            )}
            {currentStep === "salary" && (
              <SalaryForm onNext={nextStep} onPrev={prevStep} />
            )}
            {currentStep === "template" && (
              <TemplateSelector onNext={nextStep} onPrev={prevStep} />
            )}
            {currentStep === "preview" && <SlipPreview onPrev={prevStep} />}
          </motion.div>
        </div>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-8 text-center">
            <div className="w-12 h-12 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-dark-100">Memproses...</p>
            <p className="text-sm text-dark-400 mt-1">Mohon tunggu sebentar</p>
          </div>
        </div>
      )}
    </div>
  );
}
