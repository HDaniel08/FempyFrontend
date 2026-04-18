import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { colors } from "../../../../../../theme/colors";

export default function SingleDailyQuestionCard({
  question,
  onSubmit,
  submitting,
}) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
  }, [question?.id]);

  const topic = question?.question?.topic || "";
  const questionText = question?.question?.question || "";

  const options = useMemo(() => {
    return Array.isArray(question?.question?.answerOptions)
      ? question.question.answerOptions
      : [];
  }, [question]);

  const sentOnLabel = useMemo(() => {
    if (!question?.sentOn) return "";
    try {
      return new Date(question.sentOn).toLocaleDateString("hu-HU");
    } catch (e) {
      return question.sentOn;
    }
  }, [question]);

  const handlePressSubmit = async () => {
    if (!selected || submitting) return;
    await onSubmit(question.id, selected);
  };

  return (
    <View style={styles.card}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topMetaRow}>
          <View style={styles.topicBadge}>
            <Text style={styles.topicBadgeText}>{topic}</Text>
          </View>

          {!!sentOnLabel && <Text style={styles.dateText}>{sentOnLabel}</Text>}
        </View>

        <Text style={styles.questionText}>{questionText}</Text>

        <View style={styles.optionsWrap}>
          {options.map((option) => {
            const isSelected = selected === option;

            return (
              <Pressable
                key={option}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => setSelected(option)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>

                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.submitButton,
            (!selected || submitting) && styles.submitButtonDisabled,
          ]}
          disabled={!selected || submitting}
          onPress={handlePressSubmit}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Válasz beküldése</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  scrollContent: {
    paddingBottom: 12,
  },

  topMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },

  topicBadge: {
    backgroundColor: colors.primary100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  topicBadgeText: {
    color: colors.primary700,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  dateText: {
    fontSize: 11,
    color: colors.textDark,
  },

  questionText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: colors.primary700,
    marginBottom: 16,
  },

  optionsWrap: {
    gap: 8,
  },

  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary100,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  optionButtonSelected: {
    backgroundColor: colors.accent100 + "12",
    borderColor: colors.accent300,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary300,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: colors.white,
  },

  radioOuterSelected: {
    borderColor: colors.accent500,
  },

  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent500,
  },

  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textLight,
    fontWeight: "500",
  },

  optionTextSelected: {
    color: colors.primary700,
    fontWeight: "700",
  },

  footer: {
    paddingTop: 10,
    paddingBottom: 20,
  },

  submitButton: {
    backgroundColor: colors.accent500,
    borderRadius: 16,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});