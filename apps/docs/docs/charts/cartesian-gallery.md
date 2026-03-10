# Cartesian Gallery

The cartesian family shares the same layout, axis, legend, tooltip, crosshair, selection, export, and viewport pipeline.

## Included charts

- `LineChart`: one or more series rendered as continuous lines.
- `AreaChart`: filled line chart using the same series model.
- `BarChart`: clustered vertical bars.
- `HorizontalBarChart`: ranked horizontal bars for categorical comparisons.
- `StackedBarChart`: stacked totals across multiple `yKeys`.
- `ScatterChart`: point-based cartesian plots.
- `ComboChart`: bars plus line overlay on the same state pipeline.
- `CandlestickChart`: OHLC-style price view using explicit open, high, low, and close keys.

## Shared cartesian props

- `xKey`
- `yKey` or `yKeys`
- `xAxis` and `yAxis`
- `tooltip`
- `crosshair`
- `legend`
- `selection`
- `viewport`
- `pannable`
- `zoomable`
- `interactionMode`
- `navigationActivation`
- `downsampleThreshold`
- `onViewportChange`
- `accessibleDataTable`

## Example

```tsx
<AreaChart
  data={series}
  xKey="month"
  yKeys={["revenue", "cost"]}
  height={280}
  legend
  tooltip
  crosshair
  selection={{ enabled: true, mode: "range" }}
  pannable
  zoomable
/>
```

## Notes

- `HorizontalBarChart` uses the cartesian prop model but renders a dedicated horizontal SVG/export path.
- `CandlestickChart` uses `openKey`, `highKey`, `lowKey`, and `closeKey` instead of `yKey` and `yKeys`.
- Export overlays are supported on the high-level cartesian wrappers through `exportOverlay`.
