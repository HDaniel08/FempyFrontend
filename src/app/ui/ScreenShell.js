import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppTopBar from "./AppTopBar";
import { useAuth } from "../auth/AuthContext"; // igazítsd
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";

export default function ScreenShell({ children, streakDays = 0 }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();


  const name =
  (user?.profile?.nickname && user.profile.nickname.trim().length > 0
    ? user.profile.nickname.trim()
    : null) ||
  (
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`
      .trim()
  ) ||
  "—";

  // állítsd rá arra a mezőre, ami nálad a pozíció neve:
  const position =
  user?.pozicio_nev ||
  user?.positionName ||
  user?.position?.name ||   // <-- ha objektum, innen vegyük a nevet
  user?.position?.pozicio_nev ||
  (typeof user?.position === "string" ? user.position : null) ||
  "—";

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
        <LinearGradient
                    colors={[colors.primary100, colors.primary50, colors.white]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
      <AppTopBar name={name} position={position} streakDays={streakDays} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}