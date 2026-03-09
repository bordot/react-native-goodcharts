import type { ChartTheme } from "../types";

export const lightTheme: ChartTheme = {
  backgroundColor: "#FFFFFF",
  axisLineColor: "#D1D5DB",
  axisLabelColor: "#6B7280",
  axisLabelSize: 11,
  axisTitleColor: "#374151",
  axisTitleSize: 13,
  gridColor: "#E5E7EB",
  gridStrokeWidth: 1,
  colors: ["#2563EB", "#059669", "#F59E0B", "#DC2626", "#7C3AED", "#EC4899"],
  tooltipBackground: "#111827",
  tooltipText: "#F9FAFB",
  tooltipBorder: "#1F2937",
  tooltipBorderRadius: 10,
  crosshairColor: "#9CA3AF",
  crosshairLabelBackground: "#1F2937",
  crosshairLabelText: "#F9FAFB",
  legendLabelColor: "#374151",
  legendLabelSize: 12,
  selectionColor: "rgba(37,99,235,0.18)",
  selectionBorderColor: "#2563EB",
  animationDuration: 450,
  bullColor: "#10B981",
  bearColor: "#EF4444",
};

export const darkTheme: ChartTheme = {
  ...lightTheme,
  backgroundColor: "#09090B",
  axisLineColor: "#27272A",
  axisLabelColor: "#A1A1AA",
  axisTitleColor: "#FAFAFA",
  gridColor: "#18181B",
  tooltipBackground: "#18181B",
  tooltipText: "#FAFAFA",
  tooltipBorder: "#27272A",
  legendLabelColor: "#FAFAFA",
  crosshairColor: "#52525B",
};

export const bloombergTheme: ChartTheme = {
  ...darkTheme,
  backgroundColor: "#0A0E17",
  axisLineColor: "#253047",
  axisLabelColor: "#8891A5",
  gridColor: "#151E2D",
  colors: ["#FF8C00", "#00D4FF", "#00FF88", "#FF4466", "#FFD700", "#A78BFA"],
  bullColor: "#00FF88",
  bearColor: "#FF4466",
};

export const minimalTheme: ChartTheme = {
  ...lightTheme,
  gridColor: "transparent",
  axisLineColor: "#E5E7EB",
  colors: ["#111827", "#6B7280", "#2563EB", "#059669"],
};

export const createTheme = (overrides: Partial<ChartTheme>): ChartTheme => ({
  ...lightTheme,
  ...overrides,
  colors: overrides.colors ?? lightTheme.colors,
});

export const resolveTheme = (
  theme: Partial<ChartTheme> | ChartTheme | undefined,
  parentTheme: ChartTheme | undefined,
): ChartTheme =>
  createTheme({ ...(parentTheme ?? lightTheme), ...(theme ?? {}) });
