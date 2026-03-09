import { createRef } from "react";
import type { ChartRef } from "react-native-goodcharts";
import { LineChart } from "../../packages/charts/src/cartesian/exported-charts";
import { PieChart } from "../../packages/charts/src/radial/exported-charts";

const renderer = require("react-test-renderer");

jest.mock("@shopify/react-native-skia", () => ({
  ImageFormat: {
    JPEG: 3,
    PNG: 4,
  },
  makeImageFromView: jest.fn(),
}));

jest.mock("react-native", () => ({
  View: "View",
  useWindowDimensions: () => ({ width: 420, height: 900 }),
}));

jest.mock("../../packages/charts/src/cartesian/charts", () => ({
  LineChart: () => null,
  AreaChart: () => null,
  BarChart: () => null,
  HorizontalBarChart: () => null,
  StackedBarChart: () => null,
  ScatterChart: () => null,
  ComboChart: () => null,
  CandlestickChart: () => null,
}));

jest.mock("../../packages/charts/src/radial/charts", () => ({
  PieChart: () => null,
  DonutChart: () => null,
  RadarChart: () => null,
}));

describe("exported chart refs", () => {
  it("exports cartesian marks with axis labels and overlays", async () => {
    const ref = createRef<ChartRef>();

    renderer.create(
      <LineChart
        ref={ref}
        data={[
          { month: "Jan", value: 10 },
          { month: "Feb", value: 14 },
          { month: "Mar", value: 12 },
        ]}
        xKey="month"
        yKey="value"
        height={220}
        exportOverlay={{
          crosshair: { dataIndex: 1 },
          selection: { startIndex: 0, endIndex: 1 },
          tooltip: { dataIndex: 1, title: "Focused point" },
        }}
      />,
    );

    expect(ref.current).not.toBeNull();
    await expect(ref.current?.toSVG()).resolves.toContain("<svg");
    await expect(ref.current?.toSVG()).resolves.toContain("<path");
    await expect(ref.current?.toSVG()).resolves.toContain(">Jan<");
    await expect(ref.current?.toSVG()).resolves.toContain(">Focused point<");
    await expect(ref.current?.toImage("svg")).resolves.toContain(
      "data:image/svg+xml;base64,",
    );
  });

  it("exports radial marks with legend labels and active-slice tooltip", async () => {
    const ref = createRef<ChartRef>();

    renderer.create(
      <PieChart
        ref={ref}
        data={[
          { label: "A", value: 30 },
          { label: "B", value: 20 },
          { label: "C", value: 50 },
        ]}
        valueKey="value"
        labelKey="label"
        height={240}
        exportOverlay={{
          activeIndex: 0,
          tooltip: { dataIndex: 0, title: "Active slice" },
        }}
      />,
    );

    expect(ref.current).not.toBeNull();
    await expect(ref.current?.toSVG()).resolves.toContain("<svg");
    await expect(ref.current?.toSVG()).resolves.toContain("<path");
    await expect(ref.current?.toSVG()).resolves.toContain(">A<");
    await expect(ref.current?.toSVG()).resolves.toContain(">Active slice<");
    await expect(ref.current?.toBase64("svg")).resolves.toMatch(
      /^[A-Za-z0-9+/=]+$/,
    );
  });
});
