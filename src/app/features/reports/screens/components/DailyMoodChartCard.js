import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { colors } from "../../../../../theme/colors";
import { apiFetch } from "../../../../shared/api/http";

const { width: screenWidth } = Dimensions.get("window");

const RANGE_OPTIONS = [5, 14, 30];

function formatShortDate(dateString) {
  const d = new Date(dateString);
  return `${d.getMonth() + 1}.${d.getDate()}.`;
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
  return {
    labels: visibleData.map((item, index) => {
      if (visibleData.length <= 7) return formatShortDate(item.date);
      if (index === 0 || index === visibleData.length - 1) {
        return formatShortDate(item.date);
      }
      if (visibleData.length <= 14) {
        return index % 3 === 0 ? formatShortDate(item.date) : "";
      }
      return index % 6 === 0 ? formatShortDate(item.date) : "";
    }),
    datasets: [
      {
        data: visibleData.map((item) => item.mood),
        strokeWidth: 3,
      },
      {
        data: visibleData.map(() => 5),
        color: () => "transparent",
        strokeWidth: 0,
        withDots: false,
      },
    ],
    legend: [],
  };
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
          <LineChart
            data={chartData}
            width={screenWidth - 76}
            height={150}
            withDots
            withShadow={false}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines
            fromZero
            yAxisInterval={1}
            segments={5}
            chartConfig={{
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(211, 19, 92, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(108, 108, 112, ${opacity})`,
              propsForDots: {
                r: "2.5",
                strokeWidth: "2",
                stroke: colors.accent300,
                fill:  colors.accent300,
              },
              propsForBackgroundLines: {
                stroke: colors.primary100,
                strokeDasharray: "",
                strokeWidth: 1,
              },
              propsForLabels: {
                fontSize: 10,
              },
              strokeWidth: 3,
            }}
            style={styles.chart}
            yLabelsOffset={8}
            xLabelsOffset={-3}
            formatYLabel={(value) => `${value}`}
            getDotColor={() => colors.accent500}
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