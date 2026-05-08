import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { colors } from "../../../../../theme/colors";
import { apiFetch } from "../../../../shared/api/http";

const { width: screenWidth } = Dimensions.get("window");

const RANGE_OPTIONS = [5, 14, 30];
const CHART_HEIGHT = 150;
const CHART_WIDTH = screenWidth - 76;

function formatShortDate(dateString) {
  const d = new Date(dateString);
  return `${d.getMonth() + 1}.${d.getDate()}.`;
}

function clampMood(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(5, value));
}

function MoodLineChart({ data, width = CHART_WIDTH, height = CHART_HEIGHT }) {
  const padding = {
    top: 12,
    right: 14,
    bottom: 26,
    left: 30,
  };

  const innerWidth = Math.max(1, width - padding.left - padding.right);
  const innerHeight = Math.max(1, height - padding.top - padding.bottom);
  const denominator = Math.max(1, data.length - 1);

  const points = data.map((item, index) => {
    const mood = clampMood(item.mood);
    const x = padding.left + (index / denominator) * innerWidth;
    const y = padding.top + ((5 - mood) / 5) * innerHeight;

    return {
      x,
      y,
      mood,
      label: item.label,
      showLabel: item.showLabel,
    };
  });

  const labelY = padding.top + innerHeight + 18;
  const segments = points.slice(1).map((point, index) => {
    const previous = points[index];
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      key: `${previous.x}-${point.x}-${index}`,
      left: (previous.x + point.x) / 2 - length / 2,
      top: (previous.y + point.y) / 2 - 1.5,
      length,
      angle,
    };
  });

  return (
    <View style={[styles.nativeChart, { width, height }]}>
      {[0, 1, 2, 3, 4, 5].map((value) => {
        const y = padding.top + ((5 - value) / 5) * innerHeight;

        return (
          <View key={value}>
            <View
              style={[
                styles.chartGridLine,
                { left: padding.left, top: y, width: innerWidth },
              ]}
            />
            <Text
              style={[
                styles.chartYLabel,
                { left: 0, top: y - 6, width: padding.left - 10 },
              ]}
            >
              {value}
            </Text>
          </View>
        );
      })}

      {segments.map((segment) => (
        <View
          key={segment.key}
          style={[
            styles.chartSegment,
            {
              left: segment.left,
              top: segment.top,
              width: segment.length,
              transform: [{ rotate: `${segment.angle}deg` }],
            },
          ]}
        />
      ))}

      {points.map((point, index) => (
        <View key={`${point.x}-${index}`}>
          <View
            style={[
              styles.chartPoint,
              { left: point.x - 4, top: point.y - 4 },
            ]}
          />
          {point.showLabel && (
            <Text
              style={[
                styles.chartXLabel,
                { left: point.x - 20, top: labelY - 7 },
              ]}
            >
              {point.label}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

export default function DailyMoodChartCard() {
  const [selectedRange, setSelectedRange] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyItems, setHistoryItems] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(12)).current;
  const metaAnim = useRef(new Animated.Value(1)).current;

  const animatedLatest = useRef(new Animated.Value(0)).current;
  const animatedAverage = useRef(new Animated.Value(0)).current;
  const animatedRange = useRef(new Animated.Value(5)).current;

  const [displayLatest, setDisplayLatest] = useState(0);
  const [displayAverage, setDisplayAverage] = useState("0.0");
  const [displayRange, setDisplayRange] = useState(5);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateAnim]);

  useEffect(() => {
    const latestListener = animatedLatest.addListener(({ value }) => {
      setDisplayLatest(Math.round(value));
    });

    const averageListener = animatedAverage.addListener(({ value }) => {
      setDisplayAverage(value.toFixed(1));
    });

    const rangeListener = animatedRange.addListener(({ value }) => {
      setDisplayRange(Math.round(value));
    });

    return () => {
      animatedLatest.removeListener(latestListener);
      animatedAverage.removeListener(averageListener);
      animatedRange.removeListener(rangeListener);
    };
  }, [animatedLatest, animatedAverage, animatedRange]);

  const loadHistory = useCallback(async (days) => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(`/daily-mood/history?days=${days}`);

      const items = Array.isArray(response?.items) ? response.items : [];

      setHistoryItems(items);
    } catch (err) {
      setError(err?.message || "Nem sikerült betölteni a napi kedv adatokat.");
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(selectedRange);
  }, [selectedRange, loadHistory]);

  const visibleData = useMemo(() => {
    return historyItems.map((item) => ({
      date: item.date,
      mood: typeof item.mood === "number" ? item.mood : 0,
      originalMood: item.mood,
      comment: item.comment ?? null,
    }));
  }, [historyItems]);

  const hasAnyMood = useMemo(() => {
    return historyItems.some((item) => typeof item.mood === "number");
  }, [historyItems]);

  const latestMood = useMemo(() => {
    const latestWithMood = [...historyItems]
      .reverse()
      .find((item) => typeof item.mood === "number");

    return latestWithMood?.mood ?? 0;
  }, [historyItems]);

  const averageMood = useMemo(() => {
    const validItems = historyItems.filter((item) => typeof item.mood === "number");

    if (!validItems.length) return 0;

    return (
      validItems.reduce((sum, item) => sum + item.mood, 0) / validItems.length
    );
  }, [historyItems]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedLatest, {
        toValue: latestMood,
        duration: 320,
        useNativeDriver: false,
      }),
      Animated.timing(animatedAverage, {
        toValue: averageMood,
        duration: 360,
        useNativeDriver: false,
      }),
      Animated.timing(animatedRange, {
        toValue: selectedRange,
        duration: 260,
        useNativeDriver: false,
      }),
    ]).start();
  }, [
    latestMood,
    averageMood,
    selectedRange,
    animatedLatest,
    animatedAverage,
    animatedRange,
  ]);

  const chartData = useMemo(() => {
    return visibleData.map((item, index) => {
      const isFirstOrLast = index === 0 || index === visibleData.length - 1;
      let showLabel = true;

      if (visibleData.length > 14) {
        showLabel = isFirstOrLast || index % 6 === 0;
      } else if (visibleData.length > 7) {
        showLabel = isFirstOrLast || index % 3 === 0;
      }

      return {
        ...item,
        label: showLabel ? formatShortDate(item.date) : "",
        showLabel,
      };
    });
  }, [visibleData]);

  const handleRangePress = (days) => {
    if (days === selectedRange) return;

    Animated.sequence([
      Animated.timing(metaAnim, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(metaAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedRange(days);
  };

  const handleRetry = () => {
    loadHistory(selectedRange);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Napi kedv trend</Text>
          <Text style={styles.subtitle}>
            Egyszerű áttekintés az elmúlt időszak kedvértékeiről
          </Text>
        </View>

        
      </View>

      <View style={styles.filterRow}>
        {RANGE_OPTIONS.map((option) => {
          const active = selectedRange === option;

          return (
            <Pressable
              key={option}
              onPress={() => handleRangePress(option)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {option} nap
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Animated.View
        style={{
          transform: [{ scale: metaAnim }],
          opacity: metaAnim,
        }}
      >
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Aktuális</Text>
            <Text style={[styles.metaValue, styles.metaValueAccent]}>
              {displayLatest}
            </Text>
          </View>

  

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Átlag</Text>
            <Text style={styles.metaValue}>{displayAverage}</Text>
          </View>

        

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Időszak</Text>
            <Text style={styles.metaValue}>{displayRange} nap</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.chartWrap}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={colors.accent500} />
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateTitle}>Betöltési hiba</Text>
            <Text style={styles.stateText}>{error}</Text>

            <Pressable onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Újrapróbálás</Text>
            </Pressable>
          </View>
        ) : !visibleData.length || !hasAnyMood ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateTitle}>Még nincs elérhető adat</Text>
            <Text style={styles.stateText}>
              Az adott időszakban még nem rögzítettél napi kedvet.
            </Text>
          </View>
        ) : (
          <MoodLineChart
            data={chartData}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
          />
        )}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          A grafikon a kiválasztott időszak napi kedv adatait mutatja.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = {
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
    gap: 14,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  titleWrap: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.accent500,
    letterSpacing: 0.2,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: colors.textLight,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary100,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.primary700,
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary100,
    backgroundColor: colors.white,
  },

  filterChipActive: {
    backgroundColor: colors.accent500,
    borderColor: colors.accent500,
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary700,
  },

  filterChipTextActive: {
    color: colors.white,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary100,
    position: "relative",
  },

  metaItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  metaLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },

  metaValue: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.accent500,
  },

  metaValueAccent: {
    fontSize: 17,
    color: colors.accent500,
  },

  metaDivider: {
    position: "absolute",
    top: 8,
    bottom: 8,
    width: 1,
    backgroundColor: colors.primary100,
  },

  chartWrap: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    paddingVertical: 8,
    alignItems: "center",
    minHeight: 150,
    justifyContent: "center",
  },

  chart: {
    marginLeft: -45,
    borderRadius: 16,
  },

  nativeChart: {
    position: "relative",
  },

  chartGridLine: {
    position: "absolute",
    height: 1,
    backgroundColor: colors.primary100,
  },

  chartYLabel: {
    position: "absolute",
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(108, 108, 112, 0.88)",
    textAlign: "right",
  },

  chartSegment: {
    position: "absolute",
    height: 3,
    borderRadius: 3,
    backgroundColor: colors.accent500,
  },

  chartPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.accent300,
    borderWidth: 1.5,
    borderColor: colors.white,
  },

  chartXLabel: {
    position: "absolute",
    width: 40,
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(108, 108, 112, 0.88)",
    textAlign: "center",
  },

  loaderWrap: {
    height: 172,
    alignItems: "center",
    justifyContent: "center",
  },

  stateWrap: {
    minHeight: 190,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
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
    lineHeight: 18,
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

  footerRow: {
    paddingTop: 2,
  },

  footerText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: colors.textLight,
  },
};
