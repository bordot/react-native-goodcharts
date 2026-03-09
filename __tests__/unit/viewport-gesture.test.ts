import {
  createPannedViewport,
  createPinchedViewport,
} from "../../packages/charts/src/core/viewport-gesture";

describe("createPannedViewport", () => {
  it("pans the viewport based on horizontal motion", () => {
    expect(
      createPannedViewport({
        totalPoints: 1000,
        chartWidth: 400,
        startIndex: 400,
        size: 200,
        dx: -100,
      }),
    ).toEqual({ startIndex: 450, size: 200, overscan: 0 });
  });
});

describe("createPinchedViewport", () => {
  it("zooms the viewport based on pinch scale", () => {
    const next = createPinchedViewport({
      totalPoints: 1000,
      startIndex: 400,
      size: 200,
      scale: 1.6,
      minPoints: 40,
    });

    expect(next.size).toBeLessThan(200);
    expect(next.startIndex).toBeGreaterThanOrEqual(0);
  });

  it("anchors zoom around the focal point", () => {
    const next = createPinchedViewport({
      totalPoints: 1000,
      startIndex: 400,
      size: 200,
      scale: 2,
      focalRatio: 0.75,
      minPoints: 40,
    });

    expect(next.startIndex).toBeGreaterThan(400);
    expect(next.size).toBe(100);
  });

  it("respects min and max viewport sizes", () => {
    expect(
      createPinchedViewport({
        totalPoints: 1000,
        startIndex: 100,
        size: 120,
        scale: 0.1,
        minPoints: 50,
        maxPoints: 180,
      }),
    ).toEqual({ startIndex: 70, size: 180, overscan: 0 });
  });
});
