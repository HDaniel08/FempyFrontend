import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenShell from "../../../ui/ScreenShell";
import { colors } from "../../../../theme/colors";
import { Image } from "react-native";

export default function LeadershipTeamFlow() {
  const insets = useSafeAreaInsets();

  const heroText = useMemo(
    () =>
      "A csapat ás az üzleti helyzet általános jellemzői meghatározzák, " +
      "hogy milyen vezetői hozzáállás lehet hatékony (az eredeti modellt" +
      " Lewin és munkatársai dolgozták ki).\n Tekintsd át a következő három" +
      "helyzettípust, és kattints arra, amelyikhez legközelebb áll a Te " +
      "kérdésed.",
    [],
  );
  const modalImages = {
    opt1: require("../../../../../assets/leadership/team_involve.png"),
    opt2: require("../../../../../assets/leadership/crisis_urgent.png"),
    opt3: require("../../../../../assets/leadership/team_expert.png"),
  };

  const options = useMemo(
    () => [
      {
        key: "opt1",
        title: "Csapat bevonása (van idő egyeztetni)",
        desc: "Az egész csapat vagy nagy részének munkáját érinti a helyzet. Megbízom a kollégákban, érdemben hozzá tudnak tenni a megoldáshoz, lehet velük erről egyeztetni, és van is erre valamennyi idő. Lehet, hogy a kérdés vagy döntési helyzet kifejezetten személyesen róluk szól.",
        answer:
          "Azt javasoljuk, vond be a csapatot a döntésbe, megoldásba. Oszd meg velük azokat az információkat, amiket lehet, és hallgasd meg a javaslataikat, kérdéseiket, és vedd figyelembe a döntésénél. Megfontolhatod, hogy akár velük együtt hozd meg a döntést. A meghozott döntést kommunikáld a csapatnak, és magyarázd el, a javaslataikat hogyan vetted figyelembe. Még ha nem is minden javaslatukat tudtad beépíteni a döntésbe, a hosszú távú jó együttműködést segíti, hogy azt érzékelik a kollégáid, hogy érdemes elmondani a véleményüket.",
      },
      {
        key: "opt2",
        title: "Krízis / sürgős megoldás",
        desc: "Egy sürgős megoldást igénylő, szinte krízishelyzetről van szó, ahol a gyors cselekvés számít.",
        answer:
          "Az a leghatékonyabb, ha Te döntesz és az alapján minél gyorsabban cselekszel, akár utasítod a kollégáidat, hogy a vészhelyzetet elhárítsák vagy a kockázatokat csökkentsék. Ennek egyetlen fontos feltétele, hogy Nálad meglegyen az összes, a döntéshez szükséges információ. Szerezd be ezeket az információkat, vagy ha nem lehetséges, minél hamarabb vond be azokat, akiknél ezek megvannak.",
      },
      {
        key: "opt3",
        title: "A csapat a szakértő (ők vannak közel)",
        desc: "Olyan üzleti helyzetről van szó, amit a csapat jobban ismer, mint én. Ők vannak igazán közel a problémához, vannak közöttük a témában szakértők vagy nagy tapasztalattal rendelkezők.",
        answer:
          "Az a leghatékonyabb, ha engeded, hogy a csapat saját maga, önállóan dolgozza ki a megoldást, döntést vagy folyamatot. Azzal, hogy Téged tájékoztatnak, bevonnak, csak időt veszítenének. Ha olyan üzleti helyzetről van szó, amiben azonnali visszajelzést kap a csapat, ha téves irányba indul el, akkor ez kevéssé kockázatos, hiszen szükség esetén gyorsan tudnak korrigálni. Ha nincs azonnali visszajelzés a folyamatban, akkor vezetőként ezt igyekezz biztosítani, illetve a csapat figyelmét felhívni arra, hogy ezt biztosítsák maguknak. A Te feladatod ebben a helyzetben az, hogy a siker kritériumokat meghatározd, és teljesülésüket nyomonkövesd.",
      },
    ],
    [],
  );

  const [activeKey, setActiveKey] = useState(null);
  const active = useMemo(
    () => options.find((o) => o.key === activeKey) || null,
    [activeKey, options],
  );

  // Modal anim (fade + scale)
  const [showModal, setShowModal] = useState(false);
  const modalT = useRef(new Animated.Value(0)).current;
  const closePendingRef = useRef(false);

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

  const openModal = (key) => {
    setActiveKey(key);
    triggerHaptic("open");

    closePendingRef.current = false;
    modalT.stopAnimation();
    modalT.setValue(0);
    setShowModal(true);

    Animated.timing(modalT, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    if (!showModal) return;
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
      if (finished) {
        setShowModal(false);
        // activeKey-t megtartjuk, hogy visszalépéskor is megmaradjon a "legutóbbi"
      }
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
          <Text style={styles.h1}>Csapat / üzleti helyzet</Text>
          <Text style={styles.heroText}>{heroText}</Text>
        </View>

        <View style={{ gap: 12 }}>
          {options.map((o) => (
            <Pressable
              key={o.key}
              onPress={() => openModal(o.key)}
              style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.92 },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{o.title}</Text>
                  <Text style={styles.cardDesc}>{o.desc}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Ajánlás</Text>
                </View>
                <Text style={styles.cta}>Megnyitás →</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* MODAL */}
        <Modal
          visible={showModal}
          transparent
          animationType="none"
          onRequestClose={closeModal}
        >
          <Animated.View
            style={[styles.modalBackdrop, { opacity: backdropOpacity }]}
          >
            <Pressable style={{ flex: 1 }} onPress={closeModal}>
              <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
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
                        <Text style={styles.modalTitle}>
                          {active?.title || "Ajánlás"}
                        </Text>

                        {/* PNG a cím alatt */}
                        {activeKey && modalImages[activeKey] ? (
                          <Image
                            source={modalImages[activeKey]}
                            style={styles.modalArt}
                            resizeMode="contain"
                          />
                        ) : null}

                        <Text style={styles.modalMeta}>
                          Javasolt vezetői hozzáállás
                        </Text>
                      </View>
                    </View>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={{ maxHeight: 420 }}
                    >
                      <Text style={styles.modalText}>
                        {active?.answer || ""}
                      </Text>
                    </ScrollView>

                    <View style={styles.modalActions}>
                      <Pressable
                        onPress={closeModal}
                        style={({ pressed }) => [
                          styles.secondaryBtn,
                          pressed && { opacity: 0.92 },
                        ]}
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
  
  },
  modalArt: {
  height: 190,
  width: "100%",
  marginTop: 10,
  marginBottom: 8,
  opacity: 0.9,
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
  heroText: {
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
  },

  cardTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  accent: {
    borderRadius: 999,
    backgroundColor: "rgba(250, 83, 147, 0.55)",
    marginTop: 3,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textDark,
  },
  cardDesc: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textLight,
    lineHeight: 16,
    textAlign: "justify",
  },

  cardBottom: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.primary100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(250, 83, 147, 0.22)",
    backgroundColor: "rgba(250, 83, 147, 0.10)",
  },
  pillText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.accent300,
    letterSpacing: 0.3,
  },

  cta: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.accent300,
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
    borderColor: "rgba(250, 83, 147, 0.22)",
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
  resultAccent: {
    borderRadius: 999,
    backgroundColor: "rgba(250, 83, 147, 0.55)",
    marginTop: 3,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textDark,
  },
  modalMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(53, 79, 110, 0.75)",
  },
  modalText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(18, 34, 56, 0.86)",
    lineHeight: 17,
    textAlign: "justify",
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
    borderColor: "rgba(190, 207, 227, 0.65)",
    backgroundColor: "rgba(250, 83, 147, 0.08)",
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.accent300,
    letterSpacing: 0.2,
  },
};
