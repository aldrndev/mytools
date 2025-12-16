import {
  X,
  CheckCircle2,
  AlertTriangle,
  MousePointerClick,
  FileDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                Panduan Editor
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-dark-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <StepItem
                  icon={<AlertTriangle className="w-5 h-5" />}
                  title="Bagian yang Disarankan"
                  description="Disarankan hanya mengubah Saldo, Mutasi, Tanggal Periode Statement, dan Tanggal/Bulan transaksi. Periksa deskripsi transaksi jika ada tanggal yang perlu disesuaikan."
                  color="text-yellow-400"
                  bg="bg-yellow-400/10"
                />

                <StepItem
                  icon={<MousePointerClick className="w-5 h-5" />}
                  title="Cara Edit"
                  description="Klik langsung pada bagian teks yang ingin diubah. Editor akan mendeteksi area teks secara otomatis."
                  color="text-blue-400"
                  bg="bg-blue-400/10"
                />

                <StepItem
                  icon={<FileDown className="w-5 h-5" />}
                  title="Hasil Akhir Presisi"
                  description="Tampilan saat editing mungkin terlihat sedikit berbeda (kotak text), namun hasil download PDF akan 100% sama persis dengan aslinya (font & posisi)."
                  color="text-emerald-400"
                  bg="bg-emerald-400/10"
                />
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  Use with your own risk. Pastikan penggunaan dokumen ini sesuai
                  dengan hukum dan peraturan yang berlaku.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Saya Mengerti
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StepItem({
  icon,
  title,
  description,
  color,
  bg,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <h3 className={`font-medium ${color} mb-1`}>{title}</h3>
        <p className="text-dark-300 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
