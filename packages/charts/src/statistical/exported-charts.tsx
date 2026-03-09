import type { ForwardedRef, ReactElement } from "react";
import { forwardRef, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { svgDocument, svgLegend, svgRect } from "../core/svg";
import { resolveTheme } from "../core/theme";
import { useChartExportViewRef } from "../core/use-chart-export-view-ref";
import { useChartTheme } from "../hooks/use-chart-theme";
import type { ChartRef, HeatmapChartProps } from "../types";
import { HeatmapChart as HeatmapChartBase } from "./HeatmapChart";

function HeatmapChartInner<T extends Record<string, unknown>>(
  props: HeatmapChartProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const inheritedTheme = useChartTheme();
  const resolvedTheme = resolveTheme(props.theme, inheritedTheme);
  const window = useWindowDimensions();
  const width = props.width ?? Math.min(window.width - 24, 720);
  const cellSize = props.cellSize ?? 18;
  const gap = props.cellGap ?? 4;
  const colors = props.colors ?? [
    "#F3F4F6",
    "#BFDBFE",
    "#60A5FA",
    "#2563EB",
    "#1E3A8A",
  ];
  const max = Math.max(
    1,
    ...props.data.map((datum) => Number(datum[props.valueKey])),
  );
  const svg = useMemo(
    () =>
      svgDocument({
        width,
        height: props.height,
        backgroundColor: resolvedTheme.backgroundColor,
        content: [
          props.data
            .map((datum) => {
              const x = Number(datum[props.xKey]) * (cellSize + gap) + 24;
              const y = Number(datum[props.yKey]) * (cellSize + gap) + 24;
              const value = Number(datum[props.valueKey]);
              const bucket = Math.min(
                colors.length - 1,
                Math.floor((value / max) * (colors.length - 1)),
              );
              return svgRect({
                x,
                y,
                width: cellSize,
                height: cellSize,
                fill: colors[bucket],
                rx: props.cellRadius,
              });
            })
            .join(""),
          svgLegend({
            items: colors.map((color, index) => ({
              label: `Level ${index + 1}`,
              color,
            })),
            config: props.legend,
            theme: resolvedTheme,
            x: Math.max(12, width - 184),
            y: 8,
          }),
        ].join(""),
      }),
    [cellSize, colors, gap, max, props, resolvedTheme, width],
  );
  const containerRef = useChartExportViewRef(ref, svg);

  return (
    <View ref={containerRef} collapsable={false}>
      <HeatmapChartBase {...props} />
    </View>
  );
}

export const HeatmapChart = forwardRef(HeatmapChartInner) as <
  T extends Record<string, unknown>,
>(
  props: HeatmapChartProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;
