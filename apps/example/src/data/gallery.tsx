import { Text } from "react-native";
import {
  AreaChart,
  BarChart,
  CandlestickChart,
  ComboChart,
  DonutChart,
  HeatmapChart,
  HorizontalBarChart,
  LineChart,
  PieChart,
  ProgressBarChart,
  ProgressRingChart,
  RadarChart,
  ScatterChart,
  SparklineChart,
  StackedBarChart,
} from "react-native-goodcharts";
import { LargeDatasetDemo } from "../components/large-dataset-demo";

const monthly = [
  { month: "Jan", revenue: 34, cost: 22, profit: 12 },
  { month: "Feb", revenue: 42, cost: 25, profit: 17 },
  { month: "Mar", revenue: 38, cost: 18, profit: 20 },
  { month: "Apr", revenue: 54, cost: 30, profit: 24 },
  { month: "May", revenue: 62, cost: 33, profit: 29 },
];

const categories = [
  { label: "Product", value: 44 },
  { label: "Services", value: 28 },
  { label: "Support", value: 16 },
  { label: "Other", value: 12 },
];

const ranking = [
  { label: "North America", value: 62 },
  { label: "Europe", value: 48 },
  { label: "Asia", value: 44 },
  { label: "LATAM", value: 27 },
];

const heat = Array.from({ length: 35 }, (_, index) => ({
  week: index % 7,
  day: Math.floor(index / 7),
  count: (index * 3) % 12,
}));

const radar = [
  { current: 0.92 },
  { current: 0.81 },
  { current: 0.95 },
  { current: 0.78 },
  { current: 0.72 },
];

const scatter = [
  { x: 1, y: 12 },
  { x: 2, y: 18 },
  { x: 3, y: 14 },
  { x: 4, y: 21 },
  { x: 5, y: 17 },
  { x: 6, y: 25 },
];

const candles = [
  { day: "Mon", open: 34, high: 41, low: 29, close: 38 },
  { day: "Tue", open: 38, high: 44, low: 35, close: 36 },
  { day: "Wed", open: 36, high: 46, low: 34, close: 43 },
  { day: "Thu", open: 43, high: 49, low: 40, close: 47 },
  { day: "Fri", open: 47, high: 50, low: 42, close: 45 },
];

const largePreview = Array.from({ length: 240 }, (_, index) => ({
  index,
  value: Math.sin(index / 18) * 18 + Math.cos(index / 45) * 9 + 120,
}));

export const gallery = {
  line: {
    title: "Line chart",
    description: "Multi-series trend with shared axes and tooltip support.",
    render: () => (
      <LineChart
        data={monthly}
        xKey="month"
        yKeys={["revenue", "cost", "profit"]}
        height={280}
        legend
        tooltip
        crosshair
      />
    ),
  },
  area: {
    title: "Area chart",
    description: "Filled line chart for soft trend narratives.",
    render: () => (
      <AreaChart
        data={monthly}
        xKey="month"
        yKey="revenue"
        height={280}
        tooltip
      />
    ),
  },
  bar: {
    title: "Bar chart",
    description: "Grouped comparison across discrete periods.",
    render: () => (
      <BarChart
        data={monthly}
        xKey="month"
        yKeys={["revenue", "cost"]}
        height={280}
        legend
      />
    ),
  },
  horizontal: {
    title: "Horizontal bar chart",
    description: "Ranking-oriented display for category leaders.",
    render: () => (
      <HorizontalBarChart
        data={ranking}
        xKey="label"
        yKey="value"
        height={260}
      />
    ),
  },
  stacked: {
    title: "Stacked bar chart",
    description: "Totals and composition in one compact view.",
    render: () => (
      <StackedBarChart
        data={monthly}
        xKey="month"
        yKeys={["revenue", "cost", "profit"]}
        height={280}
        legend
      />
    ),
  },
  scatter: {
    title: "Scatter chart",
    description: "Point-based distributions on a continuous axis.",
    render: () => (
      <ScatterChart data={scatter} xKey="x" yKey="y" height={260} tooltip />
    ),
  },
  combo: {
    title: "Combo chart",
    description: "Bars plus line overlay on one shared surface.",
    render: () => (
      <ComboChart
        data={monthly}
        xKey="month"
        yKeys={["revenue", "profit"]}
        height={280}
        legend
      />
    ),
  },
  candlestick: {
    title: "Candlestick chart",
    description: "OHLC-style rendering for market movement.",
    render: () => (
      <CandlestickChart
        data={candles}
        xKey="day"
        openKey="open"
        highKey="high"
        lowKey="low"
        closeKey="close"
        height={300}
      />
    ),
  },
  pie: {
    title: "Pie chart",
    description: "Radial share breakdown with simple labels.",
    render: () => (
      <PieChart
        data={categories}
        valueKey="value"
        labelKey="label"
        height={280}
        legend
      />
    ),
  },
  donut: {
    title: "Donut chart",
    description: "Radial share breakdown with center content.",
    render: () => (
      <DonutChart
        data={categories}
        valueKey="value"
        labelKey="label"
        height={280}
        innerRadius={0.58}
        centerContent={
          <Text selectable style={{ fontSize: 28, fontWeight: "800" }}>
            100%
          </Text>
        }
        legend
      />
    ),
  },
  radar: {
    title: "Radar chart",
    description: "Capability comparison across multiple dimensions.",
    render: () => (
      <RadarChart
        data={radar}
        axes={["performance", "breadth", "accessibility", "theming", "docs"]}
        series={[
          { key: "current", label: "Current profile", color: "#2563EB" },
        ]}
        height={320}
        legend
      />
    ),
  },
  heatmap: {
    title: "Heatmap",
    description: "Contribution-style density rendering.",
    render: () => (
      <HeatmapChart
        data={heat}
        xKey="week"
        yKey="day"
        valueKey="count"
        height={220}
      />
    ),
  },
  largeDataset: {
    title: "Large dataset windowing",
    description:
      "Gesture-driven viewport control using useChartPan and useChartZoom.",
    render: () => (
      <LineChart
        data={largePreview}
        xKey="index"
        yKey="value"
        height={180}
        viewport={{ startIndex: 120, size: 80, overscan: 4 }}
      />
    ),
    detailRender: () => <LargeDatasetDemo />,
  },
  progressRing: {
    title: "Progress ring",
    description: "Compact KPI and goal tracking.",
    render: () => <ProgressRingChart value={72} height={240} />,
  },
  progressBar: {
    title: "Progress bar",
    description: "Linear completion display for dashboards and tasks.",
    render: () => <ProgressBarChart value={72} height={120} />,
  },
  sparkline: {
    title: "Sparkline",
    description: "Inline performance cues for dashboards.",
    render: () => (
      <SparklineChart data={[4, 7, 3, 8, 5, 9, 6]} height={56} width={180} />
    ),
  },
} as const;

export type GallerySlug = keyof typeof gallery;
