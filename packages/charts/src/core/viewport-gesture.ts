import type { CartesianViewport } from "../types";

export interface ViewportPanConfig {
  totalPoints: number;
  chartWidth: number;
  startIndex: number;
  size: number;
  dx: number;
  minPoints?: number;
  maxPoints?: number;
  overscan?: number;
}

export interface ViewportPinchConfig {
  totalPoints: number;
  startIndex: number;
  size: number;
  scale: number;
  focalRatio?: number;
  minPoints?: number;
  maxPoints?: number;
  overscan?: number;
}

const clamp = (value: number, min: number, max: number): number => {
  "worklet";
  return Math.max(min, Math.min(value, max));
};

const clampViewportSize = (
  size: number,
  totalPoints: number,
  minPoints = 24,
  maxPoints?: number,
) => {
  "worklet";

  const safeMinPoints = clamp(minPoints, 1, Math.max(1, totalPoints));
  const safeMaxPoints = clamp(
    maxPoints ?? totalPoints,
    safeMinPoints,
    Math.max(1, totalPoints),
  );

  return clamp(Math.round(size), safeMinPoints, safeMaxPoints);
};

export const createPannedViewport = ({
  totalPoints,
  chartWidth,
  startIndex,
  size,
  dx,
  minPoints = 24,
  maxPoints,
  overscan = 0,
}: ViewportPanConfig): CartesianViewport => {
  "worklet";

  const boundedSize = clampViewportSize(
    size,
    totalPoints,
    minPoints,
    maxPoints,
  );
  const boundedStart = clamp(
    startIndex,
    0,
    Math.max(0, totalPoints - boundedSize),
  );
  const pointShift = Math.round((-dx / Math.max(chartWidth, 1)) * boundedSize);
  const nextStart = clamp(
    boundedStart + pointShift,
    0,
    Math.max(0, totalPoints - boundedSize),
  );

  return {
    startIndex: nextStart,
    size: boundedSize,
    overscan,
  };
};

export const createPinchedViewport = ({
  totalPoints,
  startIndex,
  size,
  scale,
  focalRatio = 0.5,
  minPoints = 24,
  maxPoints,
  overscan = 0,
}: ViewportPinchConfig): CartesianViewport => {
  "worklet";

  const boundedSize = clampViewportSize(
    size,
    totalPoints,
    minPoints,
    maxPoints,
  );
  const boundedStart = clamp(
    startIndex,
    0,
    Math.max(0, totalPoints - boundedSize),
  );
  const boundedFocalRatio = clamp(focalRatio, 0, 1);
  const zoomScale = clamp(scale, 0.35, 4);
  const nextSize = clampViewportSize(
    boundedSize / zoomScale,
    totalPoints,
    minPoints,
    maxPoints,
  );
  const focalIndex = boundedStart + boundedSize * boundedFocalRatio;
  const nextStart = clamp(
    Math.round(focalIndex - nextSize * boundedFocalRatio),
    0,
    Math.max(0, totalPoints - nextSize),
  );

  return {
    startIndex: nextStart,
    size: nextSize,
    overscan,
  };
};
