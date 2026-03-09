import { Canvas } from "@shopify/react-native-skia";
import { Chart } from "../Chart";
import { Line } from "../primitives";
import { formatNumber } from "../utils/format";

interface SparklineChartProps {
  data: number[];
  height: number;
  width?: number;
  color?: string;
  accessibilityLabel?: string;
}

export const SparklineChart = ({
  data,
  height,
  width = 140,
  color = "#10B981",
  accessibilityLabel,
}: SparklineChartProps) => {
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 1);
  const span = max - min || 1;
  const points = data.map((value, index) => ({
    x: 8 + (index / Math.max(1, data.length - 1)) * (width - 16),
    y: height - 8 - ((value - min) / span) * (height - 16),
    value,
    label: String(index),
    index,
    datum: value,
  }));

  return (
    <Chart<number>
      accessibilityLabel={
        accessibilityLabel ??
        `Sparkline from ${formatNumber(min)} to ${formatNumber(max)}.`
      }
      height={height}
      width={width}
    >
      <Canvas style={{ width, height }}>
        <Line points={points} color={color} strokeWidth={2.5} />
      </Canvas>
    </Chart>
  );
};
