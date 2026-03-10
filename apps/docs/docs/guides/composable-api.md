# Composable API

Use the composable API when the high-level chart wrappers are too opinionated.

## Core building blocks

- `Chart`
- `CartesianCanvas`
- `RadialCanvas`
- `XAxis`
- `YAxis`
- `GridLines`
- `Line`
- `Area`
- `Bar`
- `Scatter`
- `Arc`
- `ReferenceLine`
- `ReferenceBand`
- `Annotation`
- `Tooltip`
- `Crosshair`
- `Legend`
- `SelectionBrush`

## Cartesian example

```tsx
import {
  Chart,
  CartesianCanvas,
  Crosshair,
  GridLines,
  Line,
  Scatter,
  XAxis,
  YAxis,
  useChartPress,
} from "react-native-goodcharts";

export function CustomCartesian() {
  const pressState = useChartPress();

  return (
    <Chart height={300} width={360} accessibilityLabel="Custom revenue chart">
      <CartesianCanvas
        data={data}
        xKey="month"
        yKeys={["revenue"]}
        height={300}
        width={360}
      >
        {(state) => (
          <>
            <GridLines
              xTicks={state.xTicks.map((tick) => tick.position)}
              yTicks={state.yTicks.map((tick) => tick.position)}
              left={state.bounds.padding.left}
              right={state.bounds.padding.left + state.bounds.innerWidth}
              top={state.bounds.padding.top}
              bottom={state.bounds.padding.top + state.bounds.innerHeight}
              color="#E5E7EB"
            />
            <Line points={state.series[0].points} color="#2563EB" />
            <Scatter points={state.series[0].points} color="#2563EB" radius={3} />
            <Crosshair pressState={pressState} />
          </>
        )}
      </CartesianCanvas>
      <YAxis />
      <XAxis />
    </Chart>
  );
}
```

## Radial example

```tsx
import { Arc, RadialCanvas } from "react-native-goodcharts";

<RadialCanvas height={280}>
  {({ x, y, radius }) => (
    <Arc
      cx={x}
      cy={y}
      outerRadius={radius}
      innerRadius={radius * 0.6}
      startAngle={-Math.PI / 2}
      endAngle={Math.PI / 3}
      color="#2563EB"
    />
  )}
</RadialCanvas>
```

## Current limits

- `Annotation` is exported but currently renders as a placeholder.
- High-level chart wrappers provide richer export serialization than raw canvas refs.
- Axis components currently read from cartesian context and are intended for the cartesian surface only.
