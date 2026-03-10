# Themes

The package ships with four built-in themes:

- `lightTheme`
- `darkTheme`
- `bloombergTheme`
- `minimalTheme`

## Apply a theme globally

```tsx
import { ChartProvider, bloombergTheme } from "react-native-goodcharts";

export function App() {
  return <ChartProvider theme={bloombergTheme}>{/* screens */}</ChartProvider>;
}
```

## Apply a theme per chart

```tsx
import { LineChart, minimalTheme } from "react-native-goodcharts";

<LineChart
  data={data}
  xKey="month"
  yKey="value"
  height={240}
  theme={minimalTheme}
/>
```

## Create a custom theme

```tsx
import { createTheme } from "react-native-goodcharts";

const brandTheme = createTheme({
  backgroundColor: "#0F172A",
  axisLineColor: "#334155",
  axisLabelColor: "#CBD5E1",
  colors: ["#38BDF8", "#22C55E", "#F59E0B"],
});
```

## Theme notes

- `createTheme()` merges overrides onto the light theme.
- `ChartProvider` accepts `"light"`, `"dark"`, `"auto"`, or a partial custom theme.
- In the current implementation, `theme="auto"` resolves to the default theme instead of reading system color scheme.
- `useChartTheme()` returns the resolved theme from context.
