import React from "react";
import { View, Text } from "react-native";
import { colors } from "../../theme/colors";



const BORDER = "rgba(190, 207, 227, 0.55)";

export default function AppTopBar({ name, position }) {
    
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            Szia, {name || "—"}!
          </Text>
          <Text style={styles.position} numberOfLines={1}>
            {position || "—"}
          </Text>
        </View>

        
      </View>

      <View style={styles.hairline} />
    </View>
  );
}

const styles = {
  wrap: {

    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primary500,
    letterSpacing: 0.2,
  },
  position: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary500,
  },

  streakPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(250, 83, 147, 0.22)",
    backgroundColor: "rgba(250, 83, 147, 0.10)",
  },
 
 
 

  hairline: {
    marginTop: 12,
    height: 1,
    backgroundColor: colors.primary50,
  },
};