import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { type CartesianViewport, LineChart } from "react-native-goodcharts";

const TOTAL_POINTS = 2000;
const DEFAULT_WINDOW = 160;
const LARGE_DATA = Array.from({ length: TOTAL_POINTS }, (_, index) => ({
  index,
  value:
    Math.sin(index / 18) * 18 +
    Math.cos(index / 45) * 9 +
    Math.sin(index / 120) * 25 +
    120,
}));

const latestViewport = (): CartesianViewport => ({
  startIndex: TOTAL_POINTS - DEFAULT_WINDOW,
  size: DEFAULT_WINDOW,
  overscan: 4,
});

export const LargeDatasetDemo = () => {
  const [viewport, setViewport] = useState<CartesianViewport>(() =>
    latestViewport(),
  );

  const currentStart = viewport.startIndex ?? 0;
  const currentSize = viewport.size ?? DEFAULT_WINDOW;
  const currentEnd = Math.min(TOTAL_POINTS, currentStart + currentSize);

  const summary = useMemo(
    () => ({
      currentStart,
      currentEnd,
      currentSize,
      density: (TOTAL_POINTS / currentSize).toFixed(1),
    }),
    [currentEnd, currentSize, currentStart],
  );

  return (
    <View style={{ gap: 16 }}>
      <LineChart
        data={LARGE_DATA}
        xKey="index"
        yKey="value"
        height={300}
        viewport={viewport}
        pannable
        zoomable
        interactionMode="navigate"
        minViewportPoints={24}
        maxViewportPoints={480}
        onViewportChange={setViewport}
      />

      <View
        style={{
          padding: 16,
          borderRadius: 24,
          backgroundColor: "#FFFFFF",
          gap: 12,
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
        }}
      >
        <View style={{ gap: 4 }}>
          <Text
            selectable
            style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}
          >
            Explicit navigation mode
          </Text>
          <Text selectable style={{ color: "#475569", lineHeight: 20 }}>
            This demo forces `interactionMode="navigate"`, so drag pans the
            visible window and pinch zooms it. Charts that also use crosshair or
            brush selection can stay in `auto` mode and reserve navigation for a
            two-finger gesture.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <Text
            selectable
            style={{ color: "#0F172A", fontVariant: ["tabular-nums"] }}
          >
            Window: {summary.currentStart} - {summary.currentEnd}
          </Text>
          <Text
            selectable
            style={{ color: "#0F172A", fontVariant: ["tabular-nums"] }}
          >
            Visible points: {summary.currentSize}
          </Text>
          <Text
            selectable
            style={{ color: "#0F172A", fontVariant: ["tabular-nums"] }}
          >
            Window compression: {summary.density}x
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <Pressable
            onPress={() => setViewport(latestViewport())}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "#DCFCE7",
            }}
          >
            <Text selectable style={{ color: "#166534", fontWeight: "700" }}>
              Reset to latest
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              setViewport((current) => ({
                ...current,
                size: Math.max(
                  24,
                  Math.round((current.size ?? DEFAULT_WINDOW) * 0.7),
                ),
              }))
            }
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "#DBEAFE",
            }}
          >
            <Text selectable style={{ color: "#1D4ED8", fontWeight: "700" }}>
              Zoom in
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              setViewport((current) => ({
                ...current,
                size: Math.min(
                  480,
                  Math.round((current.size ?? DEFAULT_WINDOW) * 1.35),
                ),
              }))
            }
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "#E0F2FE",
            }}
          >
            <Text selectable style={{ color: "#0369A1", fontWeight: "700" }}>
              Zoom out
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
