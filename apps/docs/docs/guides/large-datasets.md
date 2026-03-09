# Large Datasets

The cartesian render path now supports viewport-based slicing before marks are rendered.

```tsx
<LineChart
  data={data}
  xKey="timestamp"
  yKey="value"
  height={280}
  viewport={{ startIndex: 200, size: 120, overscan: 4 }}
/>
```

Use `viewport.size` to define the visible window, `startIndex` to move through historical data, and `followEnd` for live views that should stay pinned to the newest points.

## Built-in chart gestures

Cartesian charts now support internal viewport updates through `pannable` and `zoomable`.

```tsx
const [viewport, setViewport] = useState({
  startIndex: 1200,
  size: 160,
  overscan: 4,
});

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

`interactionMode="auto"` separates competing gestures by default:

- Single-finger drag inspects when crosshair or tooltip is active.
- Single-finger drag creates a brush when range selection is enabled.
- Two-finger pan switches to viewport navigation when inspect or selection layers are present.
- Pinch zoom scales the viewport natively instead of mapping zoom to vertical drag.

Use `interactionMode="navigate"` when the chart should behave like a dedicated explorer and reserve the primary drag gesture for panning while pinch handles zoom.

## Optional downsampling

For dense line-like series, set `downsampleThreshold` to cap the number of rendered points per series after windowing. This keeps interaction data and path building bounded without changing the underlying dataset.
