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

## How export works

- High-level chart components serialize SVG for deterministic mark export.
- Mounted raster export uses Skia-backed view or canvas capture.
- High-level export wrappers can serialize marks, chrome, and supported export overlays.

## Export overlays

Use `exportOverlay` when you want exported output to include a deterministic interaction state.

```tsx
<LineChart
  ref={chartRef}
  data={data}
  xKey="month"
  yKey="value"
  height={240}
  exportOverlay={{
    crosshair: { dataIndex: 2 },
    selection: { startIndex: 1, endIndex: 3 },
    tooltip: { dataIndex: 2, title: "Focused point" },
  }}
/>
```

## Current fidelity

SVG export from high-level chart refs currently serializes:

- chart marks
- axes
- legends
- supported overlay state
- tooltip callouts used through `exportOverlay`

Raster export captures the mounted chart output instead of the SVG serializer output.

## Limits

- Mounted raster capture is required for `png` and `jpeg`.
- If the chart ref is not attached yet, raster export throws.
- `scale` is accepted by the API but is not applied yet to raster capture.
