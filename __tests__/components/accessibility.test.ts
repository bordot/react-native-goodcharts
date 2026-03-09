import { buildAccessibilityLabel } from "react-native-goodcharts/utils/accessibility";

describe("accessibility summary", () => {
  it("summarizes a simple chart", () => {
    const label = buildAccessibilityLabel(
      "Line chart",
      {
        data: [
          { month: "Jan", value: 10 },
          { month: "Feb", value: 14 },
        ],
        height: 100,
      },
      (datum) => datum.value,
      (datum) => datum.month,
    );

    expect(label).toContain("Line chart");
    expect(label).toContain("Minimum 10");
  });
});
