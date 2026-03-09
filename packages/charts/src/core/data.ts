import { extent, ticks } from "d3-array";
import { scaleLinear, scalePoint, scaleTime } from "d3-scale";
import type {
  AxisTick,
  CartesianChartProps,
  CartesianChartState,
  CartesianInteractionPoint,
  ChartBounds,
  ChartPoint,
  DatumValue,
  KeyOf,
  SeriesPoints,
} from "../types";
import { formatLabelValue } from "../utils/format";
import { lttb } from "../utils/lttb";
import { clampWindowRange, createWindowRange, sliceWindow } from "./windowing";

const CARTESIAN_STATE_CACHE_LIMIT = 24;
let cartesianStateCache = new WeakMap<
  ReadonlyArray<unknown>,
  Map<string, CartesianChartState<Record<string, unknown>>>
>();

const numericValue = (value: DatumValue, fallback: number): number => {
  if (typeof value === "number") {
    return value;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  return fallback;
};

const serializeCacheValue = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value ?? "");
};

const categoricalLabels = <T extends Record<string, unknown>>(
  data: T[],
  key: KeyOf<T>,
): string[] => data.map((datum) => formatLabelValue(datum[key] as DatumValue));

const buildXTicks = (labels: string[], bounds: ChartBounds): AxisTick[] => {
  if (labels.length === 0) {
    return [];
  }

  const scale = scalePoint<string>()
    .domain(labels)
    .range([bounds.padding.left, bounds.padding.left + bounds.innerWidth]);

  return labels.map((label) => ({
    value: label,
    label,
    position: scale(label) ?? bounds.padding.left,
  }));
};

const buildYTicks = (
  min: number,
  max: number,
  bounds: ChartBounds,
): AxisTick[] => {
  const values = ticks(min, max, 5);
  const scale = scaleLinear()
    .domain([min, max])
    .range([bounds.padding.top + bounds.innerHeight, bounds.padding.top]);

  return values.map((value) => ({
    value,
    label: String(value),
    position: scale(value),
  }));
};

const resolveWindowRange = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
) => {
  const total = props.data.length;
  if (!props.viewport?.size || props.viewport.size >= total) {
    return clampWindowRange(total, 0, total);
  }

  const rawStart = props.viewport.followEnd
    ? Math.max(0, total - props.viewport.size)
    : Math.max(0, props.viewport.startIndex ?? 0);

  return createWindowRange(
    total,
    rawStart,
    props.viewport.size,
    props.viewport.overscan ?? 0,
  );
};

const resolveXPosition = <T extends Record<string, unknown>>(
  data: T[],
  xKey: KeyOf<T>,
  bounds: ChartBounds,
  rawX: DatumValue,
  label: string,
  index: number,
): number => {
  const first = data[0]?.[xKey];

  if (first instanceof Date) {
    const domain = extent(data, (datum, itemIndex) =>
      numericValue(datum[xKey] as DatumValue, itemIndex),
    );
    const scale = scaleTime()
      .domain([new Date(domain[0] ?? 0), new Date(domain[1] ?? 0)])
      .range([bounds.padding.left, bounds.padding.left + bounds.innerWidth]);
    return scale(rawX instanceof Date ? rawX : new Date(index));
  }

  if (typeof first === "number") {
    const domain = extent(data, (datum, itemIndex) =>
      numericValue(datum[xKey] as DatumValue, itemIndex),
    );
    const scale = scaleLinear()
      .domain([domain[0] ?? 0, domain[1] ?? data.length])
      .range([bounds.padding.left, bounds.padding.left + bounds.innerWidth]);
    return scale(typeof rawX === "number" ? rawX : index);
  }

  const labels = categoricalLabels(data, xKey);
  const scale = scalePoint<string>()
    .domain(labels)
    .range([bounds.padding.left, bounds.padding.left + bounds.innerWidth])
    .padding(0.5);
  return scale(label) ?? bounds.padding.left;
};

const downsamplePoints = <T>(
  points: ChartPoint<T>[],
  threshold?: number,
): ChartPoint<T>[] => {
  if (!threshold || threshold < 2 || points.length <= threshold) {
    return points;
  }

  return lttb(points, threshold);
};

const buildCacheKey = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  bounds: ChartBounds,
  colors: string[],
  windowRange: { startIndex: number; endIndex: number },
  yKeys: Array<KeyOf<T>>,
): string => {
  const firstDatum = props.data[0];
  const lastDatum = props.data[props.data.length - 1];
  const yKeyFingerprint = yKeys
    .map(
      (key) =>
        `${key}:${serializeCacheValue(firstDatum?.[key])}:${serializeCacheValue(lastDatum?.[key])}`,
    )
    .join("|");

  return [
    `w:${bounds.width}`,
    `h:${bounds.height}`,
    `iw:${bounds.innerWidth}`,
    `ih:${bounds.innerHeight}`,
    `p:${bounds.padding.left},${bounds.padding.top},${bounds.padding.right},${bounds.padding.bottom}`,
    `x:${props.xKey}`,
    `y:${yKeys.join(",")}`,
    `c:${colors.join(",")}`,
    `l:${props.data.length}`,
    `d:${props.downsampleThreshold ?? 0}`,
    `fx:${serializeCacheValue(firstDatum?.[props.xKey])}`,
    `lx:${serializeCacheValue(lastDatum?.[props.xKey])}`,
    `fy:${yKeyFingerprint}`,
    `s:${windowRange.startIndex}`,
    `e:${windowRange.endIndex}`,
  ].join(";");
};

const getCachedCartesianState = <T extends Record<string, unknown>>(
  data: T[],
  key: string,
): CartesianChartState<T> | null => {
  const bucket = cartesianStateCache.get(data);
  if (!bucket) {
    return null;
  }

  const cached = bucket.get(key) as CartesianChartState<T> | undefined;
  if (!cached) {
    return null;
  }

  bucket.delete(key);
  bucket.set(key, cached as CartesianChartState<Record<string, unknown>>);
  return cached;
};

const setCachedCartesianState = <T extends Record<string, unknown>>(
  data: T[],
  key: string,
  state: CartesianChartState<T>,
) => {
  const bucket =
    cartesianStateCache.get(data) ??
    new Map<string, CartesianChartState<Record<string, unknown>>>();

  if (bucket.has(key)) {
    bucket.delete(key);
  }

  bucket.set(key, state as CartesianChartState<Record<string, unknown>>);

  while (bucket.size > CARTESIAN_STATE_CACHE_LIMIT) {
    const oldestKey = bucket.keys().next().value;
    if (!oldestKey) {
      break;
    }
    bucket.delete(oldestKey);
  }

  cartesianStateCache.set(data, bucket);
};

export const clearCartesianStateCache = () => {
  cartesianStateCache = new WeakMap();
};

export const createCartesianState = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
  bounds: ChartBounds,
  colors: string[],
): CartesianChartState<T> => {
  const windowRange = resolveWindowRange(props);
  const yKeys = (props.yKeys ?? (props.yKey ? [props.yKey] : [])) as Array<
    KeyOf<T>
  >;
  const cacheKey = buildCacheKey(props, bounds, colors, windowRange, yKeys);
  const cachedState = getCachedCartesianState(props.data, cacheKey);

  if (cachedState) {
    return cachedState;
  }

  const visibleData = sliceWindow(props.data, windowRange);
  const labels = categoricalLabels(visibleData, props.xKey);
  const flatValues = yKeys.flatMap((key) =>
    visibleData
      .map((datum) => Number(datum[key]))
      .filter((value) => Number.isFinite(value)),
  );

  const yMin = Math.min(0, ...(flatValues.length ? flatValues : [0]));
  const yMax = Math.max(1, ...(flatValues.length ? flatValues : [1]));
  const yScale = scaleLinear()
    .domain([yMin, yMax])
    .range([bounds.padding.top + bounds.innerHeight, bounds.padding.top])
    .nice();

  const series: SeriesPoints<T>[] = yKeys.map((key, seriesIndex) => {
    const points: ChartPoint<T>[] = visibleData.map((datum, index) => {
      const rawX = datum[props.xKey] as DatumValue;
      const label = labels[index] ?? String(index + 1);
      const x = resolveXPosition(
        visibleData,
        props.xKey,
        bounds,
        rawX,
        label,
        index,
      );
      const value = Number(datum[key]);
      return {
        x,
        y: yScale(value),
        value,
        label,
        index: windowRange.startIndex + index,
        datum,
      };
    });

    return {
      key,
      color: colors[seriesIndex % colors.length],
      points: downsamplePoints(points, props.downsampleThreshold),
    };
  });

  const interactionPoints: CartesianInteractionPoint[] = series.flatMap(
    (seriesEntry, seriesIndex) =>
      seriesEntry.points.map((point, pointIndex) => ({
        x: point.x,
        y: point.y,
        seriesIndex,
        pointIndex,
        dataIndex: point.index,
      })),
  );
  const renderedPoints = series.reduce(
    (sum, seriesEntry) => sum + seriesEntry.points.length,
    0,
  );
  const rawPointCount = visibleData.length * Math.max(1, yKeys.length);

  const state: CartesianChartState<T> = {
    bounds,
    data: visibleData,
    allData: props.data,
    xTicks: buildXTicks(labels, bounds),
    yTicks: buildYTicks(yMin, yMax, bounds),
    series,
    interactionPoints,
    labels,
    xMin: bounds.padding.left,
    xMax: bounds.padding.left + bounds.innerWidth,
    yMin,
    yMax,
    totalPoints: props.data.length,
    renderedPoints,
    isWindowed:
      windowRange.startIndex !== 0 ||
      windowRange.endIndex !== props.data.length,
    isDownsampled: renderedPoints < rawPointCount,
    windowRange,
  };

  setCachedCartesianState(props.data, cacheKey, state);
  return state;
};
