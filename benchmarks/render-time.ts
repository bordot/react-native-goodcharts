import { benchmarkPathBuild } from "../packages/charts/src/benchmarking/benchmark-path";

const result = benchmarkPathBuild(1000);

console.log(
  JSON.stringify(
    {
      name: "path-build",
      points: result.points,
      durationMs: result.durationMs,
    },
    null,
    2,
  ),
);
