import { Group } from "@shopify/react-native-skia";
import { Text, View } from "react-native";
import { Chart } from "../Chart";
import { useChartTheme } from "../hooks/use-chart-theme";
import { Legend } from "../overlays";
import { Arc, Line } from "../primitives";
import type { PieChartProps, RadarChartProps } from "../types";
import { buildAccessibilityLabel } from "../utils/accessibility";
import { RadialCanvas } from "./RadialCanvas";

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

export const PieChart = <T extends Record<string, unknown>>(
  props: PieChartProps<T>,
) => {
  const theme = useChartTheme();
  const width = props.width ?? 320;
  const values = props.data.map((datum) => Number(datum[props.valueKey]));
  const labels = props.data.map((datum) => String(datum[props.labelKey]));
  const slices = createSlices(values);
  const colors = props.colors ?? theme.colors;

  return (
    <Chart<T>
      accessibilityLabel={buildAccessibilityLabel(
        "Pie chart",
        props,
        (datum) => Number(datum[props.valueKey]),
        (datum) => String(datum[props.labelKey]),
      )}
      height={props.height}
      width={width}
      theme={props.theme}
      testID={props.testID}
    >
      <RadialCanvas width={width} height={props.height}>
        {({ x, y, radius }) => (
          <Group>
            {slices.map((slice, index) => (
              <Arc
                key={`slice-${labels[index]}`}
                cx={x}
                cy={y}
                outerRadius={radius}
                innerRadius={radius * (props.innerRadius ?? 0)}
                startAngle={slice.start}
                endAngle={slice.end}
                color={colors[index % colors.length]}
              />
            ))}
          </Group>
        )}
      </RadialCanvas>
      <Legend
        items={labels.map((label, index) => ({
          label,
          color: colors[index % colors.length],
        }))}
        config={props.legend}
      />
      {props.centerContent ? (
        <View
          style={{
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {props.centerContent}
        </View>
      ) : null}
    </Chart>
  );
};

export const DonutChart = PieChart;

export const RadarChart = <T extends Record<string, unknown>>(
  props: RadarChartProps<T>,
) => {
  const theme = useChartTheme();
  const width = props.width ?? 360;
  const count = props.axes.length;
  const radius = Math.min(width, props.height) / 2 - 30;

  return (
    <Chart<T>
      accessibilityLabel={
        props.accessibilityLabel ??
        `Radar chart with ${props.series.length} series.`
      }
      height={props.height}
      width={width}
      theme={props.theme}
      testID={props.testID}
    >
      <RadialCanvas width={width} height={props.height}>
        {({ x, y }) => (
          <Group>
            {props.axes.map((axis, index) => {
              const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
              const x2 = x + radius * Math.cos(angle);
              const y2 = y + radius * Math.sin(angle);
              return (
                <Line
                  key={axis}
                  points={[
                    { x, y, value: 0, label: axis, index, datum: axis },
                    { x: x2, y: y2, value: 1, label: axis, index, datum: axis },
                  ]}
                  color={theme.gridColor}
                  strokeWidth={1}
                />
              );
            })}
            {props.series.map((series) => {
              const points = props.data.map((datum, index) => {
                const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
                const value = Math.max(
                  0,
                  Math.min(1, Number(datum[series.key])),
                );
                return {
                  x: x + radius * value * Math.cos(angle),
                  y: y + radius * value * Math.sin(angle),
                  value,
                  label: props.axes[index] ?? String(index + 1),
                  index,
                  datum,
                };
              });
              return (
                <Line
                  key={series.label}
                  points={[...points, points[0]].filter(Boolean)}
                  color={series.color}
                  strokeWidth={2}
                />
              );
            })}
          </Group>
        )}
      </RadialCanvas>
      <Legend
        items={props.series.map((series) => ({
          label: series.label,
          color: series.color,
        }))}
        config={props.legend}
      />
    </Chart>
  );
};
