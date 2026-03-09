import { Text, View } from "react-native";
import { useChartData } from "../hooks/use-chart-data";
import { useChartTheme } from "../hooks/use-chart-theme";

export const YAxis = () => {
  const state = useChartData<Record<string, unknown>>();
  const theme = useChartTheme();

  if (!state) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, bottom: 24, left: 0, width: 44 }}
    >
      {state.yTicks.map((tick) => (
        <Text
          key={`${tick.label}-${tick.position}`}
          selectable
          style={{
            position: "absolute",
            top: tick.position - 8,
            color: theme.axisLabelColor,
            fontSize: theme.axisLabelSize,
            width: 40,
            textAlign: "right",
          }}
        >
          {tick.label}
        </Text>
      ))}
    </View>
  );
};
