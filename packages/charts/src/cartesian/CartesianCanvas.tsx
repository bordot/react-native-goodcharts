import { Canvas, useCanvasRef } from "@shopify/react-native-skia";
import type { ForwardedRef, ReactElement, ReactNode } from "react";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { CartesianContext } from "../core/chart-context";
import { createChartRefMethods } from "../core/chart-ref";
import { createCartesianState } from "../core/data";
import { createBounds } from "../core/layout";
import { resolveTheme } from "../core/theme";
import { useChartTheme } from "../hooks/use-chart-theme";
import type {
  CartesianChartProps,
  CartesianChartState,
  ChartRef,
} from "../types";

interface CartesianCanvasProps<T extends Record<string, unknown>>
  extends CartesianChartProps<T> {
  children: (state: CartesianChartState<T>) => ReactNode;
}

function CartesianCanvasInner<T extends Record<string, unknown>>(
  props: CartesianCanvasProps<T>,
  ref: ForwardedRef<ChartRef>,
) {
  const inheritedTheme = useChartTheme();
  const resolvedTheme = resolveTheme(props.theme, inheritedTheme);
  const window = useWindowDimensions();
  const width = props.width ?? Math.min(window.width - 24, 720);
  const bounds = useMemo(
    () => createBounds(width, props.height, props.padding),
    [width, props.height, props.padding],
  );
  const colors = props.colors ?? [
    props.color ?? resolvedTheme.colors[0],
    ...resolvedTheme.colors.slice(1),
  ];
  const state = useMemo(
    () => createCartesianState(props, bounds, colors),
    [props, bounds, colors],
  );
  const canvasRef = useCanvasRef();

  useImperativeHandle(
    ref,
    () =>
      createChartRefMethods("<svg><!-- cartesian-chart --></svg>", {
        canvasRef,
      }),
    [canvasRef],
  );

  return (
    <CartesianContext.Provider
      value={state as CartesianChartState<Record<string, unknown>>}
    >
      <View style={{ width, height: props.height, position: "relative" }}>
        <Canvas ref={canvasRef} style={{ width, height: props.height }}>
          {props.children(state)}
        </Canvas>
      </View>
    </CartesianContext.Provider>
  );
}

export const CartesianCanvas = forwardRef(CartesianCanvasInner) as <
  T extends Record<string, unknown>,
>(
  props: CartesianCanvasProps<T> & { ref?: ForwardedRef<ChartRef> },
) => ReactElement;
