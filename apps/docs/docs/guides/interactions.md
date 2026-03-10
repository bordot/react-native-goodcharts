# Interactions

The cartesian chart family shares one interaction system.

## Tooltip and crosshair

Use `tooltip` and `crosshair` to inspect a point while dragging.

```tsx
<LineChart
  data={data}
  xKey="month"
  yKey="value"
  height={260}
  tooltip
  crosshair={{ snapToData: true }}
/>
```

You can also provide a custom tooltip renderer:

```tsx
<LineChart
  data={data}
  xKey="month"
  yKey="value"
  height={260}
  tooltip={{
    render: ({ datum, value }) => <TooltipCard datum={datum} value={value} />,
  }}
/>
```

## Range selection

```tsx
<AreaChart
  data={data}
  xKey="month"
  yKey="value"
  height={260}
  selection={{
    enabled: true,
    mode: "range",
    onSelectionChange: (selected) => console.log(selected.length),
  }}
/>
```

Range selection uses the same interaction index as tooltip snapping, so selection membership is computed by data index instead of filtering arbitrary rendered points on the JS thread.

## Panning and zooming

```tsx
<LineChart
  data={data}
  xKey="timestamp"
  yKey="value"
  height={280}
  viewport={{ startIndex: 600, size: 120, overscan: 4 }}
  pannable
  zoomable
  onViewportChange={setViewport}
/>
```

Interaction behavior is controlled with:

- `interactionMode="auto" | "inspect" | "select" | "navigate"`
- `navigationActivation="single-finger" | "two-finger"`

Default behavior:

- single-finger drag inspects when tooltip or crosshair is active
- single-finger drag brushes when range selection is active
- two-finger pan navigates when inspect or selection layers also exist
- pinch gesture changes viewport scale

## Shared-value hooks

The package also exports low-level shared-value hooks when you need to build around the interaction state yourself:

- `useChartPress()`
- `useChartZoom()`
- `useChartPan()`

These hooks return Reanimated shared values, not React state.
