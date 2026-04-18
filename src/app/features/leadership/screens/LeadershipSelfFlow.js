import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Linking,
} from "react-native";
import ScreenShell from "../../../ui/ScreenShell";
import { colors } from "../../../../theme/colors";
const CONTENT = [
  {
    id: "ted1",
    title: "How Great Leaders Inspire Action",
    description: "Simon Sinek klasszikus TED előadása a 'Why' erejéről.",
    type: "video",
    duration: 18,
    topic: "inspiráció",
    url: "https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action?language=hu",
    source: "TED",
    thumbnail:
      "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/3e7d6d3b-5e2f-4e9c-9f4c-bfe38e4a0d5f/SimonSinek_2009-embed.jpg",
  },
  {
    id: "ted2",
    title: "Why Good Leaders Make You Feel Safe",
    description: "A biztonságérzet és vezetés kapcsolata.",
    type: "video",
    duration: 15,
    topic: "bizalom",
    url: "https://www.ted.com/talks/simon_sinek_why_good_leaders_make_you_feel_safe",
    source: "TED",
    thumbnail:
      "https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/4e6e0a6c-9c66-4e35-8c1e-b9c97f1b1c8d/SimonSinek_2014-embed.jpg",
  },
  {
    id: "yt1",
    title: "TED Talk – Leadership insight",
    description: "Inspiráló vezetői gondolatok videó formában.",
    type: "video",
    duration: 12,
    topic: "inspiráció",
    url: "https://www.youtube.com/watch?v=5aH2Ppjpcho",
    source: "YouTube",
    thumbnail: "https://img.youtube.com/vi/5aH2Ppjpcho/hqdefault.jpg",
  },
  {
    id: "blog1",
    title: "Top 10 Leadership Blogs",
    description: "Válogatott vezetői blogok egy helyen.",
    type: "article",
    duration: 8,
    topic: "olvasás",
    url: "https://getlucidity.com/strategy-resources/the-top-10-leadership-blogs-every-leader-should-read/",
    source: "Lucidity",
    thumbnail: null,
  },
  {
    id: "blog2",
    title: "Tudatos Vezetés Blog",
    description: "Magyar nyelvű vezetéselméleti gondolatok.",
    type: "article",
    duration: 6,
    topic: "önfejlesztés",
    url: "https://tudatosvezetes.blogspot.com/",
    source: "Blogspot",
    thumbnail: null,
  },
  {
    id: "yt2",
    title: "Leadership Video",
    description: "Gyakorlati vezetői tanulságok.",
    type: "video",
    duration: 10,
    topic: "motiváció",
    url: "https://www.youtube.com/watch?v=5Bg3xu2vA2k",
    source: "YouTube",
    thumbnail: "https://img.youtube.com/vi/5Bg3xu2vA2k/hqdefault.jpg",
  },
];
export default function LeadershipSelfFlow() {
  const DefaultContentImage = require("../../../../../assets/leadership/default_content.png");

  const getDailyPick = (items) => {
    if (!items?.length) return null;

    const now = new Date();
    const dayKey = Number(
      `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`,
    );

    const idx = dayKey % items.length;
    return items[idx];
  };

  const heroText =
    "Íme néhány gondolatébresztő, inspiráló tartalom, hogy haladhass tovább a vezetői fejlődés útján. Időről időre visszalátogathatsz ide, és kereshetsz érdeklődésednek és a rendelkezésedre álló időnek megfelelő tartalmakat:";

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [brokenThumbs, setBrokenThumbs] = useState({});
  const markBroken = (id) => {
    setBrokenThumbs((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };
  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const filtered = useMemo(() => {
    return CONTENT.filter((item) => {
      if (selectedTypes.length && !selectedTypes.includes(item.type))
        return false;

      if (selectedTime === "5" && item.duration > 5) return false;
      if (selectedTime === "15" && item.duration > 15) return false;
      if (selectedTime === "30" && item.duration < 30) return false;

      return true;
    });
  }, [selectedTypes, selectedTime]);
  const dailyPick = useMemo(() => getDailyPick(CONTENT), []);
  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.h1}>Saját vezetői fejlődés</Text>
          <Text style={styles.heroText}>{heroText}</Text>
        </View>

        {dailyPick ? (
          <Pressable
            style={({ pressed }) => [
              styles.featured,
              pressed && { opacity: 0.92 },
            ]}
            onPress={() => Linking.openURL(dailyPick.url)}
          >
            <View style={styles.featuredHeader}>
              <View style={styles.featuredAccent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.featuredLabel}>Ma ajánlott</Text>
                <Text style={styles.featuredTitle} numberOfLines={2}>
                  {dailyPick.title}
                </Text>
              </View>
            </View>

            <View style={styles.featuredBody}>
              <Image
                source={
                  dailyPick.thumbnail && !brokenThumbs[dailyPick.id]
                    ? { uri: dailyPick.thumbnail }
                    : DefaultContentImage
                }
                style={styles.featuredThumb}
                resizeMode="contain"
                onError={() => markBroken(dailyPick.id)}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.featuredDesc} numberOfLines={3}>
                  {dailyPick.description}
                </Text>
                <Text style={styles.featuredMeta}>
                  {dailyPick.duration} perc • {dailyPick.source}
                </Text>
              </View>
            </View>
          </Pressable>
        ) : null}

        {/* SZŰRŐK */}
        <View style={styles.filterRow}>
          <Chip
            label="Videó"
            active={selectedTypes.includes("video")}
            onPress={() => toggleType("video")}
          />
          <Chip
            label="Cikk"
            active={selectedTypes.includes("article")}
            onPress={() => toggleType("article")}
          />
        </View>

        <View style={styles.filterRow}>
          <Chip
            label="5 perc"
            active={selectedTime === "5"}
            onPress={() => setSelectedTime("5")}
          />
          <Chip
            label="15 perc"
            active={selectedTime === "15"}
            onPress={() => setSelectedTime("15")}
          />
          <Chip
            label="30+ perc"
            active={selectedTime === "30"}
            onPress={() => setSelectedTime("30")}
          />
        </View>

        {/* LISTA */}
        {filtered.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => Linking.openURL(item.url)}
          >
            <Image
              source={
                item.thumbnail && !brokenThumbs[item.id]
                  ? { uri: item.thumbnail }
                  : DefaultContentImage
              }
              style={styles.thumbnail}
              resizeMode="contain"
              onError={() => markBroken(item.id)}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>

              <Text style={styles.meta}>
                {item.duration} perc • {item.source}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = {
  page: {
    padding: 16,
    gap: 12,
 
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

  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary200,
  },

  chipActive: {
    backgroundColor: "rgba(250,83,147,0.15)",
    borderColor: colors.accent300,
  },

  chipText: {
    fontSize: 12,
    color: colors.textDark,
  },

  chipTextActive: {
    color: colors.accent300,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary100,
  },

 thumbnail: {
  width: 100,
  height: 70,
  borderRadius: 10,
  backgroundColor: "rgba(250,83,147,0.06)",
},

  title: {
    fontWeight: "800",
    color: colors.textDark,
  },

  desc: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "justify",
    color: colors.textLight,
  },

  meta: {
    marginTop: 6,
    fontSize: 11,
    color: colors.accent300,
    fontWeight: "700",
  },
  featured: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(250,83,147,0.22)",
  },

  featuredHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  featuredAccent: {
    width: 6,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.accent300,
  },

  featuredLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.accent300,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  featuredTitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
    color: colors.textDark,
  },

  featuredBody: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

featuredThumb: {
  width: 110,
  height: 76,
  borderRadius: 12,
  backgroundColor: "rgba(250,83,147,0.06)",
},

  featuredThumbPlaceholder: {
    width: 110,
    height: 76,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary100,
    backgroundColor: "rgba(250,83,147,0.06)",
  },

  featuredDesc: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "justify",
    color: colors.textLight,
  },

  featuredMeta: {
    marginTop: 6,
    fontSize: 11,
    color: colors.accent300,
    fontWeight: "800",
  },
};
