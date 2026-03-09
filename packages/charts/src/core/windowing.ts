import type { ChartPoint } from "../types";

export interface WindowRange {
  startIndex: number;
  endIndex: number;
}

export const clampWindowRange = (
  total: number,
  startIndex: number,
  endIndex: number,
): WindowRange => {
  if (total <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const safeStart = Math.max(0, Math.min(startIndex, total - 1));
  const safeEnd = Math.max(safeStart + 1, Math.min(endIndex, total));

  return {
    startIndex: safeStart,
    endIndex: safeEnd,
  };
};

export const createWindowRange = (
  total: number,
  viewportStart: number,
  viewportSize: number,
  overscan = 2,
): WindowRange => {
  const startIndex = Math.floor(viewportStart) - overscan;
  const endIndex = Math.ceil(viewportStart + viewportSize) + overscan;
  return clampWindowRange(total, startIndex, endIndex);
};

export const sliceWindow = <T>(values: T[], range: WindowRange): T[] =>
  values.slice(range.startIndex, range.endIndex);

export const slicePointWindow = <T>(
  points: ChartPoint<T>[],
  range: WindowRange,
): ChartPoint<T>[] => sliceWindow(points, range);
