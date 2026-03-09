import { benchmarkPathBuild } from "../../packages/charts/src/benchmarking/benchmark-path";

describe("benchmark harness", () => {
  it("returns a duration result", () => {
    const result = benchmarkPathBuild(250);
    expect(result.points).toBe(250);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});
