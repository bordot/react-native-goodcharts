import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { GalleryCard } from "../src/components/gallery-card";
import { gallery } from "../src/data/gallery";

export default function HomeScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <View style={{ gap: 8 }}>
        <Text
          selectable
          style={{ fontSize: 34, fontWeight: "800", color: "#0F172A" }}
        >
          react-native-goodcharts
        </Text>
        <Text
          selectable
          style={{ fontSize: 16, lineHeight: 24, color: "#475569" }}
        >
          GPU-accelerated charts for React Native, demonstrated through a
          gallery app that doubles as integration coverage.
        </Text>
      </View>
      {Object.entries(gallery).map(([slug, entry]) => (
        <Link
          key={slug}
          href={{ pathname: "/chart/[slug]", params: { slug } }}
          asChild
        >
          <View>
            <GalleryCard title={entry.title} description={entry.description}>
              {entry.render()}
            </GalleryCard>
          </View>
        </Link>
      ))}
    </ScrollView>
  );
}
