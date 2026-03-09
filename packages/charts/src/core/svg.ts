import type {
  AxisTick,
  ChartBounds,
  ChartPoint,
  ChartTheme,
  LegendConfig,
  LegendItem,
} from "../types";

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const numberAttr = (value: number): string =>
  Number.isFinite(value) ? value.toFixed(2) : "0";

const optionalAttr = (name: string, value: string | number | undefined) => {
  if (value === undefined) {
    return "";
  }

  return ` ${name}="${escapeXml(String(value))}"`;
};

export const svgDocument = ({
  width,
  height,
  backgroundColor,
  content,
  radius = 20,
}: {
  width: number;
  height: number;
  backgroundColor: string;
  content: string;
  radius?: number;
}) =>
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${numberAttr(width)}" height="${numberAttr(height)}" viewBox="0 0 ${numberAttr(width)} ${numberAttr(height)}" fill="none">`,
    svgRect({
      x: 0,
      y: 0,
      width,
      height,
      fill: backgroundColor,
      rx: radius,
    }),
    content,
    "</svg>",
  ].join("");

export const svgPath = ({
  d,
  stroke,
  strokeWidth,
  fill = "none",
  opacity,
}: {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
}) => {
  if (!d) {
    return "";
  }

  return `<path d="${escapeXml(d)}"${optionalAttr("stroke", stroke)}${optionalAttr("stroke-width", strokeWidth)}${optionalAttr("fill", fill)}${optionalAttr("opacity", opacity)} />`;
};

export const svgRect = ({
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  rx,
  opacity,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
  opacity?: number;
}) =>
  `<rect x="${numberAttr(x)}" y="${numberAttr(y)}" width="${numberAttr(width)}" height="${numberAttr(height)}"${optionalAttr("fill", fill)}${optionalAttr("stroke", stroke)}${optionalAttr("stroke-width", strokeWidth)}${optionalAttr("rx", rx)}${optionalAttr("opacity", opacity)} />`;

export const svgCircle = ({
  cx,
  cy,
  r,
  fill,
  opacity,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity?: number;
}) =>
  `<circle cx="${numberAttr(cx)}" cy="${numberAttr(cy)}" r="${numberAttr(r)}"${optionalAttr("fill", fill)}${optionalAttr("opacity", opacity)} />`;

export const svgLineSegment = ({
  x1,
  y1,
  x2,
  y2,
  stroke,
  strokeWidth = 1,
  opacity,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth?: number;
  opacity?: number;
}) =>
  `<line x1="${numberAttr(x1)}" y1="${numberAttr(y1)}" x2="${numberAttr(x2)}" y2="${numberAttr(y2)}"${optionalAttr("stroke", stroke)}${optionalAttr("stroke-width", strokeWidth)}${optionalAttr("opacity", opacity)} />`;

export const svgText = ({
  x,
  y,
  text,
  fill,
  fontSize,
  textAnchor,
  fontWeight,
  dominantBaseline,
}: {
  x: number;
  y: number;
  text: string;
  fill: string;
  fontSize: number;
  textAnchor?: "start" | "middle" | "end";
  fontWeight?: string | number;
  dominantBaseline?: "auto" | "middle" | "hanging" | "central";
}) =>
  `<text x="${numberAttr(x)}" y="${numberAttr(y)}"${optionalAttr("fill", fill)}${optionalAttr("font-size", fontSize)}${optionalAttr("text-anchor", textAnchor)}${optionalAttr("font-weight", fontWeight)}${optionalAttr("dominant-baseline", dominantBaseline)}>${escapeXml(text)}</text>`;

export const svgGrid = ({
  bounds,
  xTicks,
  yTicks,
  color,
  strokeWidth,
}: {
  bounds: ChartBounds;
  xTicks: AxisTick[];
  yTicks: AxisTick[];
  color: string;
  strokeWidth: number;
}) =>
  [
    ...yTicks.map((tick) =>
      svgLineSegment({
        x1: bounds.padding.left,
        y1: tick.position,
        x2: bounds.padding.left + bounds.innerWidth,
        y2: tick.position,
        stroke: color,
        strokeWidth,
      }),
    ),
    ...xTicks.map((tick) =>
      svgLineSegment({
        x1: tick.position,
        y1: bounds.padding.top,
        x2: tick.position,
        y2: bounds.padding.top + bounds.innerHeight,
        stroke: color,
        strokeWidth,
      }),
    ),
  ].join("");

export const svgCartesianAxes = ({
  bounds,
  xTicks,
  yTicks,
  labelColor,
  labelSize,
}: {
  bounds: ChartBounds;
  xTicks: AxisTick[];
  yTicks: AxisTick[];
  labelColor: string;
  labelSize: number;
}) =>
  [
    ...xTicks.map((tick) =>
      svgText({
        x: tick.position,
        y: bounds.height - 10,
        text: tick.label,
        fill: labelColor,
        fontSize: labelSize,
        textAnchor: "middle",
        dominantBaseline: "middle",
      }),
    ),
    ...yTicks.map((tick) =>
      svgText({
        x: 40,
        y: tick.position,
        text: tick.label,
        fill: labelColor,
        fontSize: labelSize,
        textAnchor: "end",
        dominantBaseline: "middle",
      }),
    ),
  ].join("");

export const svgLegend = ({
  items,
  config,
  theme,
  x = 12,
  y = 8,
}: {
  items: LegendItem[];
  config?: boolean | LegendConfig;
  theme: ChartTheme;
  x?: number;
  y?: number;
}) => {
  if (config === false || items.length === 0) {
    return "";
  }

  const resolved = typeof config === "object" ? config : {};
  const vertical = resolved.layout === "vertical";
  const markerSize = resolved.markerSize ?? 10;
  const itemSpacing = resolved.itemSpacing ?? 12;
  const labelSize = resolved.labelSize ?? theme.legendLabelSize;
  const labelColor = resolved.labelColor ?? theme.legendLabelColor;
  const rowHeight = Math.max(markerSize, labelSize) + 8;
  const estimatedWidths = items.map(
    (item) => markerSize + 10 + item.label.length * (labelSize * 0.62),
  );
  const contentWidth = vertical
    ? Math.max(...estimatedWidths, 0)
    : estimatedWidths.reduce((sum, widthValue) => sum + widthValue, 0) +
      Math.max(0, items.length - 1) * itemSpacing;
  const contentHeight = vertical
    ? items.length * rowHeight + Math.max(0, items.length - 1) * 4
    : rowHeight;

  return [
    svgRect({
      x,
      y,
      width: contentWidth + 20,
      height: contentHeight + 12,
      fill: "rgba(255,255,255,0.72)",
      rx: 999,
    }),
    ...items.flatMap((item, index) => {
      const itemX = vertical
        ? x + 10
        : x +
          10 +
          estimatedWidths
            .slice(0, index)
            .reduce((sum, widthValue) => sum + widthValue, 0) +
          index * itemSpacing;
      const itemY = vertical ? y + 6 + index * (rowHeight + 4) : y + 6;
      return [
        svgCircle({
          cx: itemX + markerSize / 2,
          cy: itemY + rowHeight / 2,
          r: markerSize / 2,
          fill: item.color,
        }),
        svgText({
          x: itemX + markerSize + 6,
          y: itemY + rowHeight / 2,
          text: item.label,
          fill: labelColor,
          fontSize: labelSize,
          dominantBaseline: "middle",
        }),
      ];
    }),
  ].join("");
};

export const svgPolylinePoints = <T>(points: ChartPoint<T>[]): string =>
  points
    .map((point) => `${numberAttr(point.x)},${numberAttr(point.y)}`)
    .join(" ");
