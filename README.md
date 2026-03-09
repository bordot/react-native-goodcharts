# react-native-goodcharts

GPU-accelerated charting primitives and batteries-included React Native components built on Skia, Reanimated, and Gesture Handler.

## Workspace

- `packages/charts`: publishable library package
- `apps/example`: Expo Router showcase app
- `apps/docs`: Docusaurus docs site
- `__tests__`: unit, component, integration, and visual smoke coverage
- `benchmarks`: performance and regression scripts

## Status

This scaffold implements the core monorepo, shared chart engine, P0 chart surface exports, docs/example shells, and testable utility modules. It is designed to grow into the full `v1.0` release plan without changing the public package shape.

The current public export surface supports both deterministic SVG and native raster capture: `toSVG()`, `toImage("svg")`, `toBase64("svg")`, plus mounted-chart `png`/`jpeg` exports through `toImage()` and `toBase64()`.



