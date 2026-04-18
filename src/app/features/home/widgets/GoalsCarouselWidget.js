import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { View, Text, ActivityIndicator, Animated, Easing } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { apiFetch } from "../../../shared/api/http"; // igazítsd
import { colors } from "../../../../theme/colors";

// Állítsd ide a saját magentád (ha van theme colorod, cseréld ki arra)

export default function GoalsCarouselWidget() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stabilan renderelt szövegek (ez szünteti meg a villogást)
  const [currentText, setCurrentText] = useState(null);
  const [nextText, setNextText] = useState(null);

  const idxRef = useRef(0);
  const switchingRef = useRef(false);
  const intervalRef = useRef(null);

  // animációs progress 0..1
  const t = useRef(new Animated.Value(0)).current;

  const safeGoals = useMemo(
    () => (Array.isArray(goals) ? goals : []).filter((g) => g?.text?.trim()),
    [goals],
  );
  const hasMultiple = safeGoals.length >= 2;

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/users/me/goals");
      const list = Array.isArray(data) ? data : [];

      setGoals(list);

      const cleaned = list.filter((g) => g?.text?.trim());
      idxRef.current = 0;
      switchingRef.current = false;
      t.stopAnimation();
      t.setValue(0);

      setNextText(null);
      setCurrentText(cleaned[0]?.text ?? null);
    } catch (e) {
      console.log("Goals widget load error:", e?.message, e?.status, e?.data);
      setGoals([]);
      setCurrentText(null);
      setNextText(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, []),
  );

  // automatikus váltás
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (hasMultiple) {
      intervalRef.current = setInterval(() => {
        if (switchingRef.current) return;
        triggerSwitch();
      }, 5200);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultiple, safeGoals.length, currentText]);

  const triggerSwitch = () => {
    if (!hasMultiple) return;

    const nextIdx = (idxRef.current + 1) % safeGoals.length;
    const upcoming = safeGoals[nextIdx]?.text ?? null;
    if (!upcoming) return;

    switchingRef.current = true;
    setNextText(upcoming);

    t.stopAnimation();
    t.setValue(0);

    Animated.timing(t, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        switchingRef.current = false;
        setNextText(null);
        t.setValue(0);
        return;
      }

      // COMMIT egyben: current <- next, next törlés, idx léptetés
      idxRef.current = nextIdx;
      setCurrentText(upcoming);
      setNextText(null);

      // Reset anim következő körre
      t.setValue(0);
      switchingRef.current = false;
    });
  };

  // interpolációk (jobbról be, balra ki)
  const curOpacity = t.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.35, 0],
  });

  const nextOpacity = t.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.85, 1],
  });

  // X irány: current 0 -> -24 (balra ki), next +24 -> 0 (jobbról be)
  const curTranslateX = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -24],
  });

  const nextTranslateX = t.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Saját céljaim</Text>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 10 }}>
          <ActivityIndicator />
        </View>
      ) : currentText ? (
        <View style={styles.stage}>
          {/* Current */}
          <Animated.View
            style={[
              styles.layer,
              nextText
                ? {
                    opacity: curOpacity,
                    transform: [{ translateX: curTranslateX }],
                  }
                : { opacity: 1, transform: [{ translateX: 0 }] },
            ]}
          >
            <Text style={styles.goalText} numberOfLines={3}>
              {currentText}
            </Text>
          </Animated.View>

          {/* Next (csak váltás közben) */}
          {nextText ? (
            <Animated.View
              style={[
                styles.layer,
                {
                  opacity: nextOpacity,
                  transform: [{ translateX: nextTranslateX }],
                },
              ]}
            >
              <Text style={styles.goalText} numberOfLines={3}>
                {nextText}
              </Text>
            </Animated.View>
          ) : null}
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Adj hozzá célokat a Fiók menüben, és itt körbe fognak menni.
        </Text>
      )}
    </View>
  );
}

const styles = {
  // Fehér panel, de nem “dobozos”: finom border + nagyon enyhe árnyék
  wrap: {
   
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    backgroundColor: "rgba(255,255,255,1)",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  accentBar: {
    width: 18,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(80, 126, 179, 0.35)",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textDark,
    letterSpacing: 0.2,
  },

  // Fix “színpad” magasság → nincs layout ugrálás
  // 3 sor * 22 lineHeight ≈ 66, adunk egy kis tartalékot
  stage: {
    position: "relative",
    height: 30,
    overflow: "hidden",
    justifyContent: "center",
  },
  layer: {
    position: "absolute",
    left: 0,
    right: 0,
  },

  // Motivációs: dőlt + magenta
  goalText: {
    fontSize: 16,
    fontWeight: "800",
    fontStyle: "italic",
    color: colors.accent500,
    lineHeight: 22,
    letterSpacing: 0.15,
  },

  emptyText: {
    opacity: 0.78,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(53, 79, 110, 0.78)",
    lineHeight: 16,
  },
};
