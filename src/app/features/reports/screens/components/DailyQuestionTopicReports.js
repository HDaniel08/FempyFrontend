import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { colors } from "../../../../../theme/colors";
import { apiFetch } from "../../../../shared/api/http";

const SCALE_WIDTH = 260;
const SCALE_TRACK_WIDTH = SCALE_WIDTH - 36;

const CP1252_SPECIAL_BYTES = {
  "€": 0x80,
  "‚": 0x82,
  "ƒ": 0x83,
  "„": 0x84,
  "…": 0x85,
  "†": 0x86,
  "‡": 0x87,
  "ˆ": 0x88,
  "‰": 0x89,
  "Š": 0x8a,
  "‹": 0x8b,
  "Œ": 0x8c,
  "Ž": 0x8e,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "•": 0x95,
  "–": 0x96,
  "—": 0x97,
  "˜": 0x98,
  "™": 0x99,
  "š": 0x9a,
  "›": 0x9b,
  "œ": 0x9c,
  "ž": 0x9e,
  "Ÿ": 0x9f,
};

function clamp(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(1, Math.min(5, value));
}

function decodeUtf8Bytes(bytes) {
  let output = "";

  for (let i = 0; i < bytes.length; i += 1) {
    const first = bytes[i];

    if (first < 0x80) {
      output += String.fromCharCode(first);
    } else if ((first & 0xe0) === 0xc0 && i + 1 < bytes.length) {
      const second = bytes[(i += 1)];
      output += String.fromCharCode(((first & 0x1f) << 6) | (second & 0x3f));
    } else if ((first & 0xf0) === 0xe0 && i + 2 < bytes.length) {
      const second = bytes[(i += 1)];
      const third = bytes[(i += 1)];
      output += String.fromCharCode(
        ((first & 0x0f) << 12) | ((second & 0x3f) << 6) | (third & 0x3f),
      );
    } else {
      output += String.fromCharCode(first);
    }
  }

  return output;
}

function fixEncoding(value) {
  if (typeof value !== "string" || !/[ÃÂÅ]/.test(value)) return value;

  const bytes = [];
  for (const char of value) {
    const code = char.charCodeAt(0);
    const byte = code <= 0xff ? code : CP1252_SPECIAL_BYTES[char];
    if (byte === undefined) return value;
    bytes.push(byte);
  }

  return decodeUtf8Bytes(bytes);
}

function formatPeriod(start, end) {
  if (!start || !end) return "";
  return `${start.replaceAll("-", ".")} - ${end.replaceAll("-", ".")}`;
}

function markerLeft(value) {
  const clamped = clamp(value);
  if (clamped === null) return null;
  return ((clamped - 1) / 4) * SCALE_TRACK_WIDTH;
}

function Marker({ value, color, label, lane }) {
  const left = markerLeft(value);
  if (left === null) return null;

  return (
    <View style={[styles.scaleMarker, { left, top: 16 + lane * 12 }]}>
      <View style={[styles.scaleMarkerDot, { backgroundColor: color }]} />
      <Text style={[styles.scaleMarkerLabel, { color }]}>{label}</Text>
    </View>
  );
}

function QuestionScale({ item }) {
  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{fixEncoding(item.question)}</Text>

      <View style={styles.scaleWrap}>
        <View style={styles.scaleTrack} />
        {[1, 2, 3, 4, 5].map((value) => {
          const left = markerLeft(value);
          return (
            <View key={value} style={[styles.scaleTickWrap, { left }]}>
              <Text style={styles.scaleTickLabel}>{value}</Text>
              <View style={styles.scaleTick} />
            </View>
          );
        })}

        <Marker value={item.hungarianNorm} color={colors.primary700} label="HU" lane={0} />
        <Marker value={item.tenantAverage} color="#7A5AF8" label="Cég" lane={1} />
        <Marker value={item.userValue} color={colors.accent500} label="Te" lane={2} />
      </View>

      <View style={styles.legendRow}>
        <LegendDot color={colors.accent500} label={`Te: ${item.userValue ?? "-"}`} />
        <LegendDot color="#7A5AF8" label={`Cég: ${item.tenantAverage ?? "-"}`} />
        <LegendDot color={colors.primary700} label={`HU norma: ${item.hungarianNorm ?? "-"}`} />
      </View>
    </View>
  );
}

function LegendDot({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function ReportCard({ report }) {
  return (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.reportTitle}>{fixEncoding(report.topicName)}</Text>
          <Text style={styles.reportPeriod}>
            {formatPeriod(report.periodStart, report.periodEnd)}
          </Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{report.questionCount} kérdés</Text>
        </View>
      </View>

      <Text style={styles.insight}>{fixEncoding(report.insight)}</Text>

      <View style={styles.avgRow}>
        <AvgItem label="Saját átlag" value={report.userAverage} />
        <AvgItem label="Céges átlag" value={report.tenantAverage} />
      </View>

      <View style={styles.questionList}>
        {report.questions.map((question) => (
          <QuestionScale key={question.questionId} item={question} />
        ))}
      </View>
    </View>
  );
}

function AvgItem({ label, value }) {
  return (
    <View style={styles.avgItem}>
      <Text style={styles.avgLabel}>{label}</Text>
      <Text style={styles.avgValue}>{value ?? "-"}</Text>
    </View>
  );
}

export default function DailyQuestionTopicReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/daily-questions/me/topic-reports");
      setReports(Array.isArray(response?.items) ? response.items : []);
    } catch (err) {
      setError(
        fixEncoding(err?.message) || "Nem sikerült betölteni a kérdőív riportokat.",
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const latestReport = useMemo(() => reports[0], [reports]);

  if (loading) {
    return (
      <View style={styles.stateCard}>
        <ActivityIndicator color={colors.accent500} />
        <Text style={styles.stateText}>Riportok betöltése...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>Betöltési hiba</Text>
        <Text style={styles.stateText}>{error}</Text>
        <Pressable onPress={loadReports} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Újrapróbálás</Text>
        </Pressable>
      </View>
    );
  }

  if (!reports.length) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>Még nincs kész kérdőív riport</Text>
        <Text style={styles.stateText}>
          Ha egy kampány témakörének minden kérdését kitöltötted, itt jelenik meg
          az összehasonlító kimutatás.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {latestReport && (
        <View style={styles.highlight}>
          <Text style={styles.highlightLabel}>Legfrissebb riport</Text>
          <Text style={styles.highlightTitle}>{fixEncoding(latestReport.topicName)}</Text>
          <Text style={styles.highlightText}>
            {formatPeriod(latestReport.periodStart, latestReport.periodEnd)}
          </Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.reportRow}>
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  wrap: {
    gap: 14,
  },
  highlight: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(250, 83, 147, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(250, 83, 147, 0.28)",
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.accent500,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  highlightTitle: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "900",
    color: colors.textDark,
  },
  highlightText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(53, 79, 110, 0.76)",
  },
  reportRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 4,
  },
  reportCard: {
    width: 320,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    backgroundColor: "rgba(255,255,255,0.96)",
    gap: 12,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textDark,
  },
  reportPeriod: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(53, 79, 110, 0.70)",
  },
  countPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: "rgba(80, 126, 179, 0.10)",
  },
  countPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.primary700,
  },
  insight: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "rgba(53, 79, 110, 0.80)",
  },
  avgRow: {
    flexDirection: "row",
    gap: 8,
  },
  avgItem: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary100,
    alignItems: "center",
  },
  avgLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textLight,
    textTransform: "uppercase",
  },
  avgValue: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "900",
    color: colors.accent500,
  },
  questionList: {
    gap: 10,
  },
  questionCard: {
    borderRadius: 14,
    padding: 10,
    backgroundColor: "rgba(80, 126, 179, 0.045)",
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    alignItems: "center",
  },
  questionText: {
    alignSelf: "stretch",
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    color: colors.textDark,
  },
  scaleWrap: {
    width: SCALE_WIDTH,
    height: 62,
    paddingHorizontal: 18,
    position: "relative",
  },
  scaleTrack: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 30,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(190, 207, 227, 0.95)",
  },
  scaleTickWrap: {
    position: "absolute",
    top: 6,
    width: 28,
    marginLeft: -14,
    alignItems: "center",
  },
  scaleTickLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "rgba(53, 79, 110, 0.75)",
  },
  scaleTick: {
    marginTop: 4,
    width: 1,
    height: 14,
    backgroundColor: "rgba(53, 79, 110, 0.42)",
  },
  scaleMarker: {
    position: "absolute",
    width: 34,
    marginLeft: 1,
    alignItems: "center",
  },
  scaleMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  scaleMarkerLabel: {
    marginTop: 1,
    fontSize: 8,
    fontWeight: "900",
  },
  legendRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(53, 79, 110, 0.76)",
  },
  stateCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    gap: 8,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.primary700,
    textAlign: "center",
  },
  stateText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: colors.textLight,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.accent500,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.white,
  },
};
