import { useCartesianContext } from "../core/chart-context";

export const useChartData = <T extends Record<string, unknown>>() =>
  useCartesianContext<T>();
