# Real-Time Data

`react-native-goodcharts` includes a rolling-buffer hook for streaming and monitoring scenarios.

## Hook example

```tsx
import { LineChart, useStreamingData } from "react-native-goodcharts";

export function LiveSeries() {
  const stream = useStreamingData<{ timestamp: string; value: number }>({
    maxPoints: 240,
  });

  return (
    <LineChart
      data={stream.data}
      xKey="timestamp"
      yKey="value"
      height={280}
      tooltip
      crosshair
      viewport={{ followEnd: true, size: 120, overscan: 6 }}
    />
  );
}
```

## Buffer behavior

`useStreamingData()` keeps only the latest `maxPoints` items and returns imperative methods for pushing and resetting data.

- `push()` adds one datum
- `pushMany()` appends several entries
- `clear()` empties the buffer
- `reset()` swaps in a new initial sequence

## Lower-level utility

If you want a non-hook rolling buffer, use `createStreamingBuffer()` directly.

## Typical pairing

Streaming views usually combine:

- `useStreamingData()`
- cartesian `viewport.followEnd`
- `pannable` and `zoomable` when the user needs to inspect history
