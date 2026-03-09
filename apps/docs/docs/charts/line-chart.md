# Line Chart

```tsx
import { LineChart } from "react-native-goodcharts";

<LineChart
  data={data}
  xKey="month"
  yKeys={["revenue", "cost", "profit"]}
  height={280}
  legend
  tooltip
  crosshair
/>
```

The line chart uses the shared cartesian surface, so axes, tooltip, legend, and accessibility behaviors are consistent with the rest of the cartesian family.

