import type { ReactNode, RefObject } from "react";

export type DatumValue = string | number | Date;
export type KeyOf<T> = Extract<keyof T, string>;
export type ChartScaleType = "linear" | "time" | "band" | "point";
export type AnimationType =
  | "fade"
  | "grow"
  | "slide"
  | "spring"
  | "draw"
  | "none";
export type TransitionType = "morph" | "crossfade" | "instant";
export type LegendPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "floating";
export type CartesianInteractionMode =
  | "auto"
  | "inspect"
  | "select"
  | "navigate";
export type CartesianNavigationActivation = "single-finger" | "two-finger";

export interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartPoint<T> {
  x: number;
  y: number;
  value: number;
  label: string;
  index: number;
  datum: T;
}

export interface SeriesPoints<T> {
  key: string;
  color: string;
  points: ChartPoint<T>[];
}

export interface CartesianInteractionPoint {
  x: number;
  y: number;
  seriesIndex: number;
  pointIndex: number;
  dataIndex: number;
}

export interface ChartBounds {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  padding: ChartPadding;
}

export interface AxisTick {
  value: number | string;
  label: string;
  position: number;
}

export interface AxisConfig {
  visible?: boolean;
  position?: "left" | "right" | "top" | "bottom";
  tickCount?: number;
  tickValues?: Array<number | string>;
  tickSize?: number;
  tickColor?: string;
  tickWidth?: number;
  showLabels?: boolean;
  labelSize?: number;
  labelColor?: string;
  labelRotation?: number;
  labelOffset?: number;
  showAxisLine?: boolean;
  axisLineColor?: string;
  axisLineWidth?: number;
  title?: string;
  titleSize?: number;
  titleColor?: string;
  titleOffset?: number;
  domain?: [number, number] | "auto";
  domainPadding?: number | { start: number; end: number };
  nice?: boolean;
  inverted?: boolean;
  scaleType?: ChartScaleType;
  formatLabel?: (value: number | string, index: number) => string;
}

export interface GridLineConfig {
  visible?: boolean;
  count?: number;
  color?: string;
  strokeWidth?: number;
  dashPattern?: number[];
  opacity?: number;
}

export interface GradientConfig {
  type?: "linear" | "radial" | "sweep";
  colors: string[];
  positions?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export interface GridConfig {
  horizontal?: GridLineConfig;
  vertical?: GridLineConfig;
  backgroundColor?: string;
  backgroundGradient?: GradientConfig;
  alternatingBands?: {
    color: string;
    opacity: number;
    orientation: "horizontal" | "vertical";
  };
}

export interface AnimationConfig {
  enter?: {
    type: AnimationType;
    duration?: number;
    delay?: number;
    stagger?: number;
    direction?: "left" | "right" | "up" | "down";
  };
  transition?: {
    type: TransitionType;
    duration?: number;
  };
  exit?: {
    type: "fade" | "shrink" | "slide" | "none";
    duration?: number;
  };
  loop?: {
    enabled: boolean;
    duration?: number;
    type?: "pulse" | "rotate" | "shimmer";
  };
  respectReducedMotion?: boolean;
}

export interface LegendItem {
  label: string;
  color: string;
  shape?: "circle" | "square" | "line" | "diamond" | "triangle";
  key?: string;
}

export interface LegendConfig {
  visible?: boolean;
  position?: LegendPosition;
  layout?: "horizontal" | "vertical";
  alignment?: "start" | "center" | "end";
  itemSpacing?: number;
  markerShape?: LegendItem["shape"];
  markerSize?: number;
  labelSize?: number;
  labelColor?: string;
  toggleable?: boolean;
  highlightable?: boolean;
  renderItem?: (item: LegendItem, index: number) => ReactNode;
  scrollable?: boolean;
  maxHeight?: number;
}

export interface AnnotationConfig {
  type: "text" | "line" | "band" | "point" | "box";
  x?: DatumValue;
  y?: number;
  x2?: DatumValue;
  y2?: number;
  content?: string | ReactNode;
  color?: string;
  fontSize?: number;
  arrow?: boolean;
  arrowDirection?: "up" | "down" | "left" | "right" | "auto";
  draggable?: boolean;
}

export interface TooltipRenderArgs<T> {
  datum: T | null;
  label: string;
  value: number | null;
  seriesKey?: string;
  x: number;
  y: number;
  close: () => void;
}

export interface TooltipConfig<T> {
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  padding?: number;
  position?: "auto" | "top" | "bottom";
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
  render?: (args: TooltipRenderArgs<T>) => ReactNode;
}

export interface CrosshairConfig {
  enabled?: boolean;
  lineStyle?: "solid" | "dashed" | "dotted";
  lineColor?: string;
  lineWidth?: number;
  showXLabel?: boolean;
  showYLabel?: boolean;
  snapToData?: boolean;
  magnetRadius?: number;
}

export interface SelectionConfig<T> {
  enabled?: boolean;
  mode?: "point" | "range";
  color?: string;
  borderColor?: string;
  onSelectionChange?: (selected: T[]) => void;
  handles?: boolean;
}

export interface HapticsConfig {
  enabled?: boolean;
  onDataPoint?: "light" | "medium" | "heavy" | "none";
  onCrosshairSnap?: "light" | "medium" | "heavy" | "none";
  onZoomBoundary?: "light" | "medium" | "heavy" | "none";
  onSelection?: "light" | "medium" | "heavy" | "none";
}

export interface ExportCrosshairConfig {
  dataIndex: number;
  seriesKey?: string;
  color?: string;
}

export interface ExportSelectionConfig {
  startIndex: number;
  endIndex: number;
  color?: string;
  borderColor?: string;
}

export interface ExportTooltipConfig {
  dataIndex: number;
  seriesKey?: string;
  title?: string;
}

export interface ExportOverlayConfig {
  activeIndex?: number;
  crosshair?: ExportCrosshairConfig;
  selection?: ExportSelectionConfig;
  tooltip?: ExportTooltipConfig;
}
export interface ChartTheme {
  backgroundColor: string;
  axisLineColor: string;
  axisLabelColor: string;
  axisLabelSize: number;
  axisTitleColor: string;
  axisTitleSize: number;
  gridColor: string;
  gridStrokeWidth: number;
  colors: string[];
  tooltipBackground: string;
  tooltipText: string;
  tooltipBorder: string;
  tooltipBorderRadius: number;
  crosshairColor: string;
  crosshairLabelBackground: string;
  crosshairLabelText: string;
  legendLabelColor: string;
  legendLabelSize: number;
  selectionColor: string;
  selectionBorderColor: string;
  animationDuration: number;
  bullColor: string;
  bearColor: string;
}

export interface BaseChartProps<T> {
  data: T[];
  height: number;
  width?: number;
  padding?: Partial<ChartPadding>;
  color?: string;
  colors?: string[];
  grid?: boolean | GridConfig;
  theme?: Partial<ChartTheme>;
  legend?: boolean | LegendConfig;
  tooltip?: boolean | TooltipConfig<T>;
  crosshair?: boolean | CrosshairConfig;
  selection?: SelectionConfig<T>;
  animation?: AnimationConfig;
  animated?: boolean;
  accessibilityLabel?: string;
  accessibilityDescription?: string;
  accessibleDataTable?: boolean;
  haptics?: HapticsConfig;
  exportOverlay?: ExportOverlayConfig;
  testID?: string;
}

export interface CartesianViewport {
  startIndex?: number;
  size?: number;
  overscan?: number;
  followEnd?: boolean;
}

export interface CartesianChartProps<T> extends BaseChartProps<T> {
  xKey: KeyOf<T>;
  yKey?: KeyOf<T>;
  yKeys?: Array<KeyOf<T>>;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  viewport?: CartesianViewport;
  pannable?: boolean;
  zoomable?: boolean;
  interactionMode?: CartesianInteractionMode;
  navigationActivation?: CartesianNavigationActivation;
  minViewportPoints?: number;
  maxViewportPoints?: number;
  downsampleThreshold?: number;
  onViewportChange?: (viewport: CartesianViewport) => void;
}

export interface PieDatum {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps<T> extends BaseChartProps<T> {
  valueKey: KeyOf<T>;
  labelKey: KeyOf<T>;
  innerRadius?: number;
  showLabels?: boolean;
  centerContent?: ReactNode;
}

export interface RadarChartSeries<T> {
  key: KeyOf<T>;
  label: string;
  color: string;
}

export interface RadarChartProps<T> extends BaseChartProps<T> {
  axes: string[];
  series: RadarChartSeries<T>[];
}

export interface HeatmapChartProps<T> extends BaseChartProps<T> {
  xKey: KeyOf<T>;
  yKey: KeyOf<T>;
  valueKey: KeyOf<T>;
  cellSize?: number;
  cellGap?: number;
  cellRadius?: number;
}

export interface ProgressSegment {
  from: number;
  to: number;
  color: string;
  label?: string;
}

export interface ProgressRingChartProps {
  value: number;
  min?: number;
  max?: number;
  height: number;
  width?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  segments?: ProgressSegment[];
  animated?: boolean;
  accessibilityLabel?: string;
}

export interface ProgressBarChartProps extends ProgressRingChartProps {
  borderRadius?: number;
}

export type ChartExportFormat = "svg" | "png" | "jpeg";

export interface ChartRef {
  toImage: (format?: ChartExportFormat, scale?: number) => Promise<string>;
  toSVG: () => Promise<string>;
  toBase64: (format?: ChartExportFormat, scale?: number) => Promise<string>;
}

export interface ChartRefHandle extends RefObject<ChartRef | null> {}

export interface ChartPressState {
  x: { value: number };
  y: { value: number };
  active: { value: number };
  index: { value: number };
}

export interface ChartZoomState {
  scaleX: { value: number };
  scaleY: { value: number };
}

export interface ChartPanState {
  translateX: { value: number };
  translateY: { value: number };
}

export interface CartesianChartState<T> {
  bounds: ChartBounds;
  data: T[];
  allData: T[];
  xTicks: AxisTick[];
  yTicks: AxisTick[];
  series: SeriesPoints<T>[];
  interactionPoints: CartesianInteractionPoint[];
  labels: string[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  totalPoints: number;
  renderedPoints: number;
  isWindowed: boolean;
  isDownsampled: boolean;
  windowRange: {
    startIndex: number;
    endIndex: number;
  };
}
