import { useSharedValue } from "react-native-reanimated";
import type { ChartPressState } from "../types";

export const useChartPress = (): ChartPressState => ({
  x: useSharedValue(0),
  y: useSharedValue(0),
  active: useSharedValue(0),
  index: useSharedValue(-1),
});
