import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, Lock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { uploadPdf } from "@/services/api";
import { useEditorStore } from "@/stores/editorStore";

export function PdfUploader() {
  const {
    setDocument,
    setPdfFile,
    setLoading,
    setError,
    isLoading,
    error,
    setPassword,
  } = useEditorStore();

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (vars: { file: File; password?: string }) =>
      uploadPdf(vars.file, vars.password),
    onMutate: () => {
      setLoading(true);
      setError(null);
      setIsPasswordInvalid(false);
    },
    onSuccess: (data) => {
      if (data.success && data.document) {
        setDocument(data.document as any);
        // Save valid password to store for future edits
        if (passwordInput) {
          setPassword(passwordInput);
        }
      } else {
        setError(data.error || "Failed to parse PDF");
      }
      setLoading(false);
      setShowPasswordPrompt(false);
    },
    onError: (err: any) => {
      console.log("Upload error:", err);
      if (err.code === "PASSWORD_REQUIRED") {
        setShowPasswordPrompt(true);
        if (passwordInput) {
          setIsPasswordInvalid(true);
        }
        // Don't set error message yet, prompt user
      } else {
        setError(err.message || "Failed to upload");
      }
      setLoading(false);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setPdfFile(file);
        setTempFile(file);
        // Try uploading without password first
        uploadMutation.mutate({ file });
      }
    },
    [setPdfFile, uploadMutation]
  );

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempFile && passwordInput) {
      uploadMutation.mutate({ file: tempFile, password: passwordInput });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <AnimatePresence mode="wait">
        {!showPasswordPrompt ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`upload-zone rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragActive ? "active" : ""
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center gap-6">
                {isLoading ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center animate-pulse">
                      <FileText className="w-8 h-8 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-dark-200">
                        Processing PDF...
                      </p>
                      <p className="text-sm text-dark-400 mt-1">
                        Extracting text and positions
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center"
                      animate={{ scale: isDragActive ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Upload className="w-10 h-10 text-primary-400" />
                    </motion.div>

                    <div>
                      <p className="text-xl font-semibold text-dark-100">
                        {isDragActive
                          ? "Drop your PDF here"
                          : "Drag & drop your PDF here"}
                      </p>
                      <p className="text-dark-400 mt-2">
                        or{" "}
                        <span className="text-primary-400 font-medium">
                          click to browse
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-dark-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        PDF only
                      </span>
                      <span>•</span>
                      <span>Max 50MB</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="password-prompt"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-dark-800 rounded-2xl p-8 border border-dark-700 shadow-xl"
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Password Required
                </h3>
                <p className="text-dark-400 mt-2">
                  This PDF is protected. Please enter the password to unlock it.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setIsPasswordInvalid(false);
                    }}
                    className={`flex-1 bg-dark-950 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors ${
                      isPasswordInvalid
                        ? "border-red-500 focus:border-red-500"
                        : "border-dark-700 focus:border-primary-500"
                    }`}
                    placeholder="Enter PDF password"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!passwordInput || isLoading}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Unlocking..." : "Unlock"}
                  </button>
                </div>
                {isPasswordInvalid && (
                  <p className="text-red-400 text-sm mt-2 text-left animate-shake">
                    Incorrect password. Please try again.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPasswordPrompt(false)}
                  className="mt-4 text-sm text-dark-500 hover:text-dark-300 underline"
                >
                  Cancel upload
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && !showPasswordPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-400">Error</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
