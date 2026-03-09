import type { PropsWithChildren } from "react";
import { ThemeContext } from "../core/chart-context";
import { createTheme, darkTheme, lightTheme } from "../core/theme";
import type { ChartTheme } from "../types";

export interface ChartProviderProps extends PropsWithChildren {
  theme?: "light" | "dark" | "auto" | Partial<ChartTheme>;
}

export const ChartProvider = ({
  children,
  theme = "light",
}: ChartProviderProps) => {
  const resolvedTheme =
    theme === "dark"
      ? darkTheme
      : theme === "auto"
        ? lightTheme
        : theme === "light"
          ? lightTheme
          : createTheme(theme);

  return (
    <ThemeContext.Provider value={resolvedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};
