import { Text, View } from "react-native";
import { useChartData } from "../hooks/use-chart-data";
import { useChartTheme } from "../hooks/use-chart-theme";

export const XAxis = () => {
  const state = useChartData<Record<string, unknown>>();
  const theme = useChartTheme();

  if (!state) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 0, right: 0, bottom: 6, height: 24 }}
    >
      {state.xTicks.map((tick) => (
        <Text
          key={`${tick.label}-${tick.position}`}
          selectable
          style={{
            position: "absolute",
            left: tick.position - 16,
            color: theme.axisLabelColor,
            fontSize: theme.axisLabelSize,
            width: 48,
            textAlign: "center",
          }}
        >
          {tick.label}
        </Text>
      ))}
    </View>
  );
};
