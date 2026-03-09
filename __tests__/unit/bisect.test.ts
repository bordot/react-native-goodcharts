import {
  findInteractionRangeDataIndices,
  findNearestInteractionPointIndex,
  findNearestPointIndex,
} from "react-native-goodcharts/utils/bisect";

describe("findNearestPointIndex", () => {
  it("returns the closest point index", () => {
    const points = [
      { x: 0, y: 0, value: 0, label: "a", index: 0, datum: {} },
      { x: 10, y: 0, value: 0, label: "b", index: 1, datum: {} },
      { x: 20, y: 0, value: 0, label: "c", index: 2, datum: {} },
    ];

    expect(findNearestPointIndex(points, 12)).toBe(1);
  });
});

describe("findNearestInteractionPointIndex", () => {
  it("returns the closest interaction point index in two dimensions", () => {
    const points = [
      { x: 0, y: 10, seriesIndex: 0, pointIndex: 0, dataIndex: 0 },
      { x: 20, y: 15, seriesIndex: 0, pointIndex: 1, dataIndex: 1 },
      { x: 25, y: 40, seriesIndex: 1, pointIndex: 0, dataIndex: 0 },
    ];

    expect(findNearestInteractionPointIndex(points, 22, 18)).toBe(1);
  });
});

describe("findInteractionRangeDataIndices", () => {
  it("returns unique data indices inside the range for a series", () => {
    const points = [
      { x: 0, y: 10, seriesIndex: 0, pointIndex: 0, dataIndex: 0 },
      { x: 10, y: 12, seriesIndex: 0, pointIndex: 1, dataIndex: 1 },
      { x: 20, y: 14, seriesIndex: 0, pointIndex: 2, dataIndex: 2 },
      { x: 10, y: 22, seriesIndex: 1, pointIndex: 0, dataIndex: 1 },
    ];

    expect(findInteractionRangeDataIndices(points, 5, 20)).toEqual([1, 2]);
  });
});
