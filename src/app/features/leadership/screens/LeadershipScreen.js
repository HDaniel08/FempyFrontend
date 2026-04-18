import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import ScreenShell from "../../../ui/ScreenShell";
import { colors } from "../../../../theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LeadershipScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const intro = useMemo(
    () =>
      `A következő gondolatok és gyakorlat a vezetési stílusok tudatos alkalmazását segítik.
Ha visszagondolsz eddigi munkatapasztalataidra, korábbi vezetőidre, nagy eséllyel megfogalmazódhat Benned, hogy mindenki másképp vezet, sőt, mindannyiunknak különböző igényeink vannak a vezetőnkkel kapcsolatban, amik ráadásul időről időre, feladatról feladatra változhatnak.

Hogyan lehet ennek a sokféle elvárásnak megfelelni? Megválasztani az adott helyzetben leghatékonyabb vezetési stílust?

Gondolj egy Téged éppen foglalkoztató vezetői kihívásra. Egy-egy vezetéselméleti modellt hívunk segítségül, hogy szempontokat kapj a továbblépéshez.`,
    []
  );

  // 3 irány (most csak UI / placeholder)
  const cards = useMemo(
    () => [
      {
        key: "person",
        title: "Beosztott / csapattag helyzet",
        desc:
          "Ha egy konkrét emberrel kapcsolatos kihívásod van: motiváció, teljesítmény, konfliktus, fejlesztés.",
        tag: "1:1 fókusz",
        disabled: false,
        onPress: () => {
         navigation.navigate("LeadershipPersonFlow")
        },
      },
      {
        key: "team",
        title: "Csapat vagy üzleti helyzet",
        desc:
          "Ha a teljes csapat működése vagy egy üzleti szituáció a kérdés: fókusz, priorizálás, változás, célok.",
        tag: "Csapat fókusz",
        disabled: false,
        onPress: () => {
          navigation.navigate("LeadershipTeamFlow")
        },
      },
      {
        key: "self",
        title: "Saját vezetői fejlődés",
        desc:
          "Ha önmagadon dolgoznál: stílusod tudatosítása, rutinok, reflektálás, visszajelzések értelmezése.",
        tag: "Önfejlesztés",
        disabled: false,
        onPress: () => {
           navigation.navigate("LeadershipSelfFlow")
        },
      },
    ],
    [navigation]
  );

  return (
    <ScreenShell>
         <ScrollView
     contentContainerStyle={[
  styles.page,
  { paddingBottom: 10 + insets.bottom }
]}
      showsVerticalScrollIndicator={false}
    >
      
        <View style={styles.hero}>
          <Text style={styles.h1}>Vezetés</Text>
          <Text style={styles.intro}>{intro}</Text>
        </View>

        <View style={{ gap: 12 }}>
          {cards.map((c) => (
            <Pressable
              key={c.key}
              onPress={c.onPress}
              disabled={c.disabled}
              style={({ pressed }) => [
                styles.card,
                c.disabled && styles.cardDisabled,
                pressed && !c.disabled && styles.cardPressed,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <Text style={styles.cardDesc}>{c.desc}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{c.tag}</Text>
                </View>

                <Text style={styles.cta}>{c.disabled ? "Hamarosan" : "Tovább →"}</Text>
              </View>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </ScreenShell>
  );
}

const styles = {
  page: {
    padding: 16,
    gap: 14,
 

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
    fontSize: 22,
    fontWeight: "900",
    color: colors.textDark,
    letterSpacing: 0.2,
  },

  intro: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textLight,
    lineHeight: 17,
  },

  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary300,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardDisabled: {
    opacity: 0.55,
  },

  cardTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  accent: {
    width: 0,
    borderRadius: 999,
    backgroundColor: "rgba(148, 149, 147, 0.55)",
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
  },

  cardBottom: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(190, 207, 227, 0.55)",
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
    backgroundColor: colors.accent300,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.92)",
    letterSpacing: 0.3,
  },

  cta: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.accent300,
  },
};