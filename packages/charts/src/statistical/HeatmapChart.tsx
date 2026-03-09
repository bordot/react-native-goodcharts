import { Group } from "@shopify/react-native-skia";
import { Chart } from "../Chart";
import { useChartTheme } from "../hooks/use-chart-theme";
import { Legend } from "../overlays";
import { Bar } from "../primitives";
import type { HeatmapChartProps } from "../types";

export const HeatmapChart = <T extends Record<string, unknown>>(
  props: HeatmapChartProps<T>,
) => {
  const theme = useChartTheme();
  const width = props.width ?? 360;
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

  return (
    <Chart<T>
      accessibilityLabel={
        props.accessibilityLabel ??
        `Heatmap chart with ${props.data.length} cells.`
      }
      height={props.height}
      width={width}
      theme={props.theme}
      testID={props.testID}
    >
      <ViewCanvas width={width} height={props.height}>
        <Group>
          {props.data.map((datum) => {
            const x = Number(datum[props.xKey]) * (cellSize + gap) + 24;
            const y = Number(datum[props.yKey]) * (cellSize + gap) + 24;
            const value = Number(datum[props.valueKey]);
            const bucket = Math.min(
              colors.length - 1,
              Math.floor((value / max) * (colors.length - 1)),
            );
            return (
              <Bar
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                color={colors[bucket]}
              />
            );
          })}
        </Group>
      </ViewCanvas>
      <Legend
        items={colors.map((color, index) => ({
          label: `Level ${index + 1}`,
          color,
        }))}
        config={props.legend}
      />
    </Chart>
  );
};

import { Canvas } from "@shopify/react-native-skia";
import type { PropsWithChildren } from "react";
const ViewCanvas = ({
  width,
  height,
  children,
}: PropsWithChildren<{ width: number; height: number }>) => (
  <Canvas style={{ width, height }}>{children}</Canvas>
);
