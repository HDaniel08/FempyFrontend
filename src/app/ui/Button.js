import React from "react";
import { Pressable, Text } from "react-native";
import { colors } from "../../theme/colors";

/**
 * Egységes gomb stílus (enterprise baseline)
 * variant: "primary" | "secondary" | "ghost"
 */
export default function Button({ label, onPress, variant = "primary", disabled = false }) {
  const s = getVariantStyle(variant, disabled);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          paddingVertical: 12,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: s.borderWidth,
          borderColor: s.borderColor,
          backgroundColor: s.bg,
          opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
        },
      ]}
    >
      <Text style={{ color: s.text, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

function getVariantStyle(variant, disabled) {
  if (variant === "secondary") {
    return {
      bg: colors.white,
      text: disabled ? colors.primary300 : colors.primary700,
      borderWidth: 1,
      borderColor: colors.primary75,
    };
  }
  if (variant === "ghost") {
    return {
      bg: "transparent",
      text: disabled ? colors.primary300 : colors.primary700,
      borderWidth: 0,
      borderColor: "transparent",
    };
  }
  // primary
  return {
    bg: disabled ? colors.primary200 : colors.accent500,
    text: colors.white,
    borderWidth: 0,
    borderColor: "transparent",
  };
}