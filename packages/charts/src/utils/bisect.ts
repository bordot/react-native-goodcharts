import type { CartesianInteractionPoint, ChartPoint } from "../types";

export const findNearestPointIndex = <T>(
  points: ChartPoint<T>[],
  x: number,
): number => {
  if (points.length === 0) {
    return -1;
  }

  let low = 0;
  let high = points.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const point = points[mid];
    if (point.x === x) {
      return mid;
    }
    if (point.x < x) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const left = Math.max(0, high);
  const right = Math.min(points.length - 1, low);
  return Math.abs(points[left].x - x) <= Math.abs(points[right].x - x)
    ? left
    : right;
};

export const findNearestInteractionPointIndex = (
  points: CartesianInteractionPoint[],
  x: number,
  y: number,
): number => {
  "worklet";

  if (points.length === 0) {
    return -1;
  }

  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = dx * dx + dy * dy;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
};

export const findInteractionRangeDataIndices = (
  points: CartesianInteractionPoint[],
  left: number,
  right: number,
  seriesIndex = 0,
): number[] => {
  "worklet";

  if (points.length === 0) {
    return [];
  }

  const min = Math.min(left, right);
  const max = Math.max(left, right);
  const dataIndices: number[] = [];

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    if (point.seriesIndex !== seriesIndex) {
      continue;
    }
    if (point.x < min || point.x > max) {
      continue;
    }
    if (dataIndices[dataIndices.length - 1] !== point.dataIndex) {
      dataIndices.push(point.dataIndex);
    }
  }

  return dataIndices;
};
