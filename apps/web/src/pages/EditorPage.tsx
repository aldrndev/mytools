import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileEdit, Sparkles, Shield, Zap } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { PdfUploader } from "@/components/PdfUploader";
import { PdfViewer } from "@/components/PdfViewer";
import { EditorToolbar } from "@/components/EditorToolbar";
import { EditsSidebar } from "@/components/EditsSidebar";
import { TutorialModal } from "@/components/TutorialModal";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function EditorPage() {
  const { document, pdfFile, isLoading, password } = useEditorStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (pdfFile) {
      setShowTutorial(true);
    }
  }, [pdfFile]);

  // Drag scrolling state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't trigger drag if clicking on inputs or text items
    if (
      (e.target as HTMLElement).closest("input") ||
      (e.target as HTMLElement).closest(".text-item")
    ) {
      return;
    }

    setIsDragging(true);
    setStartPos({ x: e.pageX, y: e.pageY });
    if (scrollContainerRef.current) {
      setScrollPos({
        left: scrollContainerRef.current.scrollLeft,
        top: scrollContainerRef.current.scrollTop,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const walkX = e.pageX - startPos.x;
    const walkY = e.pageY - startPos.y;
    scrollContainerRef.current.scrollLeft = scrollPos.left - walkX;
    scrollContainerRef.current.scrollTop = scrollPos.top - walkY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Show uploader if no document
  if (!document || !pdfFile) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6 px-8 border-b border-dark-700/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 -ml-2 rounded-xl text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <FileEdit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Bank Statement Editor
                </h1>
                <p className="text-xs text-dark-400">
                  Edit documents while preserving format
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
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Edit Your Bank Statements
            </h2>
            <p className="text-lg text-dark-300 max-w-xl mx-auto">
              Upload bank statements to start editing. Edit text directly while
              preserving the original format.
            </p>
          </motion.div>

          <PdfUploader />

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl"
          >
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Preserve Format"
              description="Edit text without changing fonts, layouts, or styling"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Instant Preview"
              description="See your changes in real-time before downloading"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure & Private"
              description="Your files are processed locally and never stored"
            />
          </motion.div>
        </main>
      </div>
    );
  }

  // Show editor
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-3 sm:py-4 px-4 sm:px-6 border-b border-dark-700/50">
        <EditorToolbar />
      </header>

      {/* Editor Area */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* PDF Viewer - Scrollable Area */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 p-4 sm:p-6 overflow-auto bg-dark-900/50 relative ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="min-w-full min-h-full w-fit flex items-center justify-center mx-auto pointer-events-none">
            <div className="pointer-events-auto">
              <PdfViewer file={pdfFile} password={password} />
              <TutorialModal
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Sidebar - Overlay on mobile, side panel on desktop */}
        <aside
          className={`
            fixed lg:relative inset-y-0 right-0 z-30
            w-80 max-w-[90vw]
            bg-dark-900 lg:bg-transparent
            border-l border-dark-700/50 
            p-4
            transform transition-transform duration-300 ease-in-out
            ${
              sidebarOpen
                ? "translate-x-0"
                : "translate-x-full lg:translate-x-0"
            }
          `}
        >
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-dark-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="mt-8 lg:mt-0">
            <EditsSidebar />
          </div>
        </aside>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 sm:p-8 text-center mx-4">
            <div className="w-12 h-12 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-dark-100">Processing...</p>
            <p className="text-sm text-dark-400 mt-1">
              Please wait while we save your changes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4 text-primary-400">
        {icon}
      </div>
      <h3 className="font-semibold text-dark-100 mb-2">{title}</h3>
      <p className="text-sm text-dark-400">{description}</p>
    </div>
  );
}
