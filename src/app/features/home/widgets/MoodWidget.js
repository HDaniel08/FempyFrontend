import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  TextInput,
  Alert,
  View,
  Text,
  Pressable,
  Image,
  Animated,
} from "react-native";
import WidgetCard from "./WidgetCard";
import { colors } from "../../../../theme/colors";
import Chip from "../../../ui/Chip";
import Button from "../../../ui/Button.js";
import { apiFetch } from "../../../shared/api/http.js";
// import { apiFetch } from "../../../shared/api/http"; // ha kell backend

// ⚠️ ÁLLÍTSD BE a saját útvonalaidat (statikus require kell!)
const moodAssets = {
  1: {
    key: "angry",
    mini: require("../../../../../assets/moods/angry_mini.png"),
    full: require("../../../../../assets/moods/angry.png"),
    title: "Feszült / dühös",
    text:
      "Ma valami túlcsordult. Nem baj, ez is része a folyamatnak.\n" +
      "Tarts egy lélegzetvételnyi szünetet, és csak egy apró dolgot csinálj meg.",
  },
  2: {
    key: "sad",
    mini: require("../../../../../assets/moods/sad_mini.png"),
    full: require("../../../../../assets/moods/sad.png"),
    title: "Lehangolt",
    text:
      "Ma ne várj magadtól tökéletességet.\n" +
      "Elég, ha jelen vagy és kicsiben haladsz.\n" +
      "Holnap könnyebb lesz.",
  },
  3: {
    key: "neutral",
    mini: require("../../../../../assets/moods/neutral_mini.png"),
    full: require("../../../../../assets/moods/neutral.png"),
    title: "Semleges",
    text:
      "Stabil alap. Innen könnyű irányt váltani.\n" +
      "Válassz egy feladatot, és csináld végig fókuszban.",
  },
  4: {
    key: "happy",
    mini: require("../../../../../assets/moods/happy_mini.png"),
    full: require("../../../../../assets/moods/happy.png"),
    title: "Jó kedv",
    text:
      "Ez az a nap, amikor érdemes rátenni még egy lapáttal.\n" +
      "Használd ki a lendületet – egy extra kis lépés sokat számít.",
  },
  5: {
    key: "excited",
    mini: require("../../../../../assets/moods/excited_mini.png"),
    full: require("../../../../../assets/moods/excited.png"),
    title: "Lelkes / szuper",
    text:
      "Nagyon jó energia!\n" +
      "Írd le, mi adta ma ezt a pluszt, hogy később is vissza tudd idézni.\n" +
      "Menj rá a legfontosabb célodra.",
  },
};

export default function MoodWidget() {
  const [selected, setSelected] = useState(null); // 1..5
  const [savedToday, setSavedToday] = useState(false);
  const [comment, setComment] = useState("");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/daily-mood/today");
        
        if (res?.mood) {
          setSelected(res.mood);
          setComment(res.comment || "");
          setSavedToday(true);
        }
      } catch (e) {
        // ha nincs még adat, az oké
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const moodKeys = useMemo(() => [1, 2, 3, 4, 5], []);

  // animált scale-ek (egy-egy Animated.Value minden gombhoz)
  const scalesRef = useRef(
    moodKeys.reduce((acc, k) => {
      acc[k] = new Animated.Value(1);
      return acc;
    }, {}),
  ).current;

  useEffect(() => {
    // selection változáskor: minden vissza 1-re, kiválasztott spring 1.18-ra
    moodKeys.forEach((k) => {
      Animated.spring(scalesRef[k], {
        toValue: selected === k ? 1.8 : 1,
        stiffness: 260,
        damping: 18,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const activeMood = useMemo(() => {
    if (!selected) return null;
    return moodAssets[selected] || null;
  }, [selected]);

  const handleSave = async () => {
    if (!selected) return;

    try {
      const payload = { mood: selected };
      setLoading(true);

      const res = await apiFetch("/daily-mood/today", {
        method: "POST",
        body: payload,
      });
      setSavedToday(true);
      setComment(res?.data?.comment || "");
    } catch (e) {
      console.log(e)
      Alert.alert("Hiba", "Nem sikerült menteni a mai kedvet.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveComment = async () => {
    try {
      setLoading(true);

      await apiFetch("/daily-mood/today/comment", {
        method: "PATCH",
        body: { comment },
        networkRetries: 2,
      });

      setCommentModalOpen(false);
    } catch (e) {
      const isNetworkError =
        e instanceof TypeError &&
        /network request failed|failed to fetch|load failed/i.test(
          String(e?.message),
        );
      Alert.alert(
        "Hiba",
        isNetworkError
          ? "A hálózati kapcsolat megszakadt. Ellenőrizd az internetkapcsolatot, majd próbáld újra."
          : e?.message || "A komment mentése nem sikerült.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <WidgetCard>
      <Header
        title="Mai hangulat"
        right={
          <Chip
            label={savedToday ? "Rögzítve" : "Ma"}
            variant={savedToday ? "success" : "neutral"}
          />
        }
      />

      {/* 1) HA MENTETT: nagy megjelenítés bal kép + jobb szöveg */}
      {savedToday && activeMood ? (
        <View style={styles.savedRow}>
          <Modal transparent visible={commentModalOpen} animationType="fade">
  <View style={{
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  }}>
    <View style={{
      backgroundColor: "white",
      borderRadius: 18,
      padding: 16,
    }}>
      <Text style={{ fontSize: 16, fontWeight: "800", marginBottom: 10 }}>
        Komment a mai kedvhez
      </Text>

      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Pl.: Ma ez történt…"
        multiline
        style={{
          minHeight: 90,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 12,
          textAlignVertical: "top",
        }}
        maxLength={500}
      />

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <Button label="Mégse" variant="ghost" onPress={() => setCommentModalOpen(false)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Mentés" variant="primary" onPress={handleSaveComment} />
        </View>
      </View>
    </View>
  </View>
</Modal>
          <Image
            source={activeMood.full}
            style={styles.savedImage}
            resizeMode="contain"
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.savedTitle}>{activeMood.title}</Text>
            <Text style={styles.savedText}>{activeMood.text}</Text>
          </View>
        </View>
      ) : null}

      {/* 2) HA NINCS MENTETT: mini választó + mentés gomb, NINCS nagy kép */}
      {!savedToday ? (
        <>
          <View style={styles.pickerRow}>
            {moodKeys.map((k) => {
              const item = moodAssets[k];

              return (
                <Pressable
                  key={k}
                  onPress={() => setSelected(k)}
                  hitSlop={10}
                  style={styles.pickerBtn}
                >
                  <Animated.View
                    style={{ transform: [{ scale: scalesRef[k] }] }}
                  >
                    <Image
                      source={item.mini}
                      style={styles.miniImage}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 14 }}>
            <Button
              label="Mentés"
              onPress={handleSave}
              variant="primary"
              disabled={!selected}
            />
          </View>
        </>
      ) : null}
      {savedToday ? (
  <View style={{ marginTop: 12 }}>
    <Button
      label={comment ? "Komment szerkesztése" : "Komment hozzáadása"}
      variant="secondary"
      onPress={() => setCommentModalOpen(true)}
    />
  </View>
  
  
) : null}
    </WidgetCard>
  );
}

function Header({ title, right }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "800", color: colors.textDark }}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = {
  // --- választó ---
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  pickerBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "transparent", // nincs kártya/keret/highlight
  },
  miniImage: {
    width: 44, // nagyobb mini
    height: 44,
  },

  // --- mentett nézet ---
  savedRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  savedImage: {
    width: 92,
    height: 92,
  },
  savedTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textDark,
    marginBottom: 4,
  },
  savedText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textLight,
    lineHeight: 16,
  },
};
