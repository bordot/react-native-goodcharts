# react-native-goodcharts

GPU-accelerated charting for React Native, built on Skia, Reanimated, and Gesture Handler.

## Why

`react-native-goodcharts` is aimed at the gap between lightweight SVG chart kits and lower-level canvas primitives:

- high-level chart components for common product use cases
- a composable surface when you need custom rendering
- native-feeling interactions, export refs, and accessibility defaults

## Package

The publishable npm package lives in [packages/charts/README.md](/C:/react-native-goodcharts/packages/charts/README.md).

Package name:

- `react-native-goodcharts`

## Workspace

- `packages/charts`: publishable library package
- `apps/example`: Expo Router showcase app
- `apps/docs`: documentation site
- `__tests__`: unit, component, integration, and visual smoke coverage
- `benchmarks`: performance and regression scripts

## Release State

The repo is ready for first publish validation:

- package builds successfully
- `npm pack --dry-run` passes
- `npm publish --dry-run` passes
- lint, type-check, and tests are green

## Next Publish Steps

1. Add `NPM_TOKEN` and `GITHUB_TOKEN` to GitHub Actions.
2. Verify the `react-native-goodcharts` npm name is available.
3. Merge to `main` and let the release workflow publish, or publish manually from `packages/charts`.
