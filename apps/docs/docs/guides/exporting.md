# Exporting Charts

`react-native-goodcharts` supports both deterministic SVG export and native raster snapshots for mounted charts.

## Supported today

- `ref.current?.toSVG()` returns normalized SVG markup.
- `ref.current?.toImage("svg")` returns an SVG data URI.
- `ref.current?.toBase64("svg")` returns raw SVG base64.
- `ref.current?.toImage("png")` returns a PNG data URI for mounted charts.
- `ref.current?.toImage("jpeg")` returns a JPEG data URI for mounted charts.
- `ref.current?.toBase64("png")` returns raw PNG base64 for mounted charts.
- `ref.current?.toBase64("jpeg")` returns raw JPEG base64 for mounted charts.

Raster export uses Skia native capture APIs.

- High-level chart components capture the mounted chart view, including React Native overlays.
- `CartesianCanvas` and `RadialCanvas` capture the mounted Skia canvas directly.

## Limits

Mounted raster capture is required for `png` and `jpeg`.

- If the chart ref is not attached yet, raster export throws.
- If a chart only has an SVG serializer and no mounted capture source, raster export throws.
- `scale` is accepted by the API but is not applied yet to native raster capture.

## Example

```tsx
import { LineChart, useChartRef } from 'react-native-goodcharts';

export function ExportExample() {
  const chartRef = useChartRef();

  const exportSvg = async () => {
    return chartRef.current?.toSVG();
  };

  const exportPng = async () => {
    return chartRef.current?.toImage('png');
  };

  return (
    <LineChart
      ref={chartRef}
      data={[
        { month: 'Jan', value: 24 },
        { month: 'Feb', value: 30 },
        { month: 'Mar', value: 28 },
      ]}
      xKey="month"
      yKey="value"
      height={240}
      exportOverlay={{
        crosshair: { dataIndex: 1 },
        tooltip: { dataIndex: 1, title: 'Focused point' },
      }}
    />
  );
}
```

## Current export fidelity

SVG export from high-level chart refs serializes chart marks, axes, legends, and export overlays.

For cartesian charts that includes:

- selection ranges
- crosshair guides
- tooltip callouts

For pie and donut charts that includes:

- active-slice highlighting
- tooltip callouts

Raster export captures the mounted rendered chart instead of the SVG serializer output.

