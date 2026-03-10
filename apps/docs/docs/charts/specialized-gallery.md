# Specialized Gallery

These charts cover targeted UI cases where a full cartesian or radial surface would be too heavy.

## Included charts

- `HeatmapChart`: grid-style intensity chart using `xKey`, `yKey`, and `valueKey`.
- `ProgressBarChart`: linear progress display with optional segments.
- `SparklineChart`: compact inline trend chart with a minimal surface.

## Example

```tsx
<HeatmapChart
  data={cells}
  xKey="week"
  yKey="day"
  valueKey="count"
  height={220}
  legend
/>
```

```tsx
<ProgressBarChart
  value={72}
  min={0}
  max={100}
  height={24}
  segments={[
    { from: 0, to: 40, color: "#EF4444" },
    { from: 40, to: 70, color: "#F59E0B" },
    { from: 70, to: 100, color: "#10B981" },
  ]}
/>
```

## Notes

- `HeatmapChart` uses a dedicated implementation and legend mapping rather than the shared cartesian context.
- `SparklineChart` is intentionally narrow: no axes, no legend, and compact export output.
