# Real-Time Data

`react-native-goodcharts` includes a rolling-buffer hook for streaming and monitoring scenarios.

```tsx
import { LineChart, useStreamingData } from "react-native-goodcharts";

const stream = useStreamingData<{ timestamp: string; value: number }>({
  maxPoints: 120,
});

stream.push({ timestamp: new Date().toISOString(), value: 42 });

<LineChart
  data={stream.data}
  xKey="timestamp"
  yKey="value"
  height={280}
  crosshair
  tooltip
/>
```

The hook keeps only the latest `maxPoints` values, which makes it suitable as the first building block for live telemetry, finance, and operations dashboards.

