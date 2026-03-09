import type { ChartBounds, ChartPadding } from "../types";

export const defaultPadding: ChartPadding = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 48,
};

export const resolvePadding = (
  padding?: Partial<ChartPadding>,
): ChartPadding => ({
  ...defaultPadding,
  ...padding,
});

export const createBounds = (
  width: number,
  height: number,
  padding?: Partial<ChartPadding>,
): ChartBounds => {
  const resolved = resolvePadding(padding);
  return {
    width,
    height,
    padding: resolved,
    innerWidth: Math.max(0, width - resolved.left - resolved.right),
    innerHeight: Math.max(0, height - resolved.top - resolved.bottom),
  };
};
