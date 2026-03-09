import type { BaseChartProps } from "../types";
import { formatLabelValue, formatNumber } from "./format";

export const buildAccessibilityLabel = <T extends Record<string, unknown>>(
  chartName: string,
  props: BaseChartProps<T>,
  getValue: (datum: T) => number | null,
  getLabel: (datum: T, index: number) => string,
): string => {
  if (props.accessibilityLabel) {
    return props.accessibilityLabel;
  }

  if (props.data.length === 0) {
    return `${chartName} with no data.`;
  }

  const values = props.data
    .map(getValue)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    );

  if (values.length === 0) {
    return `${chartName} with ${props.data.length} data points.`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const start = getLabel(props.data[0], 0);
  const end = getLabel(
    props.data[props.data.length - 1],
    props.data.length - 1,
  );

  return `${chartName} from ${formatLabelValue(start)} to ${formatLabelValue(end)}. Minimum ${formatNumber(min)}. Maximum ${formatNumber(max)}.`;
};

export const buildDataTableRows = <T extends Record<string, unknown>>(
  data: T[],
  columns: string[],
): string[][] => {
  return data.map((datum) =>
    columns.map((column) => String(datum[column] ?? "")),
  );
};
