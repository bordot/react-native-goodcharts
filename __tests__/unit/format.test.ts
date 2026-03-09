import {
  formatLabelValue,
  formatNumber,
} from "react-native-goodcharts/utils/format";

describe("format helpers", () => {
  it("formats compact numbers", () => {
    expect(formatNumber(1250)).toBe("1.3k");
  });

  it("formats date labels", () => {
    expect(formatLabelValue(new Date("2026-03-09T00:00:00.000Z"))).toBe(
      "2026-03-09",
    );
  });
});
