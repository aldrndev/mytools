import { create } from "zustand";

export interface TextItem {
  id: string;
  text: string;
  originalText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  pageIndex: number;
  isModified: boolean;
}

export interface PdfPage {
  pageIndex: number;
  width: number;
  height: number;
  textItems: TextItem[];
}

export interface FontInfo {
  name: string;
  type: string;
}

export interface PdfDocument {
  id: string;
  filename: string;
  totalPages: number;
  pages: PdfPage[];
  fonts?: Record<string, FontInfo>;
}

interface EditorState {
  document: PdfDocument | null;
  pdfFile: File | null;
  currentPage: number;
  zoom: number;
  editingItemId: string | null;
  isLoading: boolean;
  error: string | null;
  password: string | null;
  loadedFonts: Set<string>;

  // Actions
  setDocument: (doc: PdfDocument) => void;
  setPdfFile: (file: File) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  setEditingItemId: (id: string | null) => void;
  updateTextItem: (id: string, newText: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPassword: (password: string | null) => void;
  reset: () => void;
  getModifiedItems: () => TextItem[];
  addLoadedFont: (fontName: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  document: null,
  pdfFile: null,
  currentPage: 0,
  zoom: 1,
  editingItemId: null,
  isLoading: false,
  error: null,
  password: null, // Store password for edit operations
  loadedFonts: new Set<string>(),

  setPassword: (password) => set({ password }), // Action to set password

  setDocument: (doc) => {
    // Transform API response to include originalText and isModified
    const transformedPages = doc.pages.map((page) => ({
      ...page,
      textItems: page.textItems.map((item) => ({
        ...item,
        originalText: item.text,
        isModified: false,
      })),
    }));

    set({
      document: {
        ...doc,
        pages: transformedPages,
      },
    });
  },

  setPdfFile: (file) => set({ pdfFile: file }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),

  setEditingItemId: (id) => set({ editingItemId: id }),

  updateTextItem: (id, newText) => {
    const { document } = get();
    if (!document) return;

    const updatedPages = document.pages.map((page) => ({
      ...page,
      textItems: page.textItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            text: newText,
            isModified: newText !== item.originalText,
          };
        }
        return item;
      }),
    }));

    set({
      document: {
        ...document,
        pages: updatedPages,
      },
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      document: null,
      pdfFile: null,
      currentPage: 0,
      zoom: 1,
      editingItemId: null,
      isLoading: false,
      error: null,
      loadedFonts: new Set<string>(),
    }),

  getModifiedItems: () => {
    const { document } = get();
    if (!document) return [];

    return document.pages.flatMap((page) =>
      page.textItems.filter((item) => item.isModified)
    );
  },

  addLoadedFont: (fontName) => {
    const { loadedFonts } = get();
    const newSet = new Set(loadedFonts);
    newSet.add(fontName);
    set({ loadedFonts: newSet });
  },
}));
