import React from "react";
import { View, Text } from "react-native";
import { colors } from "../../theme/colors";

/**
 * Enterprise jellegű kis státusz badge.
 * variant: "neutral" | "accent" | "success" | "warning"
 */
export default function Chip({ label, variant = "neutral" }) {
  const style = getVariantStyle(variant);

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: style.bg,
        borderWidth: 1,
        borderColor: style.border,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "800", color: style.text }}>
        {label}
      </Text>
    </View>
  );
}

function getVariantStyle(variant) {
  switch (variant) {
    case "accent":
      return { bg: "#fff0f6", border: colors.accent100, text: colors.accent700 };
    case "success":
      return { bg: "#ecfdf3", border: "#a6f4c5", text: "#027a48" };
    case "warning":
      return { bg: "#fffaeb", border: "#fedf89", text: "#b54708" };
    case "neutral":
    default:
      return { bg: colors.primary50, border: colors.primary75, text: colors.primary700 };
  }
}