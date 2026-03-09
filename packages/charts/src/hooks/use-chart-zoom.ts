import { useSharedValue } from "react-native-reanimated";
import type { ChartZoomState } from "../types";

export const useChartZoom = (): ChartZoomState => ({
  scaleX: useSharedValue(1),
  scaleY: useSharedValue(1),
});
