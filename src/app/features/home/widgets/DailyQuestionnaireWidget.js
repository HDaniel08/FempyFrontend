import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import WidgetCard from "./WidgetCard";
import { colors } from "../../../../theme/colors";
import Chip from "../../../ui/Chip";
import Button from "../../../ui/Button";
import { apiFetch } from "../../../shared/api/http.js";

export default function DailyQuestionnaireWidget({ navigation }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [oldestQuestion, setOldestQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPending = async () => {
    try {
      const res = await apiFetch("/daily-questions/me/pending");
      const pending = Array.isArray(res) ? res : [];

      setPendingCount(pending.length);
      setOldestQuestion(pending[0] || null);
    } catch (error) {
      console.log("daily questionnaire widget error:", error);
      setPendingCount(0);
      setOldestQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPending();
    }, [])
  );

  const isDone = pendingCount === 0;

  const handleOpen = () => {
    navigation.navigate("DailyQuestions");
  };

  const description = loading
    ? "Kérdőívek betöltése..."
    : isDone
    ? "Jelenleg nincs nyitott napi kérdésed."
    : pendingCount === 1
    ? "1 kérdés vár a válaszodra."
    : `${pendingCount} kérdés vár a válaszodra.`;

  const topicLabel =
    !loading && oldestQuestion?.question?.topic
      ? String(oldestQuestion.question.topic)
      : null;

  return (
    <WidgetCard>
      <Header
        title="Napi kérdőív"
        right={
          <Chip
            label={loading ? "..." : isDone ? "Kész" : `${pendingCount} nyitott`}
            variant={isDone ? "success" : "accent"}
          />
        }
      />

      <Text style={{ marginTop: 8, color: colors.textLight }}>
        {description}
      </Text>

      {!!topicLabel && !loading && !isDone ? (
        <Text
          style={{
            marginTop: 8,
            color: colors.textDark,
            fontWeight: "700",
          }}
        >
          Következő téma: {topicLabel}
        </Text>
      ) : null}

      <View style={{ marginTop: 14 }}>
        {loading ? (
          <View
            style={{
              minHeight: 42,
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <ActivityIndicator color={colors.accent500} />
          </View>
        ) : (
          <Button
            label={isDone ? "Megnyitás" : "Kitöltés"}
            onPress={handleOpen}
            variant={isDone ? "secondary" : "primary"}
          />
        )}
      </View>
    </WidgetCard>
  );
}

function Header({ title, right }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: colors.textDark,
        }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}