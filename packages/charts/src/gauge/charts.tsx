import { Text, View } from "react-native";
import { Chart } from "../Chart";
import { Arc } from "../primitives";
import { RadialCanvas } from "../radial/RadialCanvas";
import type { ProgressBarChartProps, ProgressRingChartProps } from "../types";

const resolveProgress = (value: number, min: number, max: number) => {
  if (max <= min) {
    return 0;
  }
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

export const ProgressRingChart = ({
  value,
  min = 0,
  max = 100,
  height,
  width = 240,
  thickness = 18,
  color = "#2563EB",
  backgroundColor = "#E5E7EB",
  accessibilityLabel,
}: ProgressRingChartProps) => {
  const progress = resolveProgress(value, min, max);

  return (
    <Chart<never>
      accessibilityLabel={
        accessibilityLabel ??
        `Progress ring at ${Math.round(progress * 100)} percent.`
      }
      height={height}
      width={width}
    >
      <RadialCanvas width={width} height={height}>
        {({ x, y, radius }) => (
          <>
            <Arc
              cx={x}
              cy={y}
              outerRadius={radius}
              innerRadius={radius - thickness}
              startAngle={-Math.PI / 2}
              endAngle={Math.PI * 1.5}
              color={backgroundColor}
            />
            <Arc
              cx={x}
              cy={y}
              outerRadius={radius}
              innerRadius={radius - thickness}
              startAngle={-Math.PI / 2}
              endAngle={-Math.PI / 2 + Math.PI * 2 * progress}
              color={color}
            />
          </>
        )}
      </RadialCanvas>
      <View
        style={{
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text selectable style={{ fontSize: 24, fontWeight: "700" }}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </Chart>
  );
};

export const ProgressBarChart = ({
  value,
  min = 0,
  max = 100,
  height,
  width = 320,
  color = "#2563EB",
  backgroundColor = "#E5E7EB",
  borderRadius = 999,
  accessibilityLabel,
}: ProgressBarChartProps) => {
  const progress = resolveProgress(value, min, max);

  return (
    <Chart<never>
      accessibilityLabel={
        accessibilityLabel ??
        `Progress bar at ${Math.round(progress * 100)} percent.`
      }
      height={height}
      width={width}
    >
      <View style={{ padding: 20, justifyContent: "center", flex: 1, gap: 8 }}>
        <View style={{ height: 16, backgroundColor, borderRadius }}>
          <View
            style={{
              width: `${progress * 100}%`,
              height: 16,
              backgroundColor: color,
              borderRadius,
            }}
          />
        </View>
        <Text selectable style={{ textAlign: "right", fontWeight: "700" }}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </Chart>
  );
};
