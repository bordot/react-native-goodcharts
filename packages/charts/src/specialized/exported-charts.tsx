import type { ForwardedRef } from "react";
import { forwardRef, useMemo } from "react";
import { View } from "react-native";
import { svgDocument, svgPath } from "../core/svg";
import { useChartExportViewRef } from "../core/use-chart-export-view-ref";
import type { ChartRef } from "../types";
import { buildLinePath } from "../utils/path-builder";
import { SparklineChart as SparklineChartBase } from "./SparklineChart";

interface SparklineChartProps {
  data: number[];
  height: number;
  width?: number;
  color?: string;
  accessibilityLabel?: string;
}

function SparklineChartInner(
  props: SparklineChartProps,
  ref: ForwardedRef<ChartRef>,
) {
  const { data, height, width = 140, color = "#10B981" } = props;
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
  const svg = useMemo(
    () =>
      svgDocument({
        width,
        height,
        backgroundColor: "#FFFFFF",
        content: svgPath({
          d: buildLinePath(points),
          stroke: color,
          strokeWidth: 2.5,
        }),
      }),
    [color, height, points, width],
  );
  const containerRef = useChartExportViewRef(ref, svg);

  return (
    <View ref={containerRef} collapsable={false}>
      <SparklineChartBase {...props} />
    </View>
  );
}

export const SparklineChart = forwardRef(SparklineChartInner);
