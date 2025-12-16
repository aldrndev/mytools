const API_BASE = (import.meta.env.VITE_API_URL || "") + "/api";

export interface UploadResponse {
  success: boolean;
  document?: {
    id: string;
    filename: string;
    totalPages: number;
    pages: Array<{
      pageIndex: number;
      width: number;
      height: number;
      textItems: Array<{
        id: string;
        text: string;
        x: number;
        y: number;
        width: number;
        height: number;
        fontSize: number;
        fontName: string;
        pageIndex: number;
      }>;
    }>;
  };
  error?: string;
}

export interface EditRequest {
  documentId: string;
  edits: Array<{
    textItemId: string;
    pageIndex: number;
    originalText: string;
    newText: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontName: string;
    shift?: number;
  }>;
  password?: string;
}

export interface EditResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
  code?: string; // Add code for error handling
}

export async function uploadPdf(
  file: File,
  password?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (password) {
    headers["x-pdf-password"] = password;
  }

  const response = await fetch(`${API_BASE}/pdf/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw {
      message: error.error || "Failed to upload PDF",
      code: error.code, // Pass error code to caller
    };
  }

  return response.json();
}

export async function editPdf(request: EditRequest): Promise<EditResponse> {
  const response = await fetch(`${API_BASE}/pdf/edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to edit PDF");
  }

  return response.json();
}

export function getDownloadUrl(documentId: string): string {
  return `${API_BASE}/pdf/${documentId}/download`;
}
