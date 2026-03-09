import type { ForwardedRef, RefObject } from "react";
import { useImperativeHandle, useMemo, useRef } from "react";
import type { View } from "react-native";
import type { ChartRef } from "../types";
import { createChartRefMethods } from "./chart-ref";

export const useChartExportViewRef = (
  ref: ForwardedRef<ChartRef>,
  svg: string,
): RefObject<View> => {
  const containerRef = useRef<View>(null);
  const chartRefMethods = useMemo(
    () =>
      createChartRefMethods(svg, {
        viewRef: containerRef as RefObject<unknown>,
      }),
    [svg],
  );

  useImperativeHandle(ref, () => chartRefMethods, [chartRefMethods]);

  return containerRef;
};
