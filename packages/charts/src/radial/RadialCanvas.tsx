import { Canvas, useCanvasRef } from "@shopify/react-native-skia";
import type { ForwardedRef, ReactNode } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { View, useWindowDimensions } from "react-native";
import { createChartRefMethods } from "../core/chart-ref";
import type { ChartRef } from "../types";

interface RadialCanvasProps {
  width?: number;
  height: number;
  children: (center: { x: number; y: number; radius: number }) => ReactNode;
}

function RadialCanvasInner(
  props: RadialCanvasProps,
  ref: ForwardedRef<ChartRef>,
) {
  const window = useWindowDimensions();
  const width = props.width ?? Math.min(window.width - 24, 480);
  const radius = Math.max(0, Math.min(width, props.height) / 2 - 18);
  const canvasRef = useCanvasRef();

  useImperativeHandle(
    ref,
    () =>
      createChartRefMethods("<svg><!-- radial-chart --></svg>", {
        canvasRef,
      }),
    [canvasRef],
  );

  return (
    <View style={{ width, height: props.height }}>
      <Canvas ref={canvasRef} style={{ width, height: props.height }}>
        {props.children({ x: width / 2, y: props.height / 2, radius })}
      </Canvas>
    </View>
  );
}

export const RadialCanvas = forwardRef(RadialCanvasInner);
