import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { resolveTheme } from "./core/theme";
import { useChartTheme } from "./hooks/use-chart-theme";
import type { BaseChartProps } from "./types";

interface ChartProps<T> extends PropsWithChildren {
  height: number;
  width: number;
  theme?: BaseChartProps<T>["theme"];
  accessibilityLabel?: string;
  testID?: string;
}

export const Chart = <T,>({
  children,
  height,
  width,
  theme,
  accessibilityLabel,
  testID,
}: ChartProps<T>) => {
  const inherited = useChartTheme();
  const resolved = resolveTheme(theme, inherited);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={{
        width,
        height,
        backgroundColor: resolved.backgroundColor,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
};
