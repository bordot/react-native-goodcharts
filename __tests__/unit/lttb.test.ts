import { lttb } from "react-native-goodcharts/utils/lttb";

describe("lttb", () => {
  it("reduces large inputs to the requested threshold", () => {
    const points = Array.from({ length: 100 }, (_, index) => ({
      x: index,
      y: Math.sin(index),
    }));
    expect(lttb(points, 10)).toHaveLength(10);
  });

  it("keeps the endpoints when the threshold is 2", () => {
    const points = Array.from({ length: 6 }, (_, index) => ({
      x: index,
      y: index * 2,
    }));

    expect(lttb(points, 2)).toEqual([points[0], points[5]]);
  });
});
