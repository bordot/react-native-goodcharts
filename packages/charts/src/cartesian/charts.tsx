import { Canvas, Group } from "@shopify/react-native-skia";
import type { ReactNode } from "react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { Chart } from "../Chart";
import { XAxis } from "../axes/XAxis";
import { YAxis } from "../axes/YAxis";
import { CartesianContext } from "../core/chart-context";
import { createCartesianState } from "../core/data";
import {
  type ActiveCartesianGestureMode,
  resolveCartesianGestureMode,
} from "../core/gesture-mode";
import { createBounds } from "../core/layout";
import { resolveTheme } from "../core/theme";
import {
  createPannedViewport,
  createPinchedViewport,
} from "../core/viewport-gesture";
import { useChartPan } from "../hooks/use-chart-pan";
import { useChartPress } from "../hooks/use-chart-press";
import { useChartTheme } from "../hooks/use-chart-theme";
import { useChartZoom } from "../hooks/use-chart-zoom";
import { Crosshair, Legend, SelectionBrush, Tooltip } from "../overlays";
import {
  Area,
  Bar,
  GridLines,
  Line,
  ReferenceLine,
  Scatter,
} from "../primitives";
import type {
  CartesianChartProps,
  CartesianChartState,
  ChartPoint,
  LegendItem,
  TooltipRenderArgs,
} from "../types";
import {
  buildAccessibilityLabel,
  buildDataTableRows,
} from "../utils/accessibility";
import {
  findInteractionRangeDataIndices,
  findNearestInteractionPointIndex,
} from "../utils/bisect";

interface Selection<T> {
  point: ChartPoint<T>;
  seriesKey: string;
}

interface CandlestickChartProps<T extends Record<string, unknown>>
  extends Omit<CartesianChartProps<T>, "yKey" | "yKeys"> {
  openKey: keyof T & string;
  highKey: keyof T & string;
  lowKey: keyof T & string;
  closeKey: keyof T & string;
}

const MODE_NONE = 0;
const MODE_INSPECT = 1;
const MODE_SELECT = 2;
const MODE_NAVIGATE = 3;

const requestFrame = (callback: () => void): number => {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame(callback);
  }

  return setTimeout(callback, 16) as unknown as number;
};

const cancelFrame = (frame: number) => {
  if (typeof globalThis.cancelAnimationFrame === "function") {
    globalThis.cancelAnimationFrame(frame);
    return;
  }

  clearTimeout(frame);
};

const nearestPoint = <T,>(
  series: Array<{ key: string; points: ChartPoint<T>[] }>,
  x: number,
  y: number,
): Selection<T> | null => {
  let best: Selection<T> | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const seriesEntry of series) {
    for (const point of seriesEntry.points) {
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { point, seriesKey: seriesEntry.key };
      }
    }
  }

  return best;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max));

const modeCodeToName = (mode: number): ActiveCartesianGestureMode => {
  switch (mode) {
    case MODE_INSPECT:
      return "inspect";
    case MODE_SELECT:
      return "select";
    case MODE_NAVIGATE:
      return "navigate";
    default:
      return "none";
  }
};

const modeNameToCode = (mode: ActiveCartesianGestureMode): number => {
  switch (mode) {
    case "inspect":
      return MODE_INSPECT;
    case "select":
      return MODE_SELECT;
    case "navigate":
      return MODE_NAVIGATE;
    default:
      return MODE_NONE;
  }
};

const HiddenDataTable = <T extends Record<string, unknown>>({
  enabled,
  data,
  columns,
}: {
  enabled?: boolean;
  data: T[];
  columns: string[];
}) => {
  if (!enabled) {
    return null;
  }

  return (
    <View
      accessible
      style={{ position: "absolute", left: 0, top: 0, opacity: 0.01 }}
    >
      {buildDataTableRows(data, columns).map((row) => (
        <Text key={row.join("|")} selectable>
          {row.join(", ")}
        </Text>
      ))}
    </View>
  );
};

const CartesianSurface = <T extends Record<string, unknown>>({
  props,
  legendItems,
  renderSeries,
}: {
  props: CartesianChartProps<T>;
  legendItems: LegendItem[];
  renderSeries: (state: CartesianChartState<T>) => ReactNode;
}) => {
  const inheritedTheme = useChartTheme();
  const resolvedTheme = resolveTheme(props.theme, inheritedTheme);
  const window = useWindowDimensions();
  const width = props.width ?? Math.min(window.width - 24, 720);
  const bounds = useMemo(
    () => createBounds(width, props.height, props.padding),
    [width, props.height, props.padding],
  );
  const colors = props.colors ?? [
    props.color ?? resolvedTheme.colors[0],
    ...resolvedTheme.colors.slice(1),
  ];
  const pressState = useChartPress();
  const panState = useChartPan();
  const zoomState = useChartZoom();
  const hoverInteractionIndex = useSharedValue(-1);
  const selectionActive = useSharedValue(0);
  const selectionLeft = useSharedValue(0);
  const selectionRight = useSharedValue(0);
  const gestureMode = useSharedValue(modeNameToCode("none"));
  const viewportStart = useSharedValue(props.viewport?.startIndex ?? 0);
  const viewportSize = useSharedValue(
    props.viewport?.size ?? Math.max(1, props.data.length),
  );
  const viewportOverscan = useSharedValue(props.viewport?.overscan ?? 0);
  const panLastX = useSharedValue(0);
  const pinchLastScale = useSharedValue(1);
  const [interactiveViewport, setInteractiveViewport] = useState(
    props.viewport,
  );
  const [selected, setSelected] = useState<Selection<T> | null>(null);
  const [activeGestureMode, setActiveGestureMode] =
    useState<ActiveCartesianGestureMode>("none");
  const propsRef = useRef(props);
  const stateRef = useRef<CartesianChartState<T> | null>(null);
  const selectedRef = useRef<Selection<T> | null>(null);
  const activeGestureModeRef = useRef<ActiveCartesianGestureMode>("none");
  const gestureActivityRef = useRef({ pan: false, pinch: false });
  const viewportMirrorRef = useRef({
    startIndex: props.viewport?.startIndex ?? 0,
    size: props.viewport?.size ?? Math.max(1, props.data.length),
    overscan: props.viewport?.overscan ?? 0,
  });
  const pendingViewportRef = useRef<{
    startIndex: number;
    size: number;
    overscan: number;
  } | null>(null);
  const viewportCommitFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setInteractiveViewport(props.viewport);
  }, [props.viewport]);

  useEffect(
    () => () => {
      if (viewportCommitFrameRef.current !== null) {
        cancelFrame(viewportCommitFrameRef.current);
      }
    },
    [],
  );

  const effectiveViewport = interactiveViewport ?? props.viewport;
  const state = useMemo(
    () =>
      createCartesianState(
        { ...props, viewport: effectiveViewport },
        bounds,
        colors,
      ),
    [props, effectiveViewport, bounds, colors],
  );

  const interactionPoints = useSharedValue(state.interactionPoints);

  const selectionMode = props.selection?.mode ?? "range";
  const canNavigate = Boolean(props.pannable || props.zoomable);
  const canSelect = Boolean(props.selection?.enabled);
  const canInspect = props.crosshair !== false || Boolean(props.tooltip);

  propsRef.current = props;
  stateRef.current = state;
  selectedRef.current = selected;
  activeGestureModeRef.current = activeGestureMode;

  useEffect(() => {
    const nextWindowSize = Math.max(
      1,
      state.windowRange.endIndex - state.windowRange.startIndex,
    );
    viewportStart.value =
      effectiveViewport?.startIndex ?? state.windowRange.startIndex;
    viewportSize.value = effectiveViewport?.size ?? nextWindowSize;
    viewportOverscan.value =
      effectiveViewport?.overscan ?? props.viewport?.overscan ?? 0;
    viewportMirrorRef.current = {
      startIndex: effectiveViewport?.startIndex ?? state.windowRange.startIndex,
      size: effectiveViewport?.size ?? nextWindowSize,
      overscan: effectiveViewport?.overscan ?? props.viewport?.overscan ?? 0,
    };
    interactionPoints.value = state.interactionPoints;
    hoverInteractionIndex.value = -1;
  }, [
    effectiveViewport?.overscan,
    effectiveViewport?.size,
    effectiveViewport?.startIndex,
    hoverInteractionIndex,
    interactionPoints,
    props.viewport?.overscan,
    state.interactionPoints,
    state.windowRange.endIndex,
    state.windowRange.startIndex,
    viewportOverscan,
    viewportSize,
    viewportStart,
  ]);

  const flushViewportCommit = () => {
    const nextViewport = pendingViewportRef.current;
    pendingViewportRef.current = null;
    viewportCommitFrameRef.current = null;

    if (!nextViewport) {
      return;
    }

    const current = viewportMirrorRef.current;
    if (
      current.startIndex === nextViewport.startIndex &&
      current.size === nextViewport.size &&
      current.overscan === nextViewport.overscan
    ) {
      return;
    }

    viewportMirrorRef.current = nextViewport;
    startTransition(() => {
      setInteractiveViewport(nextViewport);
    });
    propsRef.current.onViewportChange?.(nextViewport);
  };

  const scheduleViewportCommit = (
    startIndex: number,
    size: number,
    overscan: number,
  ) => {
    pendingViewportRef.current = { startIndex, size, overscan };

    if (viewportCommitFrameRef.current !== null) {
      return;
    }

    viewportCommitFrameRef.current = requestFrame(() => {
      flushViewportCommit();
    });
  };

  useAnimatedReaction(
    () => ({
      startIndex: Math.round(viewportStart.value),
      size: Math.round(viewportSize.value),
      overscan: Math.round(viewportOverscan.value),
    }),
    (next, previous) => {
      if (
        previous &&
        previous.startIndex === next.startIndex &&
        previous.size === next.size &&
        previous.overscan === next.overscan
      ) {
        return;
      }

      runOnJS(scheduleViewportCommit)(
        next.startIndex,
        next.size,
        next.overscan,
      );
    },
  );

  useAnimatedReaction(
    () => hoverInteractionIndex.value,
    (next, previous) => {
      if (next === previous) {
        return;
      }

      runOnJS((interactionIndex: number) => {
        const currentState = stateRef.current;
        if (!currentState || interactionIndex < 0) {
          clearSelected();
          return;
        }

        const interactionPoint =
          currentState.interactionPoints[interactionIndex];
        if (!interactionPoint) {
          clearSelected();
          return;
        }

        const seriesEntry = currentState.series[interactionPoint.seriesIndex];
        const point = seriesEntry?.points[interactionPoint.pointIndex];
        if (!seriesEntry || !point) {
          clearSelected();
          return;
        }

        const current = selectedRef.current;
        const isSame =
          current &&
          current.seriesKey === seriesEntry.key &&
          current.point.index === point.index;

        if (isSame) {
          return;
        }

        const nextSelection = { point, seriesKey: seriesEntry.key };
        selectedRef.current = nextSelection;
        setSelected(nextSelection);
      })(next);
    },
  );

  const showCrosshair = Boolean(props.crosshair ?? true);
  const tooltipEnabled = Boolean(props.tooltip);
  const tooltipArgs: TooltipRenderArgs<T> | null =
    selected &&
    activeGestureMode !== "navigate" &&
    (activeGestureMode === "inspect" ||
      (activeGestureMode === "select" && selectionMode === "point"))
      ? {
          datum: selected.point.datum,
          label: selected.point.label,
          value: selected.point.value,
          seriesKey: selected.seriesKey,
          x: selected.point.x,
          y: selected.point.y,
          close: () => setSelected(null),
        }
      : null;

  const accessibilityLabel = buildAccessibilityLabel(
    "Cartesian chart",
    props,
    (datum) => Number(datum[(props.yKey ?? props.yKeys?.[0]) as keyof T]),
    (datum) => String(datum[props.xKey]),
  );

  const setGestureModeState = (mode: ActiveCartesianGestureMode) => {
    setActiveGestureMode(mode);
    activeGestureModeRef.current = mode;
  };

  const clearSelected = () => {
    selectedRef.current = null;
    setSelected(null);
  };

  const beginGesture = (_x: number, _y: number, modeCode: number) => {
    const mode = modeCodeToName(modeCode);
    setGestureModeState(mode);

    if (
      mode === "navigate" ||
      (mode === "select" && selectionMode === "range")
    ) {
      clearSelected();
    }
  };

  const finishSelection = () => {
    const currentProps = propsRef.current;
    const currentMode = activeGestureModeRef.current;
    const currentSelectionMode = currentProps.selection?.mode ?? "range";

    if (
      currentMode === "select" &&
      currentProps.selection?.enabled &&
      currentProps.selection.onSelectionChange &&
      currentSelectionMode === "point"
    ) {
      currentProps.selection.onSelectionChange(
        selectedRef.current ? [selectedRef.current.point.datum] : [],
      );
    }

    selectionActive.value = 0;
    pressState.active.value = 0;
    panState.translateX.value = 0;
    panState.translateY.value = 0;
    zoomState.scaleX.value = 1;
    zoomState.scaleY.value = 1;
    gestureMode.value = MODE_NONE;
    setGestureModeState("none");
  };

  const commitRangeSelection = (dataIndices: number[]) => {
    const currentProps = propsRef.current;
    if (
      !currentProps.selection?.enabled ||
      !currentProps.selection.onSelectionChange
    ) {
      return;
    }

    const selectedData = dataIndices
      .map((dataIndex) => currentProps.data[dataIndex])
      .filter((datum): datum is T => datum !== undefined);
    currentProps.selection.onSelectionChange(selectedData);
  };

  const finalizeGesture = (
    kind: "pan" | "pinch",
    rangeDataIndices?: number[],
  ) => {
    gestureActivityRef.current[kind] = false;

    if (
      kind === "pan" &&
      activeGestureModeRef.current === "select" &&
      selectionMode === "range" &&
      rangeDataIndices
    ) {
      commitRangeSelection(rangeDataIndices);
    }

    if (!gestureActivityRef.current.pan && !gestureActivityRef.current.pinch) {
      flushViewportCommit();
      finishSelection();
    }
  };

  const markGestureActive = (kind: "pan" | "pinch") => {
    gestureActivityRef.current[kind] = true;
  };

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .minDistance(0)
    .enabled(canNavigate || canSelect || canInspect)
    .onBegin((event) => {
      const mode = resolveCartesianGestureMode({
        interactionMode: props.interactionMode,
        navigationActivation: props.navigationActivation,
        touchCount: event.numberOfPointers,
        canInspect,
        canSelect,
        canNavigate,
      });
      const modeCode = modeNameToCode(mode);
      const shouldSnap =
        modeCode === MODE_INSPECT ||
        (modeCode === MODE_SELECT && selectionMode === "point");
      const nextHoverIndex = shouldSnap
        ? findNearestInteractionPointIndex(
            interactionPoints.value,
            event.x,
            event.y,
          )
        : -1;
      const hovered =
        nextHoverIndex >= 0 ? interactionPoints.value[nextHoverIndex] : null;

      gestureMode.value = modeCode;
      panLastX.value = event.x;
      hoverInteractionIndex.value = nextHoverIndex;
      pressState.x.value = hovered?.x ?? event.x;
      pressState.y.value = hovered?.y ?? event.y;
      pressState.index.value = hovered?.dataIndex ?? -1;
      pressState.active.value = hovered && shouldSnap ? 1 : 0;
      selectionActive.value =
        modeCode === MODE_SELECT && selectionMode === "range" ? 1 : 0;
      selectionLeft.value = event.x;
      selectionRight.value = event.x;
      if (modeCode !== MODE_NAVIGATE) {
        panState.translateX.value = 0;
      }
      runOnJS(markGestureActive)("pan");
      runOnJS(beginGesture)(event.x, event.y, modeCode);
    })
    .onUpdate((event) => {
      const nextMode = resolveCartesianGestureMode({
        interactionMode: props.interactionMode,
        navigationActivation: props.navigationActivation,
        touchCount: event.numberOfPointers,
        canInspect,
        canSelect,
        canNavigate,
      });
      const nextModeCode = modeNameToCode(nextMode);

      if (
        gestureMode.value !== MODE_NAVIGATE &&
        nextModeCode === MODE_NAVIGATE
      ) {
        gestureMode.value = MODE_NAVIGATE;
        hoverInteractionIndex.value = -1;
        pressState.active.value = 0;
        pressState.index.value = -1;
        selectionActive.value = 0;
        panLastX.value = event.x;
        runOnJS(beginGesture)(event.x, event.y, MODE_NAVIGATE);
        return;
      }

      if (gestureMode.value === MODE_NAVIGATE && props.pannable) {
        const nextViewport = createPannedViewport({
          totalPoints: state.totalPoints,
          chartWidth: state.bounds.innerWidth,
          startIndex: viewportStart.value,
          size: viewportSize.value,
          dx: event.x - panLastX.value,
          minPoints: props.minViewportPoints,
          maxPoints: props.maxViewportPoints,
          overscan: viewportOverscan.value,
        });
        viewportStart.value = nextViewport.startIndex ?? viewportStart.value;
        viewportSize.value = nextViewport.size ?? viewportSize.value;
        viewportOverscan.value =
          nextViewport.overscan ?? viewportOverscan.value;
        panState.translateX.value = event.translationX;
        panLastX.value = event.x;
        return;
      }

      if (gestureMode.value === MODE_INSPECT) {
        const nextHoverIndex = findNearestInteractionPointIndex(
          interactionPoints.value,
          event.x,
          event.y,
        );
        const hovered =
          nextHoverIndex >= 0 ? interactionPoints.value[nextHoverIndex] : null;
        hoverInteractionIndex.value = nextHoverIndex;
        pressState.active.value = hovered ? 1 : 0;
        pressState.x.value = hovered?.x ?? event.x;
        pressState.y.value = hovered?.y ?? event.y;
        pressState.index.value = hovered?.dataIndex ?? -1;
        return;
      }

      if (gestureMode.value === MODE_SELECT) {
        if (selectionMode === "range") {
          selectionActive.value = 1;
          selectionRight.value = event.x;
          return;
        }

        const nextHoverIndex = findNearestInteractionPointIndex(
          interactionPoints.value,
          event.x,
          event.y,
        );
        const hovered =
          nextHoverIndex >= 0 ? interactionPoints.value[nextHoverIndex] : null;
        hoverInteractionIndex.value = nextHoverIndex;
        pressState.active.value = hovered ? 1 : 0;
        pressState.x.value = hovered?.x ?? event.x;
        pressState.y.value = hovered?.y ?? event.y;
        pressState.index.value = hovered?.dataIndex ?? -1;
      }
    })
    .onFinalize(() => {
      const rangeDataIndices =
        gestureMode.value === MODE_SELECT && selectionMode === "range"
          ? findInteractionRangeDataIndices(
              interactionPoints.value,
              selectionLeft.value,
              selectionRight.value,
            )
          : undefined;
      runOnJS(finalizeGesture)("pan", rangeDataIndices);
    });

  const pinchGesture = Gesture.Pinch()
    .enabled(Boolean(props.zoomable))
    .onBegin((event) => {
      const modeCode = MODE_NAVIGATE;
      gestureMode.value = modeCode;
      pinchLastScale.value = 1;
      pressState.active.value = 0;
      selectionActive.value = 0;
      zoomState.scaleX.value = 1;
      zoomState.scaleY.value = 1;
      runOnJS(markGestureActive)("pinch");
      runOnJS(beginGesture)(event.focalX, event.focalY, modeCode);
    })
    .onUpdate((event) => {
      if (!props.zoomable) {
        return;
      }

      gestureMode.value = MODE_NAVIGATE;
      const incrementalScale =
        event.scale / Math.max(pinchLastScale.value, 0.0001);
      pinchLastScale.value = event.scale;
      const focalRatio = clamp(
        (event.focalX - state.bounds.padding.left) /
          Math.max(state.bounds.innerWidth, 1),
        0,
        1,
      );
      const nextViewport = createPinchedViewport({
        totalPoints: state.totalPoints,
        startIndex: viewportStart.value,
        size: viewportSize.value,
        scale: incrementalScale,
        focalRatio,
        minPoints: props.minViewportPoints,
        maxPoints: props.maxViewportPoints,
        overscan: viewportOverscan.value,
      });
      viewportStart.value = nextViewport.startIndex ?? viewportStart.value;
      viewportSize.value = nextViewport.size ?? viewportSize.value;
      viewportOverscan.value = nextViewport.overscan ?? viewportOverscan.value;
      zoomState.scaleX.value = event.scale;
      zoomState.scaleY.value = event.scale;
    })
    .onFinalize(() => {
      runOnJS(finalizeGesture)("pinch");
    });

  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  return (
    <Chart<T>
      accessibilityLabel={accessibilityLabel}
      height={props.height}
      width={width}
      theme={props.theme}
      testID={props.testID}
    >
      <CartesianContext.Provider
        value={state as CartesianChartState<Record<string, unknown>>}
      >
        <Canvas style={{ width, height: props.height }}>
          {renderSeries(state)}
        </Canvas>
        <GestureDetector gesture={combinedGesture}>
          <View style={{ position: "absolute", inset: 0 }} />
        </GestureDetector>
        <YAxis />
        <XAxis />
        <Legend items={legendItems} config={props.legend} />
        <SelectionBrush
          enabled={activeGestureMode === "select" && selectionMode === "range"}
          selectionState={{
            active: selectionActive,
            left: selectionLeft,
            right: selectionRight,
          }}
        />
        <Crosshair
          enabled={showCrosshair && activeGestureMode !== "navigate"}
          pressState={pressState}
        />
        <Tooltip
          args={tooltipEnabled ? tooltipArgs : null}
          config={props.tooltip}
        />
        <HiddenDataTable
          enabled={props.accessibleDataTable}
          data={props.data}
          columns={[
            props.xKey,
            ...(props.yKeys ?? (props.yKey ? [props.yKey] : [])),
          ]}
        />
      </CartesianContext.Provider>
    </Chart>
  );
};

const grid = <T extends Record<string, unknown>>(
  state: CartesianChartState<T>,
  color: string,
  strokeWidth: number,
) => (
  <GridLines
    xTicks={state.xTicks.map((tick) => tick.position)}
    yTicks={state.yTicks.map((tick) => tick.position)}
    left={state.bounds.padding.left}
    right={state.bounds.padding.left + state.bounds.innerWidth}
    top={state.bounds.padding.top}
    bottom={state.bounds.padding.top + state.bounds.innerHeight}
    color={color}
    strokeWidth={strokeWidth}
  />
);

export const LineChart = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
) => {
  const theme = useChartTheme();
  const yKeys = props.yKeys ?? (props.yKey ? [props.yKey] : []);
  const legendItems = yKeys.map((key, index) => ({
    key,
    label: key,
    color:
      props.colors?.[index] ??
      props.color ??
      theme.colors[index % theme.colors.length],
  }));

  return (
    <CartesianSurface
      props={props}
      legendItems={legendItems}
      renderSeries={(state) => (
        <Group>
          {grid(state, theme.gridColor, theme.gridStrokeWidth)}
          {state.series.map((series) => (
            <Line
              key={series.key}
              points={series.points}
              color={series.color}
            />
          ))}
        </Group>
      )}
    />
  );
};

export const AreaChart = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
) => {
  const theme = useChartTheme();
  const yKeys = props.yKeys ?? (props.yKey ? [props.yKey] : []);
  const legendItems = yKeys.map((key, index) => ({
    key,
    label: key,
    color:
      props.colors?.[index] ??
      props.color ??
      theme.colors[index % theme.colors.length],
  }));

  return (
    <CartesianSurface
      props={props}
      legendItems={legendItems}
      renderSeries={(state) => {
        const baseline = state.bounds.padding.top + state.bounds.innerHeight;
        return (
          <Group>
            {grid(state, theme.gridColor, theme.gridStrokeWidth)}
            {state.series.map((series) => (
              <Group key={series.key}>
                <Area
                  points={series.points}
                  baselineY={baseline}
                  color={series.color}
                />
                <Line points={series.points} color={series.color} />
              </Group>
            ))}
          </Group>
        );
      }}
    />
  );
};

export const BarChart = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
) => {
  const theme = useChartTheme();
  const yKeys = props.yKeys ?? (props.yKey ? [props.yKey] : []);
  const legendItems = yKeys.map((key, index) => ({
    key,
    label: key,
    color: props.colors?.[index] ?? theme.colors[index % theme.colors.length],
  }));

  return (
    <CartesianSurface
      props={props}
      legendItems={legendItems}
      renderSeries={(state) => {
        const clusterWidth =
          state.bounds.innerWidth / Math.max(1, state.labels.length);
        const barWidth =
          (clusterWidth * 0.68) / Math.max(1, state.series.length);
        const baseline = state.bounds.padding.top + state.bounds.innerHeight;
        return (
          <Group>
            {grid(state, theme.gridColor, theme.gridStrokeWidth)}
            {state.series.flatMap((series, seriesIndex) =>
              series.points.map((point) => (
                <Bar
                  key={`${series.key}-${point.index}`}
                  x={point.x - clusterWidth * 0.34 + seriesIndex * barWidth}
                  y={Math.min(point.y, baseline)}
                  width={barWidth - 4}
                  height={Math.abs(baseline - point.y)}
                  color={series.color}
                />
              )),
            )}
          </Group>
        );
      }}
    />
  );
};

export const HorizontalBarChart = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
) => {
  const theme = useChartTheme();
  const width = props.width ?? 360;
  const yKey = (props.yKey ?? props.yKeys?.[0]) as keyof T;
  const max = Math.max(1, ...props.data.map((datum) => Number(datum[yKey])));
  const rowHeight = (props.height - 40) / Math.max(1, props.data.length);

  return (
    <Chart<T>
      accessibilityLabel={buildAccessibilityLabel(
        "Horizontal bar chart",
        props,
        (datum) => Number(datum[yKey]),
        (datum) => String(datum[props.xKey]),
      )}
      height={props.height}
      width={width}
      theme={props.theme}
      testID={props.testID}
    >
      <View style={{ padding: 20, gap: 8 }}>
        {props.data.map((datum) => {
          const value = Number(datum[yKey]);
          const barWidth = ((width - 132) * value) / max;
          return (
            <View
              key={String(datum[props.xKey])}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                height: rowHeight - 4,
              }}
            >
              <Text
                selectable
                style={{ width: 72, color: theme.axisLabelColor }}
              >
                {String(datum[props.xKey])}
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 18,
                  borderRadius: 999,
                  backgroundColor: "rgba(148,163,184,0.16)",
                }}
              >
                <View
                  style={{
                    width: barWidth,
                    height: 18,
                    borderRadius: 999,
                    backgroundColor: props.color ?? theme.colors[0],
                  }}
                />
              </View>
              <Text
                selectable
                style={{
                  width: 40,
                  color: theme.axisLabelColor,
                  textAlign: "right",
                }}
              >
                {value}
              </Text>
            </View>
          );
        })}
      </View>
    </Chart>
  );
};

export const StackedBarChart = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
) => {
  const theme = useChartTheme();
  const yKeys = props.yKeys ?? [];
  const legendItems = yKeys.map((key, index) => ({
    key,
    label: key,
    color: props.colors?.[index] ?? theme.colors[index % theme.colors.length],
  }));

  return (
    <CartesianSurface
      props={props}
      legendItems={legendItems}
      renderSeries={(state) => {
        const clusterWidth =
          state.bounds.innerWidth / Math.max(1, state.labels.length);
        const baseline = state.bounds.padding.top + state.bounds.innerHeight;
        const totals = state.data.map((datum) =>
          yKeys.reduce((sum, key) => sum + Number(datum[key]), 0),
        );
        const maxTotal = Math.max(...totals, 1);

        return (
          <Group>
            {grid(state, theme.gridColor, theme.gridStrokeWidth)}
            {state.data.map((datum, index) => {
              let offset = 0;
              return yKeys.map((key, stackIndex) => {
                const value = Number(datum[key]);
                const height = (value / maxTotal) * state.bounds.innerHeight;
                offset += height;
                return (
                  <Bar
                    key={`${String(key)}-${index}`}
                    x={
                      (state.series[0]?.points[index]?.x ?? 0) -
                      clusterWidth * 0.3
                    }
                    y={baseline - offset}
                    width={clusterWidth * 0.6}
                    height={height}
                    color={
                      props.colors?.[stackIndex] ??
                      theme.colors[stackIndex % theme.colors.length]
                    }
                  />
                );
              });
            })}
          </Group>
        );
      }}
    />
  );
};

export const ScatterChart = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
) => {
  const theme = useChartTheme();
  const yKeys = props.yKeys ?? (props.yKey ? [props.yKey] : []);
  const legendItems = yKeys.map((key, index) => ({
    key,
    label: key,
    color: props.colors?.[index] ?? theme.colors[index % theme.colors.length],
  }));

  return (
    <CartesianSurface
      props={props}
      legendItems={legendItems}
      renderSeries={(state) => (
        <Group>
          {grid(state, theme.gridColor, theme.gridStrokeWidth)}
          {state.series.map((series) => (
            <Scatter
              key={series.key}
              points={series.points}
              color={series.color}
            />
          ))}
        </Group>
      )}
    />
  );
};

export const ComboChart = <T extends Record<string, unknown>>(
  props: CartesianChartProps<T>,
) => {
  const theme = useChartTheme();
  const yKeys = props.yKeys ?? [];
  const barKey = yKeys[0];
  const lineKey = yKeys[1] ?? yKeys[0];
  const legendItems = yKeys.map((key, index) => ({
    key,
    label: key,
    color: props.colors?.[index] ?? theme.colors[index % theme.colors.length],
  }));

  return (
    <CartesianSurface
      props={props}
      legendItems={legendItems}
      renderSeries={(state) => {
        const baseline = state.bounds.padding.top + state.bounds.innerHeight;
        const clusterWidth =
          state.bounds.innerWidth / Math.max(1, state.labels.length);
        const barSeries =
          state.series.find((series) => series.key === barKey) ??
          state.series[0];
        const lineSeries =
          state.series.find((series) => series.key === lineKey) ??
          state.series[1] ??
          state.series[0];
        return (
          <Group>
            {grid(state, theme.gridColor, theme.gridStrokeWidth)}
            {barSeries?.points.map((point) => (
              <Bar
                key={`combo-${point.index}`}
                x={point.x - clusterWidth * 0.25}
                y={point.y}
                width={clusterWidth * 0.5}
                height={baseline - point.y}
                color={barSeries.color}
              />
            ))}
            {lineSeries ? (
              <Line points={lineSeries.points} color={lineSeries.color} />
            ) : null}
            {lineSeries ? (
              <Scatter
                points={lineSeries.points}
                color={lineSeries.color}
                radius={3}
              />
            ) : null}
          </Group>
        );
      }}
    />
  );
};

export const CandlestickChart = <T extends Record<string, unknown>>({
  openKey,
  highKey,
  lowKey,
  closeKey,
  ...props
}: CandlestickChartProps<T>) => {
  const theme = useChartTheme();
  const syntheticProps = {
    ...props,
    yKeys: [highKey],
  } as CartesianChartProps<T>;

  return (
    <CartesianSurface
      props={syntheticProps}
      legendItems={[{ label: "Price", color: theme.colors[0] }]}
      renderSeries={(state) => {
        const candleWidth =
          (state.bounds.innerWidth / Math.max(1, state.data.length)) * 0.55;
        return (
          <Group>
            {grid(state, theme.gridColor, theme.gridStrokeWidth)}
            {state.data.map((datum, index) => {
              const x = state.series[0]?.points[index]?.x ?? 0;
              const baseline =
                state.bounds.padding.top + state.bounds.innerHeight;
              const high = state.series[0]?.points[index]?.y ?? baseline;
              const low =
                baseline -
                (Number(datum[lowKey]) / Math.max(state.yMax, 1)) *
                  state.bounds.innerHeight;
              const open =
                baseline -
                (Number(datum[openKey]) / Math.max(state.yMax, 1)) *
                  state.bounds.innerHeight;
              const close =
                baseline -
                (Number(datum[closeKey]) / Math.max(state.yMax, 1)) *
                  state.bounds.innerHeight;
              const color =
                Number(datum[closeKey]) >= Number(datum[openKey])
                  ? theme.bullColor
                  : theme.bearColor;
              return (
                <Group key={`${String(datum[props.xKey])}-${index}`}>
                  <ReferenceLine
                    x1={x}
                    y1={high}
                    x2={x}
                    y2={low}
                    color={color}
                  />
                  <Bar
                    x={x - candleWidth / 2}
                    y={Math.min(open, close)}
                    width={candleWidth}
                    height={Math.max(2, Math.abs(close - open))}
                    color={color}
                  />
                </Group>
              );
            })}
          </Group>
        );
      }}
    />
  );
};
