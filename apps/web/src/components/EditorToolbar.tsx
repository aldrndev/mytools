import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Edit3,
  CheckCircle,
  X,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEditorStore } from "@/stores/editorStore";
import { editPdf, type EditRequest } from "@/services/api";

export function EditorToolbar() {
  const {
    document,
    pdfFile,
    currentPage,
    zoom,
    setCurrentPage,
    setZoom,
    reset,
    getModifiedItems,
    setLoading,
    setError,
    password,
  } = useEditorStore();

  const modifiedItems = getModifiedItems();
  const hasChanges = modifiedItems.length > 0;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!document) throw new Error("No document loaded");

      const edits: EditRequest["edits"] = modifiedItems.map((item) => ({
        textItemId: item.id,
        pageIndex: item.pageIndex,
        originalText: item.originalText,
        newText: item.text,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        fontSize: item.fontSize,
        fontName: item.fontName,
      }));

      const response = await editPdf({
        documentId: document.id,
        edits,
        password: password || undefined,
      });

      return response;
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      setLoading(false);
      if (data.success && data.downloadUrl) {
        // Trigger download
        const link = window.document.createElement("a");
        link.href = data.downloadUrl;
        link.download = `edited-${pdfFile?.name || "document.pdf"}`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } else {
        setError(data.error || "Failed to save PDF");
      }
    },
    onError: (err: Error) => {
      setLoading(false);
      setError(err.message);
    },
  });

  if (!document) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mb-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* File Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-dark-100 truncate max-w-[200px]">
              {pdfFile?.name || "Document"}
            </p>
            <p className="text-sm text-dark-400">
              Page {currentPage + 1} of {document.totalPages}
            </p>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-1 rounded-lg bg-dark-800 text-sm font-medium">
            {currentPage + 1} / {document.totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(document.totalPages - 1, currentPage + 1))
            }
            disabled={currentPage === document.totalPages - 1}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(zoom - 0.25)}
            disabled={zoom <= 0.5}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 disabled:opacity-50 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="px-3 py-1 rounded-lg bg-dark-800 text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.25)}
            disabled={zoom >= 3}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 disabled:opacity-50 transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              {modifiedItems.length} change{modifiedItems.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>

          <button
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
            className="btn-gradient flex items-center gap-2 px-5 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save & Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
