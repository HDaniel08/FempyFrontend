import React from "react";
import { View } from "react-native";
import { colors } from "../../../../theme/colors";

/**
 * WidgetCard 2.0
 * - enterprise "surface": fehér kártya + finom shadow
 * - border nagyon light
 * - nagy radius (modern)
 */
export default function WidgetCard({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(190, 207, 227, 0.55)", // primary75 light
          // iOS shadow
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          // Android
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}