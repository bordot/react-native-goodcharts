import { createContext, useContext } from "react";
import type { CartesianChartState, ChartTheme } from "../types";
import { lightTheme } from "./theme";

export const ThemeContext = createContext<ChartTheme>(lightTheme);
export const CartesianContext = createContext<CartesianChartState<
  Record<string, unknown>
> | null>(null);

export const useThemeContext = () => useContext(ThemeContext);
export const useCartesianContext = <T extends Record<string, unknown>>() =>
  useContext(CartesianContext) as CartesianChartState<T> | null;
