import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { colors } from "../../../../theme/colors";
import ScreenShell from "../../../ui/ScreenShell";
import DailyMoodChartCard from "./components/DailyMoodChartCard";
import DailyQuestionTopicReports from "./components/DailyQuestionTopicReports";

export default function ReportDetailScreen({ route }) {
  const reportId = route?.params?.reportId;

  const meta = useMemo(() => {
    switch (reportId) {
      case "daily":
        return {
          title: "Napi monitorozás",
          subtitle: "Napi trendek és állapotok.",
        };
      case "question_topics":
        return {
          title: "Témakör riportok",
          subtitle: "Kampányok utáni kérdésenkénti összehasonlítás.",
        };
      case "activity":
        return {
          title: "Aktivitás",
          subtitle: "App-használat és események pozíciók szerint.",
        };
      case "q360":
        return {
          title: "360°",
          subtitle: "Visszajelzések és összesítők (később).",
        };
      default:
        return { title: "Riport", subtitle: "Riport részletek." };
    }
  }, [reportId]);

  return (
    <ScreenShell>
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.h1}>{meta.title}</Text>
        <Text style={styles.sub}>{meta.subtitle}</Text>

       
      </View>

 

    {reportId === "daily" && (
 
    <DailyMoodChartCard />

)}

      {reportId === "question_topics" && <DailyQuestionTopicReports />}

      {reportId === "activity" && (
        <Section title="Következő lépés">
          <Text style={styles.bodyText}>
            Backend endpoint: activity események aggregálva napokra +
            pozíciókra.
          </Text>
        </Section>
      )}
    </ScrollView>
    </ScreenShell>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = {
  page: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
   
  },

  hero: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(227, 226, 226, 0.22)", // <-- magenta border
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 8,
  },
  h1: {
    fontSize: 22,
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

  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.accent300,
  },
  metaKey: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(53, 79, 110, 0.80)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.accent300,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.accent300, // <-- magenta section title
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  bodyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(53, 79, 110, 0.82)",
    lineHeight: 18,
  },
};
