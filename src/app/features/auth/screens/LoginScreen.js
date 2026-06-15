import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Animated,
  Easing,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../auth/AuthContext";
import { colors } from "../../../../theme/colors";
import { apiFetch } from "../../../shared/api/http";

export default function LoginScreen() {
  const { loginGlobal } = useAuth();
  //LOGIN demo@demo.hu pass1234
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  // UI phase:
  // "opening" -> card opens on mount
  // "idle" -> normal form
  // "loading" -> card collapsed + fake progress running
  const [phase, setPhase] = useState("opening");
  const [statusText, setStatusText] = useState("");

  const styles = useMemo(() => createStyles(), []);

  // ----- Card animation -----
  // Height anim (native driver off), but looks clean and controllable.
  const COLLAPSED_H = 150; // logo-only card height
  const EXPANDED_H = 470; // full form card height (adjust if needed)

  const cardH = useRef(new Animated.Value(COLLAPSED_H)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(8)).current;

  // ----- Fake progress -----
  const progress = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // Prevent double press
  const busyRef = useRef(false);

  function getErrorText(e) {
    const msg = e?.data?.message || e?.message || "Ismeretlen hiba";
    if (Array.isArray(msg)) return msg.join("\n");
    return String(msg);
  }

  useEffect(() => {
    // Open animation on mount
    Animated.parallel([
      Animated.timing(cardH, {
        toValue: EXPANDED_H,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 420,
        delay: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 520,
        delay: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setPhase("idle"));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function animateToCollapsed() {
    // Hide content + collapse card
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 8,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardH, {
        toValue: COLLAPSED_H,
        duration: 420,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }

  function animateToExpanded() {
    Animated.parallel([
      Animated.timing(cardH, {
        toValue: EXPANDED_H,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 320,
        delay: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 420,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setPhase("idle"));
  }

  function animateProgressTo(toValue, duration, easing) {
    return new Promise((resolve) => {
      Animated.timing(progress, {
        toValue,
        duration,
        easing,
        useNativeDriver: false,
      }).start(resolve);
    });
  }

  async function runPostLoginProgress() {
    progress.stopAnimation();
    setStatusText("Sikeres bejelentkezés");
    await animateProgressTo(0.42, 220, Easing.out(Easing.quad));

    const steps = [
      { value: 0.58, text: "Jogosultságok betöltése…" },
      { value: 0.74, text: "Profil inicializálása…" },
      { value: 0.9, text: "Felület előkészítése…" },
      { value: 1, text: "Befejezés…" },
    ];

    for (const step of steps) {
      setStatusText(step.text);
      await animateProgressTo(step.value, 420, Easing.inOut(Easing.cubic));
    }
  }

  async function runLoginProgress() {
    setStatusText("Bejelentkezési adatok ellenőrzése…");
    progress.setValue(0);
    progressOpacity.setValue(0);

    Animated.timing(progressOpacity, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // A kérés ideje alatt az első szakasz halad, de nem futhat a sikerpont fölé.
    Animated.timing(progress, {
      toValue: 0.35,
      duration: 8000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    try {
      await loginGlobal({
        email: email.trim(),
        password,
        onAuthenticated: runPostLoginProgress,
      });
    } catch (e) {
      progress.stopAnimation();
      Alert.alert("Sikertelen bejelentkezés", getErrorText(e));
      Animated.timing(progressOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setStatusText("");
        progress.setValue(0);
      });
      animateToExpanded();
    } finally {
      busyRef.current = false;
    }
  }
  async function connectionTest(){
     apiFetch("/health", {
      method: "GET",
      skipTenant: true,
    });

    const data = await res.json();
    console.log(data)
  } 
  async function onLoginPress() {
  
    if (busyRef.current) return;
    if (phase !== "idle") return;

    if (email.trim().length <= 3 || password.length === 0) return;

    busyRef.current = true;
    setPhase("loading");

    // collapse card to logo-only
    animateToCollapsed();

    // Valós API-válaszra váró szakasz, majd siker esetén előkészítési animáció.
    runLoginProgress();
  }

  async function onForgotPasswordPress() {
    if (resetBusy || phase !== "idle") return;

    const normalizedEmail = email.trim();
    if (normalizedEmail.length <= 3 || !normalizedEmail.includes("@")) {
      Alert.alert(
        "Email cím szükséges",
        "Add meg a fiókodhoz tartozó érvényes email címet.",
      );
      return;
    }

    setResetBusy(true);
    Keyboard.dismiss();
    try {
      const result = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: { email: normalizedEmail },
        skipTenant: true,
      });
      Alert.alert(
        "Kérés elküldve",
        result?.message ??
          "Ha az email címhez tartozik aktív fiók, elküldtük az ideiglenes jelszót.",
        [
          {
            text: "Rendben",
            onPress: () => setIsForgotPassword(false),
          },
        ],
      );
    } catch (e) {
      Alert.alert("Nem sikerült elküldeni", getErrorText(e));
    } finally {
      setResetBusy(false);
    }
  }

  const canSubmit =
    phase === "idle" && email.trim().length > 3 && password.length > 0;

  const fillW = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient
          colors={[colors.primary100, colors.primary50, colors.white]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.centerWrap}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* Animated card with controlled height */}
            <Animated.View style={[styles.card, { height: cardH }]}>
            {/* Logo always visible */}
            <Image
              source={require("../../../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* The content is clipped by card height */}
            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslate }],
              }}
            >
              <View style={styles.header}>
                <Text style={styles.title}>
                  {isForgotPassword ? "Elfelejtett jelszó" : "Bejelentkezés"}
                </Text>
                <Text style={styles.subtitle}>
                  {isForgotPassword
                    ? "Ideiglenes jelszót küldünk emailben"
                    : "Add meg az adataid a folytatáshoz"}
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  editable={phase === "idle"}
                  returnKeyType="next"
                />
              </View>

              {isForgotPassword ? (
                <>
                  <Text style={styles.resetHint}>
                    A levélben kapott 8 karakteres jelszóval jelentkezz be.
                    Ezután kötelezően be kell állítanod egy új jelszót.
                  </Text>
                  <Pressable
                    onPress={onForgotPasswordPress}
                    disabled={resetBusy}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      resetBusy && styles.primaryBtnDisabled,
                      pressed && !resetBusy && styles.primaryBtnPressed,
                    ]}
                  >
                    {resetBusy ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.primaryBtnText}>
                        Ideiglenes jelszó küldése
                      </Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => setIsForgotPassword(false)}
                    disabled={resetBusy}
                    style={styles.linkButton}
                  >
                    <Text style={styles.linkButtonText}>
                      Vissza a bejelentkezéshez
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>Jelszó</Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Jelszó"
                      placeholderTextColor={colors.textLight}
                      secureTextEntry
                      style={styles.input}
                      editable={phase === "idle"}
                      returnKeyType="done"
                      onSubmitEditing={onLoginPress}
                    />
                  </View>

                  <Pressable
                    onPress={onLoginPress}
                    disabled={!canSubmit}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      !canSubmit && styles.primaryBtnDisabled,
                      pressed && canSubmit && styles.primaryBtnPressed,
                    ]}
                  >
                    {phase === "loading" ? (
                      <ActivityIndicator />
                    ) : (
                      <Text style={styles.primaryBtnText}>Belépés</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => setIsForgotPassword(true)}
                    style={styles.linkButton}
                  >
                    <Text style={styles.linkButtonText}>
                      Elfelejtetted a jelszavad?
                    </Text>
                  </Pressable>
                </>
              )}
            </Animated.View>
            </Animated.View>

            {/* Fake progress shown UNDER the collapsed card */}
            <Animated.View
              style={[styles.progressWrap, { opacity: progressOpacity }]}
            >
              <Text style={styles.progressText}>{statusText}</Text>
              <View style={styles.pbTrack}>
                <Animated.View style={[styles.pbFill, { width: fillW }]} />
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function createStyles() {
  return StyleSheet.create({
    screen: { flex: 1 },

    centerWrap: {
      flexGrow: 1,
      paddingHorizontal: 18,
      paddingVertical: 24,
      justifyContent: "center",
    },

    card: {
      backgroundColor: colors.white,
      borderRadius: 18,
      padding: 16,
      gap: 14,
      overflow: "hidden", // important for the “fold down/up” effect

      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,

      borderWidth: 1,
      borderColor: colors.primary75,
    },

    logo: {
      width: 300,
      height: 120,
      alignSelf: "center",
      marginBottom: 6,
      opacity: 0.98,
    },

    header: {
      marginBottom: 2,
      alignItems: "center",
      gap: 2,
    },

    title: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textDark,
    },

    subtitle: {
      fontSize: 13,
      color: colors.textLight,
      textAlign: "center",
    },

    field: { gap: 6 },

    label: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textDark,
      opacity: 0.75,
      marginTop: 5,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.primary200,
      backgroundColor: colors.primary50,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === "ios" ? 12 : 10,
      fontSize: 15,
      color: colors.textDark,
    },

    primaryBtn: {
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent500,
      marginTop: 15,
    },

    primaryBtnPressed: {
      transform: [{ scale: 0.99 }],
      opacity: 0.95,
    },

    primaryBtnDisabled: {
      backgroundColor: colors.accent300,
      opacity: 0.7,
    },

    primaryBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "900",
    },

    resetHint: {
      marginTop: 10,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textLight,
      textAlign: "center",
    },

    linkButton: {
      minHeight: 40,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },

    linkButtonText: {
      color: colors.accent700,
      fontSize: 13,
      fontWeight: "800",
      textAlign: "center",
    },

    // --- Fake progress UI (under card) ---
    progressWrap: {
      marginTop: 14,
      alignItems: "center",
      gap: 10,
    },

    progressText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textLight,
      textAlign: "center",
    },

    // keret nélküli sáv (csak track + fill)
    pbTrack: {
      width: "100%",
      height: 6,
      borderRadius: 999,
      backgroundColor: colors.primary200,
      overflow: "hidden",
    },
    pbFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.accent500,
    },
  });
}
