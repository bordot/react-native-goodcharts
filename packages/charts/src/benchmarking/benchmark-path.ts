import { buildLinePath } from "../utils/path-builder";

export const benchmarkPathBuild = (
  points: number,
): { points: number; durationMs: number } => {
  const input = Array.from({ length: points }, (_, index) => ({
    x: index,
    y: Math.sin(index / 20) * 50 + 100,
    value: index,
    label: String(index),
    index,
    datum: { index },
  }));

  const start = Date.now();
  buildLinePath(input);
  const durationMs = Date.now() - start;

  return { points, durationMs };
};
