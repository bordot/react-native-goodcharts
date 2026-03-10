# react-native-goodcharts

GPU-accelerated charts for React Native, powered by Skia, Reanimated, and Gesture Handler.

`react-native-goodcharts` ships high-level chart components for common product screens and a composable drawing surface for custom work. The current package focuses on iOS and Android React Native apps, Expo dev builds, interactive cartesian charts, deterministic exports, and accessible defaults.

## Why this package

- Skia rendering for chart marks instead of SVG node trees.
- High-level components for the common chart types teams need first.
- Shared interaction layer for tooltip, crosshair, selection, pan, and pinch zoom.
- Public composable APIs for custom charts and overlays.
- Export refs for SVG, PNG, and JPEG capture.
- Accessible labels and optional hidden data tables on cartesian charts.
- Built-in large dataset support through viewport windowing and optional downsampling.
- Streaming helpers for live dashboards and monitoring views.

## Install

```bash
npm install react-native-goodcharts @shopify/react-native-skia react-native-reanimated react-native-gesture-handler
```

Optional peer for app-level haptics wiring:

```bash
npm install expo-haptics
```

This package currently targets:

- React Native `>=0.76.0 <0.78.0`
- React `>=18.2.0 <19.0.0`
- `@shopify/react-native-skia >=1.5.0 <2.0.0`
- `react-native-reanimated >=3.16.0 <4.0.0`
- `react-native-gesture-handler >=2.20.0 <3.0.0`

Expo Go is not supported because Skia is a native dependency. Use an Expo dev build.

## Quick start

```tsx
import { LineChart } from "react-native-goodcharts";

const revenue = [
  { month: "Jan", value: 24 },
  { month: "Feb", value: 30 },
  { month: "Mar", value: 28 },
  { month: "Apr", value: 36 },
];

export function RevenueChart() {
  return (
    <LineChart
      data={revenue}
      xKey="month"
      yKey="value"
      height={240}
      tooltip
      crosshair
      legend={false}
      pannable
      zoomable
    />
  );
}
```

## Included charts

Cartesian charts:

- `LineChart`
- `AreaChart`
- `BarChart`
- `HorizontalBarChart`
- `StackedBarChart`
- `ScatterChart`
- `ComboChart`
- `CandlestickChart`

Radial charts:

- `PieChart`
- `DonutChart`
- `RadarChart`
- `ProgressRingChart`

Specialized charts:

- `HeatmapChart`
- `ProgressBarChart`
- `SparklineChart`

## Shared capabilities

Most high-level charts share a consistent configuration model for:

- `theme`, `color`, and `colors`
- `tooltip`, `crosshair`, and `legend`
- `selection` for cartesian charts
- `viewport`, `pannable`, and `zoomable` for cartesian charts
- `accessibilityLabel` and chart-level accessibility summaries
- `ref` exports through `useChartRef`

Large cartesian datasets can use:

- `viewport` for visible-window slicing
- `downsampleThreshold` for bounded render density
- `onViewportChange` for externally controlled explorers
- `useStreamingData` and `createStreamingBuffer` for rolling live data

## Composable API

The package also exports lower-level building blocks for custom chart screens:

- `Chart`
- `ChartProvider`
- `CartesianCanvas`
- `RadialCanvas`
- `XAxis`, `YAxis`
- `GridLines`, `Line`, `Area`, `Bar`, `Scatter`, `Arc`
- `ReferenceLine`, `ReferenceBand`, `Annotation`
- `Tooltip`, `Crosshair`, `Legend`, `SelectionBrush`
- `useChartData`, `useChartTheme`, `useChartPress`, `useChartZoom`, `useChartPan`, `useChartRef`, `useReducedMotion`, `useStreamingData`

## Export API

Mounted chart refs support:

- `toSVG()`
- `toImage("svg" | "png" | "jpeg")`
- `toBase64("svg" | "png" | "jpeg")`

SVG export is serializer-based. PNG and JPEG export use mounted-view or canvas capture through Skia.

```tsx
import { LineChart, useChartRef } from "react-native-goodcharts";

export function ExportableChart() {
  const chartRef = useChartRef();

  const exportSvg = async () => {
    const svg = await chartRef.current?.toSVG();
    return svg;
  };

  return (
    <LineChart
      ref={chartRef}
      data={revenue}
      xKey="month"
      yKey="value"
      height={240}
      exportOverlay={{
        crosshair: { dataIndex: 2 },
        tooltip: { dataIndex: 2, title: "Selected point" },
      }}
    />
  );
}
```

## Accessibility

Current accessibility support includes:

- generated accessibility labels for chart summaries
- explicit `accessibilityLabel` overrides
- optional hidden data-table fallback on cartesian charts with `accessibleDataTable`
- `useReducedMotion()` for app-level motion adjustments

## Themes

Built-in themes:

- `lightTheme`
- `darkTheme`
- `bloombergTheme`
- `minimalTheme`

You can apply a theme globally with `ChartProvider` or per chart with the `theme` prop, and generate custom variants with `createTheme()`.

## Documentation

- [Installation](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/getting-started/installation.md)
- [Quick start](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/getting-started/quick-start.md)
- [Cartesian chart gallery](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/charts/cartesian-gallery.md)
- [Radial chart gallery](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/charts/radial-gallery.md)
- [Specialized chart gallery](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/charts/specialized-gallery.md)
- [Interactions](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/guides/interactions.md)
- [Large datasets](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/guides/large-datasets.md)
- [Real-time data](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/guides/real-time-data.md)
- [Themes](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/guides/themes.md)
- [Composable API](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/guides/composable-api.md)
- [Hooks](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/guides/hooks.md)
- [Accessibility](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/guides/accessibility.md)
- [Exporting](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/guides/exporting.md)
- [Package surface](https://github.com/bordot/react-native-goodcharts/tree/main/apps/docs/docs/api-reference/package-surface.md)

## Current limits

- The package is currently mobile-first for iOS and Android.
- React Native Web is not part of the current release target.
- `scale` is accepted by the export API but not yet applied to raster capture.
- `theme="auto"` is not yet wired to system color-scheme detection.
- Haptics config is part of the public prop model, but native haptic triggering is not implemented yet.

## License

MIT
