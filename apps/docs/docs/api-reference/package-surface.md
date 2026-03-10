# Package Surface

This page lists the current public exports from `react-native-goodcharts`.

## High-level chart components

Cartesian:

- `LineChart`
- `AreaChart`
- `BarChart`
- `HorizontalBarChart`
- `StackedBarChart`
- `ScatterChart`
- `ComboChart`
- `CandlestickChart`

Radial and progress:

- `PieChart`
- `DonutChart`
- `RadarChart`
- `ProgressRingChart`
- `ProgressBarChart`

Specialized:

- `HeatmapChart`
- `SparklineChart`

## Core composition

- `Chart`
- `ChartProvider`
- `CartesianCanvas`
- `RadialCanvas`
- `XAxis`
- `YAxis`

## Primitives and overlays

- `GridLines`
- `Line`
- `Area`
- `Bar`
- `Scatter`
- `Arc`
- `ReferenceLine`
- `ReferenceBand`
- `Annotation`
- `Tooltip`
- `Crosshair`
- `Legend`
- `SelectionBrush`

## Hooks

- `useChartTheme`
- `useChartData`
- `useChartPress`
- `useChartZoom`
- `useChartPan`
- `useChartRef`
- `useReducedMotion`
- `useStreamingData`

## Themes and helpers

- `lightTheme`
- `darkTheme`
- `bloombergTheme`
- `minimalTheme`
- `createTheme`
- `createStreamingBuffer`
- `createWindowRange`
- `clampWindowRange`
- `sliceWindow`
- `slicePointWindow`
- `resolveCartesianGestureMode`
- `resolveNavigationGesture`

## Important public types

- `AxisConfig`
- `GridConfig`
- `AnimationConfig`
- `LegendConfig`
- `AnnotationConfig`
- `ChartTheme`
- `CartesianViewport`
- `CartesianInteractionMode`
- `CartesianNavigationActivation`
- `CartesianChartProps`
- `PieChartProps`
- `RadarChartProps`
- `HeatmapChartProps`
- `ProgressRingChartProps`
- `ProgressBarChartProps`
- `ChartRef`
- `ChartPoint`
- `LegendItem`
- `TooltipConfig`
- `CrosshairConfig`
- `SelectionConfig`

## Current implementation notes

- `AnimationConfig` is part of the public type surface, but entry and transition animation presets are still limited.
- `Annotation` is exported for the composable API, but the current implementation is a placeholder.
- `HapticsConfig` exists on shared props, but native haptic triggering is not wired yet.
