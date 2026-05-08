import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useAuth } from "../../../auth/AuthContext";
import { colors } from "../../../../theme/colors";
import ScreenShell from "../../../ui/ScreenShell";

export default function ReportsScreen({ navigation }) {
  const { user } = useAuth();
  const isLeader = !!user?.isLeader;

  const items = useMemo(() => {
    const base = [
      {
        id: "daily",
        title: "Napi monitorozás",
        description: "Napi kedv / napi kérdőív alap riportok (később chartok).",
        tone: "primary",
      },
      {
        id: "question_topics",
        title: "Témakör riportok",
        description:
          "Kitöltött kérdőív-kampányok saját, céges és magyar norma összehasonlítással.",
        tone: "primary",
      },
      {
        id: "activity",
        title: "Aktivitás",
        description: "App használat és aktivitás események (később grafikon).",
        tone: "primary",
        disabled: true,
      },
      {
        id: "q360",
        title: "360°",
        description: "360-as kérdőív riportok.",
        disabled: true,
        tone: "muted",
      },
    ];

    if (isLeader) {
      base.push({
        id: "leadership_overview",
        title: "Vezetői áttekintő",
        description: "Csapat átlagok, szórások, trendek.",
        disabled: true,
        tone: "muted",
      });
    }

    return base;
  }, [isLeader]);

  return (
    <ScreenShell streakDays={12}>
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <Text style={styles.h1}>Riportok</Text>
        <Text style={styles.sub}>
          Válassz egy modult. Hamarosan itt jönnek a chartok és a backend
          adatok.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {items.map((it) => {
          const disabled = !!it.disabled;

          return (
            <Pressable
              key={it.id}
              onPress={() => {
                if (disabled) return;
                navigation.navigate("ReportDetail", { reportId: it.id });
              }}
              style={({ pressed }) => [
                styles.card,
                disabled && styles.cardDisabled,
                pressed && !disabled && styles.cardPressed,
              ]}
            >
              <View style={styles.cardRow}>
                <View
                  style={[
                    styles.accentBar,
                    disabled ? styles.accentBarMuted : styles.accentBarActive,
                  ]}
                />

                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{it.title}</Text>

                    {disabled ? (
                      <View style={styles.pill}>
                        <Text style={styles.pillText}>Hamarosan</Text>
                      </View>
                    ) : (
                      <View style={[styles.pill, styles.pillOpen]}>
                        <Text style={[styles.pillText, styles.pillTextOpen]}>
                          Aktív
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardDesc}>{it.description}</Text>

                  <Text style={styles.cardCta}>
                    {disabled ? "Később elérhető" : "Megnyitás →"}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
    </ScreenShell>
  );
}

const styles = {
  page: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
   
  },

  header: {
    gap: 6,
  },
  h1: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textDark,
    letterSpacing: 0.2,
  },
  sub: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(53, 79, 110, 0.75)",
    lineHeight: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textDark,
    flex: 1,
  },
  cardDesc: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(53, 79, 110, 0.75)",
    lineHeight: 16,
  },

  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    backgroundColor: "rgba(255,255,255,0.96)",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardDisabled: {
    opacity: 0.55,
  },

  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  accentBar: {
    width: 6,
    borderRadius: 999,
  },
  accentBarActive: {
    backgroundColor: colors.accent300,
  },
  accentBarMuted: {
    backgroundColor: "rgba(190, 207, 227, 0.9)",
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  cardCta: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "900",
    color: colors.accent300,
  },

  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.70)",
    backgroundColor: "rgba(190, 207, 227, 0.18)",
  },
  pillOpen: {
    borderColor: "rgba(250, 83, 147, 0.28)",
    backgroundColor: "rgba(250, 83, 147, 0.10)",
  },
  pillText: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(53, 79, 110, 0.85)",
  },
  pillTextOpen: {
    color: "rgba(250, 83, 147, 0.92)",
  },
};
