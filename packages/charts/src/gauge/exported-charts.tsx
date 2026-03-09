import type { ForwardedRef } from "react";
import { forwardRef, useMemo } from "react";
import { View } from "react-native";
import { svgDocument, svgPath, svgRect, svgText } from "../core/svg";
import { useChartExportViewRef } from "../core/use-chart-export-view-ref";
import type {
  ChartRef,
  ProgressBarChartProps,
  ProgressRingChartProps,
} from "../types";
import { buildArcPath } from "../utils/path-builder";
import {
  ProgressBarChart as ProgressBarChartBase,
  ProgressRingChart as ProgressRingChartBase,
} from "./charts";

const resolveProgress = (value: number, min: number, max: number) => {
  if (max <= min) {
    return 0;
  }

  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

function ProgressRingChartInner(
  props: ProgressRingChartProps,
  ref: ForwardedRef<ChartRef>,
) {
  const {
    value,
    min = 0,
    max = 100,
    height,
    width = 240,
    thickness = 18,
    color = "#2563EB",
    backgroundColor = "#E5E7EB",
  } = props;
  const progress = resolveProgress(value, min, max);
  const radius = Math.max(0, Math.min(width, height) / 2 - 18);
  const cx = width / 2;
  const cy = height / 2;
  const svg = useMemo(
    () =>
      svgDocument({
        width,
        height,
        backgroundColor: "#FFFFFF",
        content: [
          svgPath({
            d: buildArcPath(
              cx,
              cy,
              radius,
              -Math.PI / 2,
              Math.PI * 1.5,
              radius - thickness,
            ),
            fill: backgroundColor,
          }),
          svgPath({
            d: buildArcPath(
              cx,
              cy,
              radius,
              -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * progress,
              radius - thickness,
            ),
            fill: color,
          }),
          svgText({
            x: cx,
            y: cy,
            text: `${Math.round(progress * 100)}%`,
            fill: "#111827",
            fontSize: 24,
            fontWeight: 700,
            textAnchor: "middle",
            dominantBaseline: "middle",
          }),
        ].join(""),
      }),
    [
      backgroundColor,
      color,
      cx,
      cy,
      height,
      progress,
      radius,
      thickness,
      width,
    ],
  );
  const containerRef = useChartExportViewRef(ref, svg);

  return (
    <View ref={containerRef} collapsable={false}>
      <ProgressRingChartBase {...props} />
    </View>
  );
}

function ProgressBarChartInner(
  props: ProgressBarChartProps,
  ref: ForwardedRef<ChartRef>,
) {
  const {
    value,
    min = 0,
    max = 100,
    height,
    width = 320,
    color = "#2563EB",
    backgroundColor = "#E5E7EB",
    borderRadius = 999,
  } = props;
  const progress = resolveProgress(value, min, max);
  const barY = Math.max(20, height / 2 - 8);
  const svg = useMemo(
    () =>
      svgDocument({
        width,
        height,
        backgroundColor: "#FFFFFF",
        content: [
          svgRect({
            x: 20,
            y: barY,
            width: width - 40,
            height: 16,
            fill: backgroundColor,
            rx: borderRadius,
          }),
          svgRect({
            x: 20,
            y: barY,
            width: (width - 40) * progress,
            height: 16,
            fill: color,
            rx: borderRadius,
          }),
          svgText({
            x: width - 20,
            y: barY + 34,
            text: `${Math.round(progress * 100)}%`,
            fill: "#111827",
            fontSize: 16,
            fontWeight: 700,
            textAnchor: "end",
            dominantBaseline: "middle",
          }),
        ].join(""),
      }),
    [backgroundColor, barY, borderRadius, color, height, progress, width],
  );
  const containerRef = useChartExportViewRef(ref, svg);

  return (
    <View ref={containerRef} collapsable={false}>
      <ProgressBarChartBase {...props} />
    </View>
  );
}

export const ProgressRingChart = forwardRef(ProgressRingChartInner);
export const ProgressBarChart = forwardRef(ProgressBarChartInner);
