import {
  clampWindowRange,
  createWindowRange,
  sliceWindow,
} from "react-native-goodcharts/core/windowing";

describe("windowing helpers", () => {
  it("creates an overscanned range", () => {
    expect(createWindowRange(100, 10, 20, 2)).toEqual({
      startIndex: 8,
      endIndex: 32,
    });
  });

  it("clamps to the available data size", () => {
    expect(clampWindowRange(5, -10, 20)).toEqual({
      startIndex: 0,
      endIndex: 5,
    });
  });

  it("slices a dataset with a computed range", () => {
    const values = [0, 1, 2, 3, 4, 5, 6];
    expect(sliceWindow(values, { startIndex: 2, endIndex: 5 })).toEqual([
      2, 3, 4,
    ]);
  });
});
