import type { ChartPoint } from "../types";

export const buildLinePath = <T>(points: ChartPoint<T>[]): string => {
  if (points.length === 0) {
    return "";
  }

  const segments = points.map((point, index) => {
    const prefix = index === 0 ? "M" : "L";
    return `${prefix}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  });

  return segments.join(" ");
};

export const buildAreaPath = <T>(
  points: ChartPoint<T>[],
  baselineY: number,
): string => {
  if (points.length === 0) {
    return "";
  }

  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L${last.x.toFixed(2)} ${baselineY.toFixed(2)} L${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
};

export const buildArcPath = (
  cx: number,
  cy: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  innerRadius = 0,
): string => {
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  const sx = cx + outerRadius * Math.cos(startAngle);
  const sy = cy + outerRadius * Math.sin(startAngle);
  const ex = cx + outerRadius * Math.cos(endAngle);
  const ey = cy + outerRadius * Math.sin(endAngle);

  if (innerRadius <= 0) {
    return `M${cx} ${cy} L${sx} ${sy} A${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${ex} ${ey} Z`;
  }

  const isx = cx + innerRadius * Math.cos(endAngle);
  const isy = cy + innerRadius * Math.sin(endAngle);
  const iex = cx + innerRadius * Math.cos(startAngle);
  const iey = cy + innerRadius * Math.sin(startAngle);

  return `M${sx} ${sy} A${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${ex} ${ey} L${isx} ${isy} A${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${iex} ${iey} Z`;
};
