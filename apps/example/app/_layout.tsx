import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ChartProvider } from "react-native-goodcharts";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ChartProvider theme="light">
        <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
          <Stack.Screen name="index" options={{ title: "Charts Gallery" }} />
          <Stack.Screen name="chart/[slug]" options={{ title: "Chart Demo" }} />
        </Stack>
      </ChartProvider>
    </GestureHandlerRootView>
  );
}
