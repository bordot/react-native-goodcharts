import type { ForwardedRef, ReactElement } from "react";
import { forwardRef, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { createCartesianState } from "../core/data";
import { createBounds } from "../core/layout";
import {
  svgCartesianAxes,
  svgCircle,
  svgDocument,
  svgGrid,
  svgLegend,
  svgLineSegment,
  svgPath,
  svgRect,
  svgText,
} from "../core/svg";
import { resolveTheme } from "../core/theme";
import { useChartExportViewRef } from "../core/use-chart-export-view-ref";
import { useChartTheme } from "../hooks/use-chart-theme";
import type {
  CartesianChartProps,
  CartesianChartState,
  ChartBounds,
  ChartRef,
  ChartTheme,
  ExportOverlayConfig,
  LegendItem,
} from "../types";
import { buildAreaPath, buildLinePath } from "../utils/path-builder";
import {
  AreaChart as AreaChartBase,
  BarChart as BarChartBase,
  CandlestickChart as CandlestickChartBase,
  ComboChart as ComboChartBase,
  HorizontalBarChart as HorizontalBarChartBase,
  LineChart as LineChartBase,
  ScatterChart as ScatterChartBase,
  StackedBarChart as StackedBarChartBase,
} from "./charts";

interface CandlestickChartProps<T extends Record<string, unknown>>
  extends Omit<CartesianChartProps<T>, "yKey" | "yKeys"> {
  openKey: keyof T & string;
  highKey: keyof T & string;
  lowKey: keyof T & string;
  closeKey: keyof T & string;
}

const defaultColors = (
  theme: ChartTheme,
  props: CartesianChartProps<Record<string, unknown>>,
) => [
  props.color ?? theme.colors[0],
  ...(props.colors ?? theme.colors).slice(1),
];

const getCartesianLegendItems = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  theme: ChartTheme,
): LegendItem[] => {
  const keys = props.yKeys ?? (props.yKey ? [props.yKey] : []);

  return keys.map((key, index) => ({
    key,
    label: key,
    color:
      props.colors?.[index] ??
      props.color ??
      theme.colors[index % theme.colors.length],
  }));
};

const wrapSvg = (
  bounds: ChartBounds,
  theme: ChartTheme,
  content: string,
): string =>
  svgDocument({
    width: bounds.width,
    height: bounds.height,
    backgroundColor: theme.backgroundColor,
    content,
  });

const serializeCartesianChrome = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  theme: ChartTheme,
  legendItems: LegendItem[],
  legendConfig?: CartesianChartProps<T>["legend"],
) =>
  [
    svgCartesianAxes({
      bounds: state.bounds,
      xTicks: state.xTicks,
      yTicks: state.yTicks,
      labelColor: theme.axisLabelColor,
      labelSize: theme.axisLabelSize,
    }),
    svgLegend({
      items: legendItems,
      config: legendConfig,
      theme,
      x: Math.max(12, state.bounds.width - 184),
      y: 8,
    }),
  ].join("");

const serializeLineChartMarks = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  theme: ChartTheme,
) =>
  [
    svgGrid({
      bounds: state.bounds,
      xTicks: state.xTicks,
      yTicks: state.yTicks,
      color: theme.gridColor,
      strokeWidth: theme.gridStrokeWidth,
    }),
    ...state.series.map((series) =>
      svgPath({
        d: buildLinePath(series.points),
        stroke: series.color,
        strokeWidth: 3,
      }),
    ),
  ].join("");

const serializeAreaChartMarks = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  theme: ChartTheme,
) => {
  const baseline = state.bounds.padding.top + state.bounds.innerHeight;

  return [
    svgGrid({
      bounds: state.bounds,
      xTicks: state.xTicks,
      yTicks: state.yTicks,
      color: theme.gridColor,
      strokeWidth: theme.gridStrokeWidth,
    }),
    ...state.series.flatMap((series) => [
      svgPath({
        d: buildAreaPath(series.points, baseline),
        fill: series.color,
        opacity: 0.18,
      }),
      svgPath({
        d: buildLinePath(series.points),
        stroke: series.color,
        strokeWidth: 3,
      }),
    ]),
  ].join("");
};

const serializeBarChartMarks = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  theme: ChartTheme,
) => {
  const clusterWidth =
    state.bounds.innerWidth / Math.max(1, state.labels.length);
  const barWidth = (clusterWidth * 0.68) / Math.max(1, state.series.length);
  const baseline = state.bounds.padding.top + state.bounds.innerHeight;

  return [
    svgGrid({
      bounds: state.bounds,
      xTicks: state.xTicks,
      yTicks: state.yTicks,
      color: theme.gridColor,
      strokeWidth: theme.gridStrokeWidth,
    }),
    ...state.series.flatMap((series, seriesIndex) =>
      series.points.map((point) =>
        svgRect({
          x: point.x - clusterWidth * 0.34 + seriesIndex * barWidth,
          y: Math.min(point.y, baseline),
          width: Math.max(0, barWidth - 4),
          height: Math.abs(baseline - point.y),
          fill: series.color,
        }),
      ),
    ),
  ].join("");
};

const serializeStackedBarChartMarks = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  theme: ChartTheme,
  props: CartesianChartProps<T>,
) => {
  const yKeys = props.yKeys ?? [];
  const clusterWidth =
    state.bounds.innerWidth / Math.max(1, state.labels.length);
  const baseline = state.bounds.padding.top + state.bounds.innerHeight;
  const totals = state.data.map((datum) =>
    yKeys.reduce((sum, key) => sum + Number(datum[key]), 0),
  );
  const maxTotal = Math.max(...totals, 1);

  return [
    svgGrid({
      bounds: state.bounds,
      xTicks: state.xTicks,
      yTicks: state.yTicks,
      color: theme.gridColor,
      strokeWidth: theme.gridStrokeWidth,
    }),
    ...state.data.flatMap((datum, index) => {
      let offset = 0;
      return yKeys.map((key, stackIndex) => {
        const value = Number(datum[key]);
        const height = (value / maxTotal) * state.bounds.innerHeight;
        offset += height;
        return svgRect({
          x: (state.series[0]?.points[index]?.x ?? 0) - clusterWidth * 0.3,
          y: baseline - offset,
          width: clusterWidth * 0.6,
          height,
          fill:
            props.colors?.[stackIndex] ??
            theme.colors[stackIndex % theme.colors.length],
        });
      });
    }),
  ].join("");
};

const serializeScatterChartMarks = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  theme: ChartTheme,
) =>
  [
    svgGrid({
      bounds: state.bounds,
      xTicks: state.xTicks,
      yTicks: state.yTicks,
      color: theme.gridColor,
      strokeWidth: theme.gridStrokeWidth,
    }),
    ...state.series.flatMap((series) =>
      series.points.map((point) =>
        svgCircle({
          cx: point.x,
          cy: point.y,
          r: 4,
          fill: series.color,
        }),
      ),
    ),
  ].join("");

const serializeComboChartMarks = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  theme: ChartTheme,
  props: CartesianChartProps<T>,
) => {
  const yKeys = props.yKeys ?? [];
  const barKey = yKeys[0];
  const lineKey = yKeys[1] ?? yKeys[0];
  const baseline = state.bounds.padding.top + state.bounds.innerHeight;
  const clusterWidth =
    state.bounds.innerWidth / Math.max(1, state.labels.length);
  const barSeries =
    state.series.find((series) => series.key === barKey) ?? state.series[0];
  const lineSeries =
    state.series.find((series) => series.key === lineKey) ??
    state.series[1] ??
    state.series[0];

  return [
    svgGrid({
      bounds: state.bounds,
      xTicks: state.xTicks,
      yTicks: state.yTicks,
      color: theme.gridColor,
      strokeWidth: theme.gridStrokeWidth,
    }),
    ...(barSeries?.points.map((point) =>
      svgRect({
        x: point.x - clusterWidth * 0.25,
        y: point.y,
        width: clusterWidth * 0.5,
        height: baseline - point.y,
        fill: barSeries.color,
      }),
    ) ?? []),
    ...(lineSeries
      ? [
          svgPath({
            d: buildLinePath(lineSeries.points),
            stroke: lineSeries.color,
            strokeWidth: 3,
          }),
          ...lineSeries.points.map((point) =>
            svgCircle({
              cx: point.x,
              cy: point.y,
              r: 3,
              fill: lineSeries.color,
            }),
          ),
        ]
      : []),
  ].join("");
};

const serializeCandlestickChartMarks = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  theme: ChartTheme,
  props: CandlestickChartProps<T>,
) => {
  const candleWidth =
    (state.bounds.innerWidth / Math.max(1, state.data.length)) * 0.55;
  const baseline = state.bounds.padding.top + state.bounds.innerHeight;

  return [
    svgGrid({
      bounds: state.bounds,
      xTicks: state.xTicks,
      yTicks: state.yTicks,
      color: theme.gridColor,
      strokeWidth: theme.gridStrokeWidth,
    }),
    ...state.data.flatMap((datum, index) => {
      const x = state.series[0]?.points[index]?.x ?? 0;
      const high = state.series[0]?.points[index]?.y ?? baseline;
      const low =
        baseline -
        (Number(datum[props.lowKey]) / Math.max(state.yMax, 1)) *
          state.bounds.innerHeight;
      const open =
        baseline -
        (Number(datum[props.openKey]) / Math.max(state.yMax, 1)) *
          state.bounds.innerHeight;
      const close =
        baseline -
        (Number(datum[props.closeKey]) / Math.max(state.yMax, 1)) *
          state.bounds.innerHeight;
      const color =
        Number(datum[props.closeKey]) >= Number(datum[props.openKey])
          ? theme.bullColor
          : theme.bearColor;

      return [
        svgLineSegment({
          x1: x,
          y1: high,
          x2: x,
          y2: low,
          stroke: color,
        }),
        svgRect({
          x: x - candleWidth / 2,
          y: Math.min(open, close),
          width: candleWidth,
          height: Math.max(2, Math.abs(close - open)),
          fill: color,
        }),
      ];
    }),
  ].join("");
};

const clampNumber = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const resolveCartesianExportPoint = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  overlay: {
    dataIndex: number;
    seriesKey?: string;
  },
) => {
  const series =
    (overlay.seriesKey
      ? state.series.find((entry) => entry.key === overlay.seriesKey)
      : undefined) ?? state.series[0];

  if (!series || series.points.length === 0) {
    return null;
  }

  return (
    series.points.find((point) => point.index === overlay.dataIndex) ??
    series.points.reduce((closest, point) => {
      return Math.abs(point.index - overlay.dataIndex) <
        Math.abs(closest.index - overlay.dataIndex)
        ? point
        : closest;
    }, series.points[0])
  );
};

const serializeCartesianOverlays = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  theme: ChartTheme,
  exportOverlay: ExportOverlayConfig | undefined,
) => {
  if (!exportOverlay) {
    return "";
  }

  const overlayParts: string[] = [];
  const firstSeries = state.series[0];

  if (exportOverlay.selection && firstSeries) {
    const startIndex = Math.min(
      exportOverlay.selection.startIndex,
      exportOverlay.selection.endIndex,
    );
    const endIndex = Math.max(
      exportOverlay.selection.startIndex,
      exportOverlay.selection.endIndex,
    );
    const selectedPoints = firstSeries.points.filter(
      (point) => point.index >= startIndex && point.index <= endIndex,
    );

    if (selectedPoints.length > 0) {
      const left = Math.min(...selectedPoints.map((point) => point.x));
      const right = Math.max(...selectedPoints.map((point) => point.x));
      overlayParts.push(
        svgRect({
          x: left,
          y: state.bounds.padding.top,
          width: Math.max(0, right - left),
          height: state.bounds.innerHeight,
          fill: exportOverlay.selection.color ?? theme.selectionColor,
          stroke:
            exportOverlay.selection.borderColor ?? theme.selectionBorderColor,
          strokeWidth: 1,
        }),
      );
    }
  }

  const crosshairTarget = exportOverlay.crosshair
    ? resolveCartesianExportPoint(state, exportOverlay.crosshair)
    : null;

  if (crosshairTarget) {
    const crosshairColor =
      exportOverlay.crosshair?.color ?? theme.crosshairColor;
    overlayParts.push(
      svgLineSegment({
        x1: crosshairTarget.x,
        y1: state.bounds.padding.top,
        x2: crosshairTarget.x,
        y2: state.bounds.padding.top + state.bounds.innerHeight,
        stroke: crosshairColor,
      }),
    );
    overlayParts.push(
      svgLineSegment({
        x1: state.bounds.padding.left,
        y1: crosshairTarget.y,
        x2: state.bounds.padding.left + state.bounds.innerWidth,
        y2: crosshairTarget.y,
        stroke: crosshairColor,
      }),
    );
  }

  const tooltipTarget = exportOverlay.tooltip
    ? resolveCartesianExportPoint(state, exportOverlay.tooltip)
    : crosshairTarget;

  if (tooltipTarget) {
    const title = exportOverlay.tooltip?.title ?? tooltipTarget.label;
    const value = String(tooltipTarget.value);
    const boxWidth = Math.max(96, title.length * 8 + 28, value.length * 8 + 28);
    const boxHeight = 52;
    const left = clampNumber(
      tooltipTarget.x - boxWidth / 2,
      8,
      state.bounds.width - boxWidth - 8,
    );
    const top = clampNumber(
      tooltipTarget.y - boxHeight - 12,
      8,
      state.bounds.height - boxHeight - 8,
    );

    overlayParts.push(
      svgRect({
        x: left,
        y: top,
        width: boxWidth,
        height: boxHeight,
        fill: theme.tooltipBackground,
        stroke: theme.tooltipBorder,
        strokeWidth: 1,
        rx: theme.tooltipBorderRadius,
      }),
    );
    overlayParts.push(
      svgText({
        x: left + 12,
        y: top + 18,
        text: title,
        fill: theme.tooltipText,
        fontSize: 12,
        fontWeight: 600,
      }),
    );
    overlayParts.push(
      svgText({
        x: left + 12,
        y: top + 36,
        text: value,
        fill: theme.tooltipText,
        fontSize: 12,
      }),
    );
  }

  return overlayParts.join("");
};

const serializeHorizontalBarChart = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  theme: ChartTheme,
  width: number,
): string => {
  const yKey = (props.yKey ?? props.yKeys?.[0]) as keyof T;
  const max = Math.max(1, ...props.data.map((datum) => Number(datum[yKey])));
  const rowHeight = (props.height - 40) / Math.max(1, props.data.length);

  return svgDocument({
    width,
    height: props.height,
    backgroundColor: theme.backgroundColor,
    content: props.data
      .flatMap((datum, index) => {
        const label = String(datum[props.xKey]);
        const value = Number(datum[yKey]);
        const barWidth = ((width - 132) * value) / max;
        const y = 20 + index * rowHeight;
        const centerY = y + Math.max(4, rowHeight - 8) / 2;
        return [
          svgText({
            x: 72,
            y: centerY,
            text: label,
            fill: theme.axisLabelColor,
            fontSize: theme.axisLabelSize,
            textAnchor: "end",
            dominantBaseline: "middle",
          }),
          svgRect({
            x: 92,
            y,
            width: barWidth,
            height: Math.max(4, rowHeight - 8),
            fill: props.color ?? theme.colors[0],
            rx: 999,
          }),
          svgText({
            x: width - 20,
            y: centerY,
            text: String(value),
            fill: theme.axisLabelColor,
            fontSize: theme.axisLabelSize,
            textAnchor: "end",
            dominantBaseline: "middle",
          }),
        ];
      })
      .join(""),
  });
};

const useCartesianSvg = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  ref: ForwardedRef<ChartRef>,
  legendItems: LegendItem[],
  createMarks: (state: CartesianChartState<T>, theme: ChartTheme) => string,
) => {
  const inheritedTheme = useChartTheme();
  const resolvedTheme = resolveTheme(props.theme, inheritedTheme);
  const window = useWindowDimensions();
  const width = props.width ?? Math.min(window.width - 24, 720);
  const bounds = useMemo(
    () => createBounds(width, props.height, props.padding),
    [width, props.height, props.padding],
  );
  const colors =
    props.colors ??
    defaultColors(
      resolvedTheme,
      props as CartesianChartProps<Record<string, unknown>>,
    );
  const state = useMemo(
    () => createCartesianState(props, bounds, colors),
    [props, bounds, colors],
  );
  const svg = useMemo(
    () =>
      wrapSvg(
        state.bounds,
        resolvedTheme,
        [
          createMarks(state, resolvedTheme),
          serializeCartesianChrome(
            state,
            resolvedTheme,
            legendItems,
            props.legend,
          ),
          serializeCartesianOverlays(state, resolvedTheme, props.exportOverlay),
        ].join(""),
      ),
    [
      createMarks,
      legendItems,
      props.exportOverlay,
      props.legend,
      resolvedTheme,
      state,
    ],
  );

  return useChartExportViewRef(ref, svg);
};

function LineChartInner<T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const theme = useChartTheme();
  const containerRef = useCartesianSvg(
    props,
    ref,
    getCartesianLegendItems(props, theme),
    serializeLineChartMarks,
  );
  return (
    <View ref={containerRef} collapsable={false}>
      <LineChartBase {...props} />
    </View>
  );
}

function AreaChartInner<T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const theme = useChartTheme();
  const containerRef = useCartesianSvg(
    props,
    ref,
    getCartesianLegendItems(props, theme),
    serializeAreaChartMarks,
  );
  return (
    <View ref={containerRef} collapsable={false}>
      <AreaChartBase {...props} />
    </View>
  );
}

function BarChartInner<T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const theme = useChartTheme();
  const containerRef = useCartesianSvg(
    props,
    ref,
    getCartesianLegendItems(props, theme),
    serializeBarChartMarks,
  );
  return (
    <View ref={containerRef} collapsable={false}>
      <BarChartBase {...props} />
    </View>
  );
}

function HorizontalBarChartInner<T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const inheritedTheme = useChartTheme();
  const resolvedTheme = resolveTheme(props.theme, inheritedTheme);
  const width = props.width ?? 360;
  const svg = useMemo(
    () => serializeHorizontalBarChart(props, resolvedTheme, width),
    [props, resolvedTheme, width],
  );
  const containerRef = useChartExportViewRef(ref, svg);

  return (
    <View ref={containerRef} collapsable={false}>
      <HorizontalBarChartBase {...props} />
    </View>
  );
}

function StackedBarChartInner<T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const theme = useChartTheme();
  const containerRef = useCartesianSvg(
    props,
    ref,
    getCartesianLegendItems(props, theme),
    (state, resolvedTheme) =>
      serializeStackedBarChartMarks(state, resolvedTheme, props),
  );
  return (
    <View ref={containerRef} collapsable={false}>
      <StackedBarChartBase {...props} />
    </View>
  );
}

function ScatterChartInner<T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const theme = useChartTheme();
  const containerRef = useCartesianSvg(
    props,
    ref,
    getCartesianLegendItems(props, theme),
    serializeScatterChartMarks,
  );
  return (
    <View ref={containerRef} collapsable={false}>
      <ScatterChartBase {...props} />
    </View>
  );
}

function ComboChartInner<T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const theme = useChartTheme();
  const containerRef = useCartesianSvg(
    props,
    ref,
    getCartesianLegendItems(props, theme),
    (state, resolvedTheme) =>
      serializeComboChartMarks(state, resolvedTheme, props),
  );
  return (
    <View ref={containerRef} collapsable={false}>
      <ComboChartBase {...props} />
    </View>
  );
}

function CandlestickChartInner<T extends Record<string, unknown>>(
  props: CandlestickChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const syntheticProps = useMemo(
    () =>
      ({
        ...props,
        yKeys: [props.highKey],
      }) as unknown as CartesianChartProps<T>,
    [props],
  );
  const theme = useChartTheme();
  const containerRef = useCartesianSvg(
    syntheticProps,
    ref,
    [{ label: "Price", color: theme.colors[0] }],
    (state, resolvedTheme) =>
      serializeCandlestickChartMarks(state, resolvedTheme, props),
  );
  return (
    <View ref={containerRef} collapsable={false}>
      <CandlestickChartBase {...props} />
    </View>
  );
}

export const LineChart = forwardRef(LineChartInner) as <
  T extends Record<string, unknown>,
>(
  props: CartesianChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;

export const AreaChart = forwardRef(AreaChartInner) as <
  T extends Record<string, unknown>,
>(
  props: CartesianChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;

export const BarChart = forwardRef(BarChartInner) as <
  T extends Record<string, unknown>,
>(
  props: CartesianChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;

export const HorizontalBarChart = forwardRef(HorizontalBarChartInner) as <
  T extends Record<string, unknown>,
>(
  props: CartesianChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;

export const StackedBarChart = forwardRef(StackedBarChartInner) as <
  T extends Record<string, unknown>,
>(
  props: CartesianChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;

export const ScatterChart = forwardRef(ScatterChartInner) as <
  T extends Record<string, unknown>,
>(
  props: CartesianChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;

export const ComboChart = forwardRef(ComboChartInner) as <
  T extends Record<string, unknown>,
>(
  props: CartesianChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;

export const CandlestickChart = forwardRef(CandlestickChartInner) as <
  T extends Record<string, unknown>,
>(
  props: CandlestickChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;
