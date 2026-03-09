# react-native-goodcharts

GPU-accelerated charting for React Native, built on Skia, Reanimated, and Gesture Handler.

## Install

```bash
npm install react-native-goodcharts @shopify/react-native-skia react-native-reanimated react-native-gesture-handler
```

Optional:

```bash
npm install expo-haptics
```

This package targets React Native `0.76+` and Expo dev builds. Expo Go is not supported because Skia is a native dependency.

## Quick Start

```tsx
import { LineChart } from "react-native-goodcharts";

const data = [
  { month: "Jan", revenue: 24 },
  { month: "Feb", revenue: 30 },
  { month: "Mar", revenue: 28 },
];

export function RevenueChart() {
  return (
    <LineChart
      data={data}
      xKey="month"
      yKey="revenue"
      height={240}
      tooltip
      crosshair
    />
  );
}
```

## Included Surface

- Cartesian charts: `LineChart`, `AreaChart`, `BarChart`, `HorizontalBarChart`, `StackedBarChart`, `ScatterChart`, `ComboChart`, `CandlestickChart`
- Radial charts: `PieChart`, `DonutChart`, `RadarChart`
- Other P0 charts: `HeatmapChart`, `ProgressRingChart`, `ProgressBarChart`, `SparklineChart`
- Composable APIs: `Chart`, `CartesianCanvas`, `RadialCanvas`, axes, primitives, overlays, hooks, themes

## Export API

Mounted chart refs support:

- `toSVG()`
- `toImage("svg" | "png" | "jpeg")`
- `toBase64("svg" | "png" | "jpeg")`

SVG export is serializer-based. PNG and JPEG export use native Skia capture for mounted charts.

## Current Limits

- Raster export does not apply the `scale` argument yet.
- The package is mobile-first for iOS and Android.
- React Native Web is not part of the current release target.

## License

MIT
