# react-native-goodcharts

`react-native-goodcharts` is a React Native charting package built around Skia-rendered marks, Reanimated-backed interaction state, and a consistent high-level API for the current P0 chart set.

## What ships today

- 15 published chart components across cartesian, radial, heatmap, progress, and sparkline families.
- Shared cartesian interactions for tooltip, crosshair, range selection, panning, and pinch zoom.
- Export refs for deterministic SVG plus mounted PNG and JPEG capture.
- Built-in themes plus `ChartProvider` and `createTheme()` for custom theme composition.
- Large dataset utilities for viewport slicing, rolling windows, and optional downsampling.
- Public composable APIs for custom charts and overlays.
- Accessibility summaries and optional hidden data tables on cartesian charts.

## Start here

- [Installation](./getting-started/installation.md)
- [Quick start](./getting-started/quick-start.md)
- [Cartesian chart gallery](./charts/cartesian-gallery.md)
- [Radial chart gallery](./charts/radial-gallery.md)
- [Specialized chart gallery](./charts/specialized-gallery.md)
- [Interactions](./guides/interactions.md)
- [Themes](./guides/themes.md)
- [Composable API](./guides/composable-api.md)
- [Hooks](./guides/hooks.md)
- [Package surface](./api-reference/package-surface.md)

## Current release notes

This documentation reflects the package as currently implemented in the repository. It documents the exported API, current runtime behavior, and the important limits that still exist before `v1.0`.
