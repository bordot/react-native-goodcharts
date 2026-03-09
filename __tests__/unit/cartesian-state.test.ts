import {
  clearCartesianStateCache,
  createCartesianState,
} from "../../packages/charts/src/core/data";
import { createBounds } from "../../packages/charts/src/core/layout";

describe("createCartesianState viewport integration", () => {
  beforeEach(() => {
    clearCartesianStateCache();
  });

  const data = Array.from({ length: 10 }, (_, index) => ({
    step: `P${index}`,
    value: index + 1,
  }));

  it("returns the full dataset when no viewport is provided", () => {
    const state = createCartesianState(
      {
        data,
        xKey: "step",
        yKey: "value",
        height: 240,
      },
      createBounds(320, 240),
      ["#2563EB"],
    );

    expect(state.data).toHaveLength(10);
    expect(state.renderedPoints).toBe(10);
    expect(state.isWindowed).toBe(false);
    expect(state.isDownsampled).toBe(false);
    expect(state.windowRange).toEqual({ startIndex: 0, endIndex: 10 });
  });

  it("slices the visible dataset when a viewport is provided", () => {
    const state = createCartesianState(
      {
        data,
        xKey: "step",
        yKey: "value",
        height: 240,
        viewport: {
          startIndex: 3,
          size: 4,
        },
      },
      createBounds(320, 240),
      ["#2563EB"],
    );

    expect(state.data.map((item) => item.step)).toEqual([
      "P3",
      "P4",
      "P5",
      "P6",
    ]);
    expect(state.labels).toEqual(["P3", "P4", "P5", "P6"]);
    expect(state.interactionPoints).toHaveLength(4);
    expect(state.renderedPoints).toBe(4);
    expect(state.interactionPoints[0]).toMatchObject({
      seriesIndex: 0,
      pointIndex: 0,
      dataIndex: 3,
    });
    expect(state.isWindowed).toBe(true);
    expect(state.windowRange).toEqual({ startIndex: 3, endIndex: 7 });
  });

  it("supports follow-end streaming windows", () => {
    const state = createCartesianState(
      {
        data,
        xKey: "step",
        yKey: "value",
        height: 240,
        viewport: {
          size: 3,
          followEnd: true,
        },
      },
      createBounds(320, 240),
      ["#2563EB"],
    );

    expect(state.data.map((item) => item.step)).toEqual(["P7", "P8", "P9"]);
    expect(state.windowRange).toEqual({ startIndex: 7, endIndex: 10 });
  });

  it("reuses cached state for identical inputs", () => {
    const bounds = createBounds(320, 240);
    const first = createCartesianState(
      {
        data,
        xKey: "step",
        yKey: "value",
        height: 240,
        viewport: {
          startIndex: 2,
          size: 4,
        },
      },
      bounds,
      ["#2563EB"],
    );
    const second = createCartesianState(
      {
        data,
        xKey: "step",
        yKey: "value",
        height: 240,
        viewport: {
          startIndex: 2,
          size: 4,
        },
      },
      bounds,
      ["#2563EB"],
    );

    expect(second).toBe(first);
  });

  it("creates a new state when the viewport changes", () => {
    const bounds = createBounds(320, 240);
    const first = createCartesianState(
      {
        data,
        xKey: "step",
        yKey: "value",
        height: 240,
        viewport: {
          startIndex: 2,
          size: 4,
        },
      },
      bounds,
      ["#2563EB"],
    );
    const second = createCartesianState(
      {
        data,
        xKey: "step",
        yKey: "value",
        height: 240,
        viewport: {
          startIndex: 3,
          size: 4,
        },
      },
      bounds,
      ["#2563EB"],
    );

    expect(second).not.toBe(first);
    expect(second.windowRange).toEqual({ startIndex: 3, endIndex: 7 });
  });

  it("downsamples line-like datasets when a threshold is provided", () => {
    const largeData = Array.from({ length: 40 }, (_, index) => ({
      step: `P${index}`,
      value: Math.sin(index / 3) * 20 + index,
    }));

    const state = createCartesianState(
      {
        data: largeData,
        xKey: "step",
        yKey: "value",
        height: 240,
        downsampleThreshold: 8,
      },
      createBounds(320, 240),
      ["#2563EB"],
    );

    expect(state.series[0]?.points).toHaveLength(8);
    expect(state.renderedPoints).toBe(8);
    expect(state.isDownsampled).toBe(true);
    expect(state.series[0]?.points[0]?.index).toBe(0);
    expect(state.series[0]?.points[7]?.index).toBe(39);
  });
});
