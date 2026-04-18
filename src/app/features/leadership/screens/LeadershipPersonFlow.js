import React, { useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenShell from "../../../ui/ScreenShell";

// Slider
import Slider from "@react-native-community/slider";
import { colors } from "../../../../theme/colors";

export default function LeadershipPersonFlow() {
  const insets = useSafeAreaInsets();

  const [competence, setCompetence] = useState(50);
  const [motivation, setMotivation] = useState(50);

  // Modal láthatóság
  const [showResult, setShowResult] = useState(false);

  // "Pro": gomb csak akkor aktív, ha a user már megmozdította a csúszkákat
  const [touchedAny, setTouchedAny] = useState(false);

  // Modal anim (fade + scale)
  const modalT = useRef(new Animated.Value(0)).current; // 0..1
  const closePendingRef = useRef(false);

  const texts = useMemo(
    () => ({
      lowCompHighMotiv:
        "A kolléga valószínűleg lelkes kezdő a feladatban.\n\nEkkor kevéssé szükséges őt motiválni, hiszen eleve lelkes, sokkal inkább konkrét instrukciókra, információkra van szüksége.\n\nMegfontolhatja a következőket:\n\nSzakértő kollégát bíz meg a betanításával\n\nPontosan, konkrétan válaszol a kérdéseire\n\nRendelkezésére bocsát anyagokat, dokumentációkat.\n\nGyakran visszajelez neki az adott feladatban nyújtott teljesítményéről és konkrét javaslatokat fogalmaz meg, hogyan fejlődhetne tovább.",

      lowCompLowMotiv:
        "A kolléga egy kiábrándult tanuló lehet, a kezdeti kudarcok közepette, vagy talán eleve nem is volt lelkes a feladat iránt, amit kapott.\n\nEz egy természetes fázisa a feladatokban való fejlődésnek, de nagyon nehéz megélni mind neki, mind Önnek. Vezetőként mind konkrét instrukciókat, információkat, mind bátorítást, a kudarcokkal kapcsolatos megnyugtatást szükséges lenne nyújtani a kollégának.\n\nMegfontolhatja a következőket:\n\nKimondhatja számára, hogy természetes, hogy a betanulás kudarcokkal jár, és kifejezheti, hogy bízik benne, hogy egyre jobb lesz a feladatban.\n\nKijelölhet mellé egy mentort, aki nemcsak szakmailag, hanem emberileg is támogatja.\n\nRendszeressé teheti a visszajelző megbeszéléseket, ahol minden alkalommal megkérdezheti a kollégát, hogy mondja el az élményeit, nehézségeit és örömeit. Legyen elérhető a kolléga számára valaki, akitől bármikor kérdezhet.",

      highCompLowMotiv:
        "A kolléga minden bizonnyal sok dolgot önállóan meg tud már oldani az adott feladatban, de még vannak váratlan helyzetek vagy nagyobb mérföldkövek, ahol megerősítésre vagy szakmai segítségre van szüksége.Vezetőként kevéssé szükséges, hogy konkrét instrukciókat adjon vagy előírja, hogy az adott feladatot hogyan oldja meg a kolléga, sokkal inkább az Ön támogató jelenlétére vagy arra a háttérre van szüksége, hogy Önhöz fordulhat, amikor úgy gondolja.\n\nAzt érdemes megfontolnia, hogyan tudja a leginkább a támogatásáról biztosítani a kollégát anélkül, hogy elbizonytalanítaná a hozzáértésében azzal, hogy túlzottan beleszól a munkájába.\n\nPéldául: megállapodhatnak, hogy mik lesznek azok a fontos pontok, amikor egyeztetnek, és mi az, amit önállóan oldhat meg a kolléga. Egészen egyszerűen megkérdezheti a kollégát, hogy mire lenne szüksége Öntől, minden bizonnyal lesz erre válasza.",

      highCompHighMotiv:
        "A kolléga önállóan, profin és szívesen végzi az adott feladatot, lehet, hogy ő az egyik szakértője a témának.\n\nAmi kihívást jelenthet az esetében, hogy hogyan tartsa fenn a motivációját, és hogyan segítse, hogy ezt a tudását átadja a többieknek.\n\nVezetőként azzal tudja hatékonyan segíteni az ő munkáját, ha nagy önállóságot nyújt és bizalmáról, támogatásáról biztosítja őt.\n\nHa túlzottan előírja, mit és hogyan csináljon az adott feladatban, azzal csökkentheti a motivációját. Megfontolhatja, hogy további kihívásokat keressen a kollégának, például mentoráljon valakit az adott témában, tudásmegosztó anyagokat készítsen vagy nagyobb felelősségű feladatot, pozíciót vállaljon.\n\nEmellett, ha hosszú ideig marad ebben a feladatban, fennáll a veszélye, hogy ez unalmassá válik számára, ezért érdemes lehet a munkaköre gazdagításán, új feladatokba bevonásán is elgondolkodni, erről őt megkérdezni.",
    }),
    []
  );

  const intro = useMemo(
    () =>
      "A helyzetfüggő vezetés (eredeti verzójában Hersey és Blanchard által kidolgozott) modellje alapján azt kell mérlegelned, hogy az adott beosztott kolléga „…” abban a feladatban, amivel kapcsolatos a kihívásod:",
    []
  );

  const getBucket = (value) => (value < 50 ? "low" : "high");

  const resultKey = useMemo(() => {
    const comp = getBucket(competence);
    const motiv = getBucket(motivation);

    if (comp === "low" && motiv === "high") return "lowCompHighMotiv";
    if (comp === "low" && motiv === "low") return "lowCompLowMotiv";
    if (comp === "high" && motiv === "low") return "highCompLowMotiv";
    return "highCompHighMotiv";
  }, [competence, motivation]);

  const resultTitle = useMemo(() => {
    switch (resultKey) {
      case "lowCompHighMotiv":
        return "Lelkes kezdő";
      case "lowCompLowMotiv":
        return "Kiábrándult tanuló";
      case "highCompLowMotiv":
        return "Önálló, de néha megerősítést igényel";
      case "highCompHighMotiv":
        return "Szakértő, magasan motivált";
      default:
        return "Kiértékelés";
    }
  }, [resultKey]);

  const triggerHaptic = (type) => {
    // Expo esetén: expo-haptics, különben csendben ignoráljuk.
    try {
      // eslint-disable-next-line global-require
      const Haptics = require("expo-haptics");
      if (type === "open") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      // no-op
    }
  };

  const openModal = () => {
    if (!touchedAny) return;

    triggerHaptic("open");
    closePendingRef.current = false;

    modalT.stopAnimation();
    modalT.setValue(0);
    setShowResult(true);

    Animated.timing(modalT, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    if (!showResult) return;
    if (closePendingRef.current) return;
    closePendingRef.current = true;

    triggerHaptic("close");

    Animated.timing(modalT, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      closePendingRef.current = false;
      if (finished) setShowResult(false);
    });
  };

  const backdropOpacity = modalT.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardOpacity = modalT.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardScale = modalT.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingBottom: 110 + (insets.bottom || 0) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.h1}>Beosztott / csapattag helyzet</Text>
          <Text style={styles.intro}>{intro}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mennyire kompetens / gyakorlott?</Text>

          <View style={styles.scaleRow}>
            <Text style={styles.scaleSide}>Egyáltalán nem</Text>
            <Text style={styles.scaleValue}>{Math.round(competence)}%</Text>
            <Text style={styles.scaleSideRight}>Teljes mértékben</Text>
          </View>

          <Slider
            value={competence}
            onValueChange={(v) => {
              setCompetence(v);
              if (!touchedAny) setTouchedAny(true);
            }}
            minimumValue={0}
            maximumValue={100}
            step={1}
            minimumTrackTintColor={colors.accent300}
            maximumTrackTintColor={"rgba(190, 207, 227, 0.9)"}
            thumbTintColor={colors.accent300}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mennyire motivált?</Text>

          <View style={styles.scaleRow}>
            <Text style={styles.scaleSide}>Egyáltalán nem</Text>
            <Text style={styles.scaleValue}>{Math.round(motivation)}%</Text>
            <Text style={styles.scaleSideRight}>Teljes mértékben</Text>
          </View>

          <Slider
            value={motivation}
            onValueChange={(v) => {
              setMotivation(v);
              if (!touchedAny) setTouchedAny(true);
            }}
            minimumValue={0}
            maximumValue={100}
            step={1}
            minimumTrackTintColor={colors.accent300}
            maximumTrackTintColor={"rgba(190, 207, 227, 0.9)"}
            thumbTintColor={colors.accent300}
          />
        </View>

        <Pressable
          onPress={openModal}
          disabled={!touchedAny}
          style={({ pressed }) => [
            styles.primaryBtn,
            !touchedAny && styles.primaryBtnDisabled,
            pressed && touchedAny && { opacity: 0.92 },
          ]}
        >
          <Text style={styles.primaryBtnText}>Kiértékelés</Text>
        </Pressable>

        {!touchedAny ? (
          <Text style={styles.helper}>
            Mozgasd meg bármelyik csúszkát, majd kérj kiértékelést.
          </Text>
        ) : (
          <Text style={styles.helper}>
            Készen állsz — nyomj a kiértékelésre.
          </Text>
        )}

        <Modal
          visible={showResult}
          transparent
          animationType="none"
          onRequestClose={closeModal}
        >
          <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
            <Pressable style={{ flex: 1 }} onPress={closeModal}>
              <View style={{ flex: 1, justifyContent: "center", padding: 16, textAlign:"justify" }}>
                <Pressable onPress={() => {}}>
                  <Animated.View
                    style={[
                      styles.modalCard,
                      {
                        opacity: cardOpacity,
                        transform: [{ scale: cardScale }],
                      },
                    ]}
                  >
                    <View style={styles.modalHeader}>
                      <View style={styles.resultAccent} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultTitle}>{resultTitle}</Text>
                        <Text style={styles.resultMeta}>
                          Kompetencia: {Math.round(competence)}% • Motiváció: {Math.round(motivation)}%
                        </Text>
                      </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                      <Text style={styles.resultText}>{texts[resultKey]}</Text>
                    </ScrollView>

                    <View style={styles.modalActions}>
                      <Pressable
                        onPress={closeModal}
                        style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.92 }]}
                      >
                        <Text style={styles.secondaryBtnText}>Bezárás</Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        </Modal>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = {
  page: {
    padding: 16,
    gap: 12,
  
    textAlign:"justify",
  },

  hero: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary100,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 10,
  },
  h1: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textDark,
    letterSpacing: 0.2,
  },
 intro: {
  fontSize: 12,
  fontWeight: "700",
  color: colors.textLight,
  lineHeight: 17,
  textAlign: "justify",
},

  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary100,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 10,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.accent300,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  scaleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  scaleSide: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textLight,
  },
  scaleSideRight: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textLight,
    textAlign: "right",
  },
  scaleValue: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textDark,
    opacity: 0.8,
  },

  primaryBtn: {
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent300,
    borderWidth: 1,
    borderColor: colors.accent300,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "rgba(255,255,255,0.98)",
    letterSpacing: 0.3,
  },

  helper: {
  fontSize: 12,
  fontWeight: "700",
  color: colors.textLight,
  opacity: 0.9,
  paddingHorizontal: 4,
  textAlign: "justify",
},

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(18, 34, 56, 0.42)",

  },
  modalCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary75,
    backgroundColor: "rgba(255,255,255,0.98)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",

    alignItems: "flex-start",
    marginBottom: 10,
  },
  modalActions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  secondaryBtn: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.accent500,
    backgroundColor: colors.accent300,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.92)",
    letterSpacing: 0.2,
  },

  // Result header text styles
  resultAccent: {

    borderRadius: 999,
    backgroundColor: "rgba(250, 83, 147, 0.55)",
    marginTop: 3,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textDark,
  },
  resultMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(53, 79, 110, 0.75)",
  },
resultText: {
  fontSize: 12,
  fontWeight: "700",
  color: "rgba(18, 34, 56, 0.86)",
  lineHeight: 17,
  textAlign: "justify",
},
};