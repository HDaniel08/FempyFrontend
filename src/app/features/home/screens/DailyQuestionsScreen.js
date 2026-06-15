import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Pressable,
  Dimensions,
} from "react-native";

import { apiFetch } from "../../../shared/api/http.js";
import { colors } from "../../../../theme/colors.js";
import SingleDailyQuestionCard from "./components/dailyQuestions/SingleDailyQuestionCard.js";
import { useNavigation } from "@react-navigation/native";
import ScreenShell from "../../../ui/ScreenShell.js";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DailyQuestionsScreen() {
  const navigation = useNavigation();

  const [allQuestions, setAllQuestions] = useState([]);
  const [displayedQuestion, setDisplayedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const totalCount = allQuestions.length;
  const currentIndex = displayedQuestion
    ? allQuestions.findIndex((q) => q.id === displayedQuestion.id)
    : -1;

  const currentStep = currentIndex >= 0 ? currentIndex + 1 : 0;
  const remainingCount = currentIndex >= 0 ? totalCount - currentIndex : 0;

  const loadQuestions = async () => {
    try {
      const res = await apiFetch("/daily-questions/me/pending");
      const normalized = Array.isArray(res) ? res : [];
      setAllQuestions(normalized);
      setDisplayedQuestion(normalized[0] || null);
      slideAnim.setValue(0);
    } catch (err) {
      console.log("daily questions error:", err);
      Alert.alert("Hiba", "Nem sikerült lekérni a kérdéseket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const animateTo = (toValue, duration = 220) =>
    new Promise((resolve) => {
      Animated.timing(slideAnim, {
        toValue,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => resolve());
    });

  const handleSubmit = async (answerId, answer) => {
    if (submitting || !displayedQuestion) return;

    try {
      setSubmitting(true);

      await apiFetch("/daily-questions/me/submit", {
        method: "POST",
        body: {
          answerId,
          answer,
        },
        networkRetries: 2,
      });

      await animateTo(-SCREEN_WIDTH, 220);

      const nextQuestions = allQuestions.filter((q) => q.id !== answerId);
      const nextDisplayed = nextQuestions[0] || null;

      setAllQuestions(nextQuestions);
      setDisplayedQuestion(nextDisplayed);

      if (nextDisplayed) {
        slideAnim.setValue(SCREEN_WIDTH);
        await animateTo(0, 240);
      } else {
        slideAnim.setValue(0);
      }
    } catch (err) {
      console.log("submit error:", err);
      const isNetworkError =
        err instanceof TypeError &&
        /network request failed|failed to fetch|load failed/i.test(
          String(err?.message),
        );
      Alert.alert(
        "Hiba",
        isNetworkError
          ? "A hálózati kapcsolat megszakadt. Ellenőrizd az internetkapcsolatot, majd próbáld újra."
          : err?.message || "Nem sikerült elküldeni a választ.",
      );
      await animateTo(0, 180);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenShell>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={colors.accent500} />
          <Text style={styles.helperText}>Kérdések betöltése...</Text>
        </View>
      </ScreenShell>
    );
  }

  if (!displayedQuestion) {
    return (
      <ScreenShell>
        <View style={styles.centerWrap}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nincs kitöltendő kérdésed</Text>
            <Text style={styles.emptyText}>
              Jelenleg nincs aktív napi kérdőív. Ha érkezik új kérdés, itt fog
              megjelenni.
            </Text>

            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Vissza a főoldalra</Text>
            </Pressable>
          </View>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Napi kérdőív</Text>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {currentStep} / {totalCount}
          </Text>
          <Text style={styles.remainingText}>
            Hátralévő kérdések: {remainingCount}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.cardWrap,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
          key={displayedQuestion.id}
        >
          <SingleDailyQuestionCard
            question={displayedQuestion}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </Animated.View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },

  header: {
    marginBottom: 12,
  },

  eyebrow: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.accent500,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  progressText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary700,
  },

  remainingText: {
    fontSize: 12,
    color: colors.textDark,
  },

  cardWrap: {
    flex: 1,
  },

  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  helperText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textDark,
  },

  emptyCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary700,
    marginBottom: 10,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 18,
  },

  backButton: {
    backgroundColor: colors.accent500,
    minHeight: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  backButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
