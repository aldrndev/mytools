import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileEdit, Receipt, ArrowRight, Sparkles } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Document Tools</h1>
              <p className="text-xs text-dark-400">
                PDF Editor & Salary Slip Generator
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Pilih Fitur yang Anda Butuhkan
          </h1>
          <p className="text-lg text-dark-300 max-w-2xl mx-auto">
            Kelola dokumen PDF atau buat slip gaji dengan mudah dan cepat. Semua
            fitur tersedia secara gratis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* PDF Editor Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/pdf-editor"
              className="group block glass-card p-8 hover:border-primary-500/50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileEdit className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">PDF Editor</h2>
              <p className="text-dark-300 mb-6">
                Edit dokumen PDF seperti bank statement, invoice, atau dokumen
                lainnya. Ubah teks langsung sambil mempertahankan format asli.
              </p>
              <div className="flex items-center text-primary-400 font-medium group-hover:gap-3 gap-2 transition-all">
                <span>Mulai Edit</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </motion.div>

          {/* Salary Slip Generator Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/salary-slip"
              className="group block glass-card p-8 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Slip Gaji Generator
              </h2>
              <p className="text-dark-300 mb-6">
                Buat slip gaji profesional dengan perhitungan PPh 21 dan BPJS
                yang sesuai peraturan Indonesia. Pilih dari berbagai template.
              </p>
              <div className="flex items-center text-emerald-400 font-medium group-hover:gap-3 gap-2 transition-all">
                <span>Buat Slip Gaji</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <p className="text-dark-400 text-sm">
            ✓ Gratis tanpa batasan &nbsp; ✓ Privasi terjaga &nbsp; ✓ Tidak perlu
            registrasi
          </p>
        </motion.div>
      </main>
    </div>
  );
}
