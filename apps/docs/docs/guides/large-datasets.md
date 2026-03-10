# Large Datasets

The cartesian render path supports viewport-based slicing before marks are rendered.

## Viewport windowing

```tsx
<LineChart
  data={data}
  xKey="timestamp"
  yKey="value"
  height={280}
  viewport={{ startIndex: 200, size: 120, overscan: 4 }}
/>
```

Use:

- `viewport.size` to define the visible window
- `viewport.startIndex` to move through historical data
- `viewport.overscan` to avoid obvious edge popping
- `viewport.followEnd` for live views pinned to the latest points

## Built-in chart gestures

Cartesian charts support internal viewport updates through `pannable` and `zoomable`.

```tsx
<LineChart
  data={data}
  xKey="timestamp"
  yKey="value"
  height={280}
  viewport={viewport}
  pannable
  zoomable
  interactionMode="navigate"
  onViewportChange={setViewport}
  downsampleThreshold={240}
/>
```

## Gesture behavior

- `interactionMode="auto"` separates inspect, selection, and navigation gestures.
- `navigationActivation="two-finger"` keeps one-finger drag free for inspection when overlays are active.
- Pinch changes viewport scale.
- Pan changes the visible start index.

## Optional downsampling

Set `downsampleThreshold` to cap the number of rendered points after windowing for dense series.

This is useful when:

- the dataset is much larger than the viewport
- live updates are frequent
- you only need line shape preservation at the current zoom level

## Useful exports

The package also exposes the lower-level helpers used by the chart state pipeline:

- `createWindowRange()`
- `clampWindowRange()`
- `sliceWindow()`
- `slicePointWindow()`
