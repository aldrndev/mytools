import { motion } from "framer-motion";
import { Edit3, Trash2 } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";

export function EditsSidebar() {
  const { document, updateTextItem, setCurrentPage, setEditingItemId } =
    useEditorStore();

  const modifiedItems =
    document?.pages.flatMap((page) =>
      page.textItems.filter((item) => item.isModified)
    ) || [];

  if (modifiedItems.length === 0) {
    return (
      <div className="glass-card p-6 h-full">
        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-primary-400" />
          Your Edits
        </h3>
        <div className="text-center py-12 text-dark-400">
          <p className="text-sm">No edits yet</p>
          <p className="text-xs mt-2 text-dark-500">
            Click on any text in the PDF to edit it
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-full overflow-auto">
      <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
        <Edit3 className="w-5 h-5 text-primary-400" />
        Your Edits ({modifiedItems.length})
      </h3>

      <div className="space-y-3">
        {modifiedItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 rounded-xl bg-dark-800/50 border border-dark-600/50 hover:border-primary-500/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs text-dark-400 font-medium">
                Page {item.pageIndex + 1}
              </span>
              <button
                onClick={() => {
                  updateTextItem(item.id, item.originalText);
                }}
                className="p-1 rounded hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors"
                title="Revert change"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-dark-500 w-12">From:</span>
                <span className="text-sm text-red-400 line-through truncate">
                  {item.originalText}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-dark-500 w-12">To:</span>
                <span className="text-sm text-green-400 truncate">
                  {item.text}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentPage(item.pageIndex);
                setEditingItemId(item.id);
              }}
              className="mt-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              Go to edit →
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
