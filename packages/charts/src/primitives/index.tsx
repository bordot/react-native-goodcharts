import {
  Circle,
  Group,
  Path,
  Rect,
  Skia,
  Line as SkiaLine,
} from "@shopify/react-native-skia";
import type { ChartPoint } from "../types";
import {
  buildArcPath,
  buildAreaPath,
  buildLinePath,
} from "../utils/path-builder";

export const GridLines = ({
  xTicks,
  yTicks,
  left,
  right,
  top,
  bottom,
  color,
  strokeWidth = 1,
}: {
  xTicks: number[];
  yTicks: number[];
  left: number;
  right: number;
  top: number;
  bottom: number;
  color: string;
  strokeWidth?: number;
}) => (
  <Group>
    {yTicks.map((y) => (
      <SkiaLine
        key={`y-${y}`}
        p1={{ x: left, y }}
        p2={{ x: right, y }}
        color={color}
        strokeWidth={strokeWidth}
      />
    ))}
    {xTicks.map((x) => (
      <SkiaLine
        key={`x-${x}`}
        p1={{ x, y: top }}
        p2={{ x, y: bottom }}
        color={color}
        strokeWidth={strokeWidth}
      />
    ))}
  </Group>
);

export const Line = <T,>({
  points,
  color,
  strokeWidth = 3,
}: {
  points: ChartPoint<T>[];
  color: string;
  strokeWidth?: number;
}) => {
  const path = Skia.Path.MakeFromSVGString(buildLinePath(points));
  if (!path) {
    return null;
  }
  return (
    <Path path={path} color={color} style="stroke" strokeWidth={strokeWidth} />
  );
};

export const Area = <T,>({
  points,
  baselineY,
  color,
}: {
  points: ChartPoint<T>[];
  baselineY: number;
  color: string;
}) => {
  const path = Skia.Path.MakeFromSVGString(buildAreaPath(points, baselineY));
  if (!path) {
    return null;
  }
  return <Path path={path} color={color} opacity={0.18} />;
};

export const Bar = ({
  x,
  y,
  width,
  height,
  color,
}: { x: number; y: number; width: number; height: number; color: string }) => (
  <Rect x={x} y={y} width={width} height={height} color={color} />
);

export const Scatter = <T,>({
  points,
  color,
  radius = 4,
}: {
  points: ChartPoint<T>[];
  color: string;
  radius?: number;
}) => (
  <Group>
    {points.map((point) => (
      <Circle
        key={`${point.index}-${point.x}`}
        cx={point.x}
        cy={point.y}
        r={radius}
        color={color}
      />
    ))}
  </Group>
);

export const Arc = ({
  cx,
  cy,
  outerRadius,
  startAngle,
  endAngle,
  color,
  innerRadius = 0,
}: {
  cx: number;
  cy: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  color: string;
  innerRadius?: number;
}) => {
  const path = Skia.Path.MakeFromSVGString(
    buildArcPath(cx, cy, outerRadius, startAngle, endAngle, innerRadius),
  );
  if (!path) {
    return null;
  }
  return <Path path={path} color={color} />;
};

export const ReferenceLine = ({
  x1,
  y1,
  x2,
  y2,
  color,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}) => (
  <SkiaLine
    p1={{ x: x1, y: y1 }}
    p2={{ x: x2, y: y2 }}
    color={color}
    strokeWidth={1}
  />
);

export const ReferenceBand = ({
  x,
  y,
  width,
  height,
  color,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}) => (
  <Rect
    x={x}
    y={y}
    width={width}
    height={height}
    color={color}
    opacity={0.12}
  />
);

export const Annotation = () => null;
