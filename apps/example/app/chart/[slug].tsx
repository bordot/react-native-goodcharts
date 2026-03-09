import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { type GallerySlug, gallery } from "../../src/data/gallery";

export default function ChartScreen() {
  const params = useLocalSearchParams<{ slug: GallerySlug }>();
  const entry = gallery[params.slug ?? "line"];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <Stack.Screen options={{ title: entry.title }} />
      <View style={{ gap: 8 }}>
        <Text
          selectable
          style={{ fontSize: 30, fontWeight: "800", color: "#0F172A" }}
        >
          {entry.title}
        </Text>
        <Text selectable style={{ color: "#475569", lineHeight: 22 }}>
          {entry.description}
        </Text>
      </View>
      {"detailRender" in entry && entry.detailRender
        ? entry.detailRender()
        : entry.render()}
    </ScrollView>
  );
}
