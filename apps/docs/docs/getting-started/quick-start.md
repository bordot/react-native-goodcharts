# Quick Start

## Declarative chart example

```tsx
import { LineChart } from "react-native-goodcharts";

const data = [
  { month: "Jan", revenue: 24, cost: 12 },
  { month: "Feb", revenue: 30, cost: 14 },
  { month: "Mar", revenue: 28, cost: 15 },
  { month: "Apr", revenue: 36, cost: 17 },
];

export function RevenueChart() {
  return (
    <LineChart
      data={data}
      xKey="month"
      yKeys={["revenue", "cost"]}
      height={260}
      legend
      tooltip
      crosshair
    />
  );
}
```

## Radial chart example

```tsx
import { DonutChart } from "react-native-goodcharts";

const breakdown = [
  { label: "Product", value: 68 },
  { label: "Services", value: 22 },
  { label: "Other", value: 10 },
];

export function RevenueMix() {
  return (
    <DonutChart
      data={breakdown}
      labelKey="label"
      valueKey="value"
      height={280}
      innerRadius={0.6}
      showLabels
      legend
    />
  );
}
```

## Controlling cartesian navigation

```tsx
import { useState } from "react";
import { LineChart, type CartesianViewport } from "react-native-goodcharts";

export function Explorer() {
  const [viewport, setViewport] = useState<CartesianViewport>({
    startIndex: 120,
    size: 90,
    overscan: 6,
  });

  return (
    <LineChart
      data={data}
      xKey="month"
      yKey="revenue"
      height={260}
      viewport={viewport}
      pannable
      zoomable
      onViewportChange={setViewport}
      downsampleThreshold={180}
    />
  );
}
```

## Exporting a chart

```tsx
import { LineChart, useChartRef } from "react-native-goodcharts";

export function ExportableChart() {
  const chartRef = useChartRef();

  const exportPng = async () => {
    return chartRef.current?.toImage("png");
  };

  return (
    <LineChart
      ref={chartRef}
      data={data}
      xKey="month"
      yKey="revenue"
      height={240}
    />
  );
}
```

## Explore more

- [Chart galleries](../charts/cartesian-gallery.md)
- [Interactions](../guides/interactions.md)
- [Exporting](../guides/exporting.md)
