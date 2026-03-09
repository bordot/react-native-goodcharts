import type { PropsWithChildren } from "react";
import { Pressable, Text, View } from "react-native";

export const GalleryCard = ({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) => (
  <Pressable
    style={{
      padding: 18,
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
        {title}
      </Text>
      <Text selectable style={{ color: "#475569", lineHeight: 20 }}>
        {description}
      </Text>
    </View>
    {children}
  </Pressable>
);
