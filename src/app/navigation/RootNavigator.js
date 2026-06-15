import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../auth/AuthContext";
import LoginScreen from "../features/auth/screens/LoginScreen";
import AppTabs from "./AppTabs";
import { colors } from "../../theme/colors";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isBooting, isAuthenticated, tenantAppAccessEnabled, user, changePassword } =
    useAuth();

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
      {isAuthenticated && user?.mustChangePassword ? (
        <ForcedPasswordModal onSubmit={changePassword} />
      ) : null}
    </View>
  );
}

function ForcedPasswordModal({ onSubmit }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (newPassword.length < 8) {
      setError("Az uj jelszo legalabb 8 karakter legyen.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("A ket jelszo nem egyezik.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ newPassword });
    } catch (e) {
      setError(e?.message ?? "Nem sikerult beallitani a jelszot.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.passwordWall} pointerEvents="auto">
      <View style={styles.passwordCard}>
        <Text style={styles.passwordTitle}>Állitsd be a jelszavad</Text>
        <Text style={styles.passwordText}>
          Az első belépéshez adj meg egy saját jelszót. Ezt kesőbb a fiók
          beállitasainal is modositani tudod.
        </Text>

        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="új jelszó"
          placeholderTextColor="rgba(74, 93, 122, 0.45)"
          secureTextEntry
          autoCapitalize="none"
          style={styles.passwordInput}
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="új jelszó még egyszer"
          placeholderTextColor="rgba(74, 93, 122, 0.45)"
          secureTextEntry
          autoCapitalize="none"
          style={styles.passwordInput}
        />

        {error ? <Text style={styles.passwordError}>{error}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={saving}
          style={({ pressed }) => [
            styles.passwordButton,
            (saving || pressed) && styles.passwordButtonPressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.passwordButtonText}>Jelszo beallitasa</Text>
          )}
        </Pressable>
      </View>
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
  passwordWall: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
    backgroundColor: "rgba(245, 249, 253, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  passwordCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    padding: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.72)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  passwordTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    color: "rgba(18, 34, 56, 0.92)",
  },
  passwordText: {
    marginTop: 8,
    marginBottom: 14,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    color: colors.textLight,
  },
  passwordInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.70)",
    backgroundColor: "rgba(80, 126, 179, 0.06)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(18, 34, 56, 0.92)",
  },
  passwordError: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: colors.accent700,
  },
  passwordButton: {
    marginTop: 16,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent500,
  },
  passwordButtonPressed: {
    opacity: 0.72,
  },
  passwordButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
});
