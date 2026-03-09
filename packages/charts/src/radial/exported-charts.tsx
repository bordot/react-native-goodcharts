import type { ForwardedRef, ReactElement } from "react";
import { forwardRef, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import {
  svgCircle,
  svgDocument,
  svgLegend,
  svgLineSegment,
  svgPath,
  svgRect,
  svgText,
} from "../core/svg";
import { resolveTheme } from "../core/theme";
import { useChartExportViewRef } from "../core/use-chart-export-view-ref";
import { useChartTheme } from "../hooks/use-chart-theme";
import type { ChartRef, PieChartProps, RadarChartProps } from "../types";
import { buildArcPath, buildLinePath } from "../utils/path-builder";
import {
  DonutChart as DonutChartBase,
  PieChart as PieChartBase,
  RadarChart as RadarChartBase,
} from "./charts";

const createSlices = (
  values: number[],
): Array<{ start: number; end: number }> => {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  let current = -Math.PI / 2;
  return values.map((value) => {
    const start = current;
    const end = current + (value / total) * Math.PI * 2;
    current = end;
    return { start, end };
  });
};

const clampNumber = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const serializePieSvg = <T extends Record<string, unknown>>(
  props: PieChartProps<T>,
  innerRadius: number,
  width: number,
  backgroundColor: string,
  colors: string[],
  labelColor: string,
  labelSize: number,
): string => {
  const radius = Math.max(0, Math.min(width, props.height) / 2 - 18);
  const cx = width / 2;
  const cy = props.height / 2;
  const values = props.data.map((datum) => Number(datum[props.valueKey]));
  const labels = props.data.map((datum) => String(datum[props.labelKey]));
  const slices = createSlices(values);
  const activeIndex =
    props.exportOverlay?.tooltip?.dataIndex ?? props.exportOverlay?.activeIndex;
  const activeSlice =
    typeof activeIndex === "number" && activeIndex >= 0
      ? slices[activeIndex]
      : undefined;

  const overlayMarkup =
    typeof activeIndex === "number" && activeSlice
      ? (() => {
          const midAngle = (activeSlice.start + activeSlice.end) / 2;
          const tooltipWidth = 96;
          const tooltipHeight = 52;
          const anchorX = cx + Math.cos(midAngle) * radius * 0.7;
          const anchorY = cy + Math.sin(midAngle) * radius * 0.7;
          const boxLeft = clampNumber(
            anchorX - tooltipWidth / 2,
            8,
            width - tooltipWidth - 8,
          );
          const boxTop = clampNumber(
            anchorY - tooltipHeight - 12,
            8,
            props.height - tooltipHeight - 8,
          );
          const title =
            props.exportOverlay?.tooltip?.title ?? labels[activeIndex] ?? "";
          const value = String(values[activeIndex] ?? "");

          return [
            svgPath({
              d: buildArcPath(
                cx,
                cy,
                radius,
                activeSlice.start,
                activeSlice.end,
                radius * innerRadius,
              ),
              fill: "none",
              stroke: "#111827",
              strokeWidth: 2,
            }),
            svgRect({
              x: boxLeft,
              y: boxTop,
              width: tooltipWidth,
              height: tooltipHeight,
              fill: "#111827",
              stroke: "#1F2937",
              strokeWidth: 1,
              rx: 10,
            }),
            svgText({
              x: boxLeft + 12,
              y: boxTop + 18,
              text: title,
              fill: "#F9FAFB",
              fontSize: 12,
              fontWeight: 600,
            }),
            svgText({
              x: boxLeft + 12,
              y: boxTop + 36,
              text: value,
              fill: "#F9FAFB",
              fontSize: 12,
            }),
          ].join("");
        })()
      : "";

  return svgDocument({
    width,
    height: props.height,
    backgroundColor,
    content: [
      ...slices.map((slice, index) =>
        svgPath({
          d: buildArcPath(
            cx,
            cy,
            radius,
            slice.start,
            slice.end,
            radius * innerRadius,
          ),
          fill: colors[index % colors.length],
        }),
      ),
      overlayMarkup,
      svgLegend({
        items: labels.map((label, index) => ({
          label,
          color: colors[index % colors.length],
        })),
        config: props.legend,
        theme: {
          backgroundColor,
          axisLineColor: "",
          axisLabelColor: labelColor,
          axisLabelSize: labelSize,
          axisTitleColor: "",
          axisTitleSize: 0,
          gridColor: "",
          gridStrokeWidth: 0,
          colors,
          tooltipBackground: "",
          tooltipText: "",
          tooltipBorder: "",
          tooltipBorderRadius: 0,
          crosshairColor: "",
          crosshairLabelBackground: "",
          crosshairLabelText: "",
          legendLabelColor: labelColor,
          legendLabelSize: labelSize,
          selectionColor: "",
          selectionBorderColor: "",
          animationDuration: 0,
          bullColor: "",
          bearColor: "",
        },
        x: Math.max(12, width - 184),
        y: 8,
      }),
    ].join(""),
  });
};

const serializeRadarSvg = <T extends Record<string, unknown>>(
  props: RadarChartProps<T>,
  width: number,
  backgroundColor: string,
  gridColor: string,
  labelColor: string,
  labelSize: number,
): string => {
  const count = props.axes.length;
  const cx = width / 2;
  const cy = props.height / 2;
  const radius = Math.min(width, props.height) / 2 - 30;

  const axesMarkup = props.axes
    .map((axis, index) => {
      const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
      const x2 = cx + radius * Math.cos(angle);
      const y2 = cy + radius * Math.sin(angle);
      const labelX = cx + (radius + 14) * Math.cos(angle);
      const labelY = cy + (radius + 14) * Math.sin(angle);
      return [
        svgLineSegment({
          x1: cx,
          y1: cy,
          x2,
          y2,
          stroke: gridColor,
          strokeWidth: 1,
        }),
        svgText({
          x: labelX,
          y: labelY,
          text: axis,
          fill: labelColor,
          fontSize: labelSize,
          textAnchor: "middle",
          dominantBaseline: "middle",
        }),
      ].join("");
    })
    .join("");

  const seriesMarkup = props.series
    .map((series) => {
      const points = props.data.map((datum, index) => {
        const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
        const value = Math.max(0, Math.min(1, Number(datum[series.key])));
        return {
          x: cx + radius * value * Math.cos(angle),
          y: cy + radius * value * Math.sin(angle),
          value,
          label: props.axes[index] ?? String(index + 1),
          index,
          datum,
        };
      });
      const closed = points.length > 0 ? [...points, points[0]] : [];
      return [
        svgPath({
          d: buildLinePath(closed),
          stroke: series.color,
          strokeWidth: 2,
        }),
        ...points.map((point) =>
          svgCircle({ cx: point.x, cy: point.y, r: 3, fill: series.color }),
        ),
      ].join("");
    })
    .join("");

  return svgDocument({
    width,
    height: props.height,
    backgroundColor,
    content: [
      axesMarkup,
      seriesMarkup,
      svgLegend({
        items: props.series.map((series) => ({
          label: series.label,
          color: series.color,
        })),
        config: props.legend,
        theme: {
          backgroundColor,
          axisLineColor: "",
          axisLabelColor: labelColor,
          axisLabelSize: labelSize,
          axisTitleColor: "",
          axisTitleSize: 0,
          gridColor,
          gridStrokeWidth: 1,
          colors: props.series.map((series) => series.color),
          tooltipBackground: "",
          tooltipText: "",
          tooltipBorder: "",
          tooltipBorderRadius: 0,
          crosshairColor: "",
          crosshairLabelBackground: "",
          crosshairLabelText: "",
          legendLabelColor: labelColor,
          legendLabelSize: labelSize,
          selectionColor: "",
          selectionBorderColor: "",
          animationDuration: 0,
          bullColor: "",
          bearColor: "",
        },
        x: Math.max(12, width - 184),
        y: 8,
      }),
    ].join(""),
  });
};

function PieChartInner<T extends Record<string, unknown>>(
  props: PieChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const inheritedTheme = useChartTheme();
  const resolvedTheme = resolveTheme(props.theme, inheritedTheme);
  const window = useWindowDimensions();
  const width = props.width ?? Math.min(window.width - 24, 480);
  const colors = props.colors ?? resolvedTheme.colors;
  const svg = useMemo(
    () =>
      serializePieSvg(
        props,
        props.innerRadius ?? 0,
        width,
        resolvedTheme.backgroundColor,
        colors,
        resolvedTheme.legendLabelColor,
        resolvedTheme.legendLabelSize,
      ),
    [colors, props, resolvedTheme, width],
  );
  const containerRef = useChartExportViewRef(ref, svg);

  return (
    <View ref={containerRef} collapsable={false}>
      <PieChartBase {...props} />
    </View>
  );
}

function DonutChartInner<T extends Record<string, unknown>>(
  props: PieChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const inheritedTheme = useChartTheme();
  const resolvedTheme = resolveTheme(props.theme, inheritedTheme);
  const window = useWindowDimensions();
  const width = props.width ?? Math.min(window.width - 24, 480);
  const colors = props.colors ?? resolvedTheme.colors;
  const svg = useMemo(
    () =>
      serializePieSvg(
        props,
        props.innerRadius ?? 0.6,
        width,
        resolvedTheme.backgroundColor,
        colors,
        resolvedTheme.legendLabelColor,
        resolvedTheme.legendLabelSize,
      ),
    [colors, props, resolvedTheme, width],
  );
  const containerRef = useChartExportViewRef(ref, svg);

  return (
    <View ref={containerRef} collapsable={false}>
      <DonutChartBase {...props} innerRadius={props.innerRadius ?? 0.6} />
    </View>
  );
}

function RadarChartInner<T extends Record<string, unknown>>(
  props: RadarChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const inheritedTheme = useChartTheme();
  const resolvedTheme = resolveTheme(props.theme, inheritedTheme);
  const width = props.width ?? 360;
  const svg = useMemo(
    () =>
      serializeRadarSvg(
        props,
        width,
        resolvedTheme.backgroundColor,
        resolvedTheme.gridColor,
        resolvedTheme.legendLabelColor,
        resolvedTheme.legendLabelSize,
      ),
    [props, resolvedTheme, width],
  );
  const containerRef = useChartExportViewRef(ref, svg);

  return (
    <View ref={containerRef} collapsable={false}>
      <RadarChartBase {...props} />
    </View>
  );
}

export const PieChart = forwardRef(PieChartInner) as <
  T extends Record<string, unknown>,
>(
  props: PieChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;

export const DonutChart = forwardRef(DonutChartInner) as <
  T extends Record<string, unknown>,
>(
  props: PieChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;

export const RadarChart = forwardRef(RadarChartInner) as <
  T extends Record<string, unknown>,
>(
  props: RadarChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;
