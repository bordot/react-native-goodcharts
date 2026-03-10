# Line Chart

`LineChart` is the baseline cartesian component in the package. It supports the full shared cartesian interaction surface and is the easiest way to exercise tooltip, crosshair, viewport control, export overlays, and multi-series rendering together.

## Example

```tsx
import { LineChart } from "react-native-goodcharts";

<LineChart
  data={data}
  xKey="month"
  yKeys={["revenue", "cost", "profit"]}
  height={280}
  legend
  tooltip={{
    formatValue: (value) => `$${value.toFixed(0)}k`,
  }}
  crosshair={{ snapToData: true }}
  viewport={{ startIndex: 0, size: 120, overscan: 4 }}
  pannable
  zoomable
  downsampleThreshold={240}
  exportOverlay={{
    crosshair: { dataIndex: 12 },
    tooltip: { dataIndex: 12, title: "Highlighted point" },
  }}
/>
```

## Good fits

- trend charts
- multi-series product metrics
- live dashboards with `useStreamingData`
- historical explorers with controlled `viewport`

## Related charts

- Use `AreaChart` when the filled region matters.
- Use `ScatterChart` when discrete points matter more than a continuous line.
- Use `ComboChart` when one series should remain a bar layer.
