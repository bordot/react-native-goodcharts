# Radial Gallery

The radial family currently combines slice-based charts and circular progress displays.

## Included charts

- `PieChart`: categorical proportions using `labelKey` and `valueKey`.
- `DonutChart`: `PieChart` with `innerRadius` and optional `centerContent`.
- `RadarChart`: multi-axis polygon comparison using a `series` array.
- `ProgressRingChart`: circular progress with optional colored segments.

## Example

```tsx
<PieChart
  data={breakdown}
  labelKey="label"
  valueKey="value"
  height={280}
  showLabels
  legend
/>
```

```tsx
<RadarChart
  data={skills}
  axes={["JavaScript", "TypeScript", "Design", "Ops"]}
  series={[
    { key: "current", label: "Current", color: "#2563EB" },
    { key: "target", label: "Target", color: "#059669" },
  ]}
  height={320}
  legend
/>
```

## Notes

- `ProgressRingChart` lives in the progress/gauge folder internally but belongs to the same circular visual family.
- Radial exports serialize chart marks, legends, labels, and supported export overlays.
