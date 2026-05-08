import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../auth/AuthContext";
import LoginScreen from "../features/auth/screens/LoginScreen";
import AppTabs from "./AppTabs";
import { colors } from "../../theme/colors";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isBooting, isAuthenticated, tenantAppAccessEnabled } = useAuth();

  const isAppAccessDisabled =
    isAuthenticated && tenantAppAccessEnabled === false;

  if (isBooting) return null;

  return (
    <View style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={LoginScreen} />
          ) : (
            <Stack.Screen name="App" component={AppTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {isAppAccessDisabled ? <TenantAccessWall /> : null}
    </View>
  );
}

function TenantAccessWall() {
  return (
    <View style={styles.wall} pointerEvents="auto">
      <View style={styles.wallCard}>
        <Text style={styles.wallTitle}>A tesztidőszak véget ért</Text>
        <Text style={styles.wallText}>
          Köszönjük, hogy kipróbáltad a Fempy appot. A szervezetedhez tartozó
          demó hozzáférés jelenleg szünetel, ezért az alkalmazás funkciói most
          nem használhatók.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  wall: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: "rgba(245, 249, 253, 0.78)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  wallCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.72)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  wallTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    color: colors.primary700,
    textAlign: "center",
  },
  wallText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    color: colors.textLight,
    textAlign: "center",
  },
});
