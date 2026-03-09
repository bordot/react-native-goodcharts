import { useSharedValue } from "react-native-reanimated";
import type { ChartPanState } from "../types";

export const useChartPan = (): ChartPanState => ({
  translateX: useSharedValue(0),
  translateY: useSharedValue(0),
});
