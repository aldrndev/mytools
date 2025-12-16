import type { SlipTheme } from "@pdf-editor/shared";

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
  headerText: string;
  accent: string;
}

export const THEMES: Record<SlipTheme, ThemeColors> = {
  default: {
    primary: "#000000",
    secondary: "#666666",
    background: "#ffffff",
    text: "#000000",
    border: "#000000",
    headerText: "#000000",
    accent: "#f0f0f0",
  },
  blue: {
    primary: "#1e40af", // blue-800
    secondary: "#3b82f6", // blue-500
    background: "#ffffff",
    text: "#1e293b", // slate-800
    border: "#93c5fd", // blue-300
    headerText: "#1e40af",
    accent: "#eff6ff", // blue-50
  },
  green: {
    primary: "#166534", // green-800
    secondary: "#22c55e", // green-500
    background: "#ffffff",
    text: "#14532d", // green-900
    border: "#86efac", // green-300
    headerText: "#166534",
    accent: "#f0fdf4", // green-50
  },
  dark: {
    primary: "#000000",
    secondary: "#374151", // gray-700
    background: "#f3f4f6", // gray-100 (Paper color, not dark mode UI)
    text: "#000000",
    border: "#000000",
    headerText: "#000000",
    accent: "#e5e7eb", // gray-200
  },
  red: {
    primary: "#991b1b", // red-800
    secondary: "#ef4444", // red-500
    background: "#ffffff",
    text: "#450a0a", // red-950
    border: "#fca5a5", // red-300
    headerText: "#991b1b",
    accent: "#fef2f2", // red-50
  },
  gold: {
    primary: "#854d0e", // yellow-800
    secondary: "#eab308", // yellow-500
    background: "#fffbeb", // amber-50
    text: "#422006", // amber-950
    border: "#fde047", // yellow-300
    headerText: "#854d0e",
    accent: "#fff7ed", // orange-50
  },
  grey: {
    primary: "#374151", // gray-700
    secondary: "#9ca3af", // gray-400
    background: "#ffffff",
    text: "#111827", // gray-900
    border: "#d1d5db", // gray-300
    headerText: "#374151",
    accent: "#f9fafb", // gray-50
  },
  orange: {
    primary: "#c2410c", // orange-700
    secondary: "#f97316", // orange-500
    background: "#ffffff",
    text: "#431407", // orange-950
    border: "#fdba74", // orange-300
    headerText: "#c2410c",
    accent: "#fff7ed", // orange-50
  },
  navy: {
    primary: "#172554", // blue-950
    secondary: "#1e3a8a", // blue-900
    background: "#ffffff",
    text: "#0f172a", // slate-900
    border: "#1e40af", // blue-800
    headerText: "#172554",
    accent: "#e0e7ff", // indigo-100
  },
  monochrome: {
    primary: "#000000",
    secondary: "#000000",
    background: "#ffffff",
    text: "#000000",
    border: "#000000",
    headerText: "#000000",
    accent: "#ffffff", // No accent background
  },
};

export function getThemeVariables(themeId: SlipTheme): string {
  const theme = THEMES[themeId] || THEMES.default;
  return `
    --primary-color: ${theme.primary};
    --secondary-color: ${theme.secondary};
    --bg-color: ${theme.background};
    --text-color: ${theme.text};
    --border-color: ${theme.border};
    --header-text-color: ${theme.headerText};
    --accent-color: ${theme.accent};
  `;
}
