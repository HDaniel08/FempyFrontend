import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Pressable,
  Alert,
  Animated,
  Platform,
} from "react-native";

import { colors } from "../../../../theme/colors";
import Button from "../../../ui/Button";
import Chip from "../../../ui/Chip";
import { API_BASE_URL, apiFetch, apiUpload } from "../../../shared/api/http";
import { useAuth } from "../../../auth/AuthContext";
import GoalsList from "../ui/GoalList";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import ScreenShell from "../../../ui/ScreenShell";
import { Image, Modal } from "react-native";
import { InteractionManager } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
const AVATAR_PRESETS = [
  { id: "1", src: require("../../../../../assets/profile/avatar_1.png") },
  { id: "2", src: require("../../../../../assets/profile/avatar_2.png") },
  { id: "3", src: require("../../../../../assets/profile/avatar_3.png") },
  { id: "4", src: require("../../../../../assets/profile/avatar_4.png") },
  { id: "5", src: require("../../../../../assets/profile/avatar_5.png") },
  { id: "6", src: require("../../../../../assets/profile/avatar_6.png") },
  { id: "7", src: require("../../../../../assets/profile/avatar_7.png") },
];
/**
 * AccountScreen (Enterprise Form)
 * - Betölt: /users/me
 * - Ment:   /users/me/profile   (PATCH)
 *
 * UI update:
 * - profil-kártya jelleg
 * - finomabb tipó / színek
 * - kártyás szekciók + elválasztók
 * - modernebb input stílus
 * - hint -> info icon + tooltip bubble
 */
export default function AccountScreen() {
  function runAfterTwoFrames(fn) {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }
  const { user: authUser, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serverUser, setServerUser] = useState(null);

  // Form mezők (profile)
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState(""); // ISO: YYYY-MM-DD
  const [gender, setGender] = useState(""); // "1" | "2" | "3"
  const [dateOfStart, setDateOfStart] = useState("");
  const [description, setDescription] = useState("");

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [onHoliday, setOnHoliday] = useState(false);

  const [lessNotification, setLessNotification] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const [dailyNotification, setDailyNotification] = useState(true);

  const [avatarPresetId, setAvatarPresetId] = useState(""); // "1".."7"
  const [avatarUrl, setAvatarUrl] = useState(""); // feltöltött kép URL-je (ha van)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const dirty = useMemo(() => {
    if (!serverUser?.profile) return false;
    const p = serverUser.profile;

    return (
      (nickname ?? "") !== (p.nickname ?? "") ||
      (birthday ?? "") !== (p.birthday ? isoDate(p.birthday) : "") ||
      (gender ?? "") !== (p.gender ?? "") ||
      (dateOfStart ?? "") !== (p.dateOfStart ? isoDate(p.dateOfStart) : "") ||
      (description ?? "") !== (p.description ?? "") ||
      !!isAnonymous !== !!p.isAnonymous ||
      !!isPublic !== !!p.isPublic ||
      !!onHoliday !== !!p.onHoliday ||
      !!lessNotification !== !!p.lessNotification ||
      !!emailNotification !== !!p.emailNotification ||
      !!dailyNotification !== !!p.dailyNotification ||
      (avatarPresetId ?? "") !==
        (p.profilePic !== null && p.profilePic !== undefined
          ? String(p.profilePic)
          : "") ||
      (avatarUrl ?? "") !== (p.profilePicUrl ?? "")
    );
  }, [
    serverUser,
    nickname,
    birthday,
    gender,
    dateOfStart,
    description,
    isAnonymous,
    isPublic,
    onHoliday,
    lessNotification,
    emailNotification,
    dailyNotification,
    avatarPresetId,
  ]);

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMe() {
    try {
      setLoading(true);
      const res = await apiFetch("/users/me");
      const u = res?.data ?? res;

      setServerUser(u);
      hydrateForm(u);
    } catch (e) {
      console.log("AccountScreen loadMe error:", e?.message, e?.response?.data);
      Alert.alert("Hiba", "Nem sikerült betölteni a profilodat.");
    } finally {
      setLoading(false);
    }
  }

  function hydrateForm(u) {
    const p = u?.profile ?? {};

    setNickname(p.nickname ?? u?.firstName ?? "");
    setBirthday(p.birthday ? isoDate(p.birthday) : "");
    setGender(
      p.gender !== null && p.gender !== undefined ? String(p.gender) : "",
    );
    setDateOfStart(p.dateOfStart ? isoDate(p.dateOfStart) : "");
    setDescription(p.description ?? "");

    setIsAnonymous(!!p.isAnonymous);
    setIsPublic(p.isPublic !== undefined ? !!p.isPublic : true);
    setOnHoliday(!!p.onHoliday);

    setLessNotification(!!p.lessNotification);
    setEmailNotification(!!p.emailNotification);
    setDailyNotification(
      p.dailyNotification !== undefined ? !!p.dailyNotification : true,
    );
    setAvatarPresetId(p.profilePic ? String(p.profilePic) : "");
    setAvatarUrl(p.profilePicUrl ?? "");
  }

  async function handleSave() {
    if (birthday && !isValidIsoDate(birthday)) {
      Alert.alert("Hiba", "Születésnap formátuma: YYYY-MM-DD");
      return;
    }
    if (dateOfStart && !isValidIsoDate(dateOfStart)) {
      Alert.alert("Hiba", "Belépés dátuma formátuma: YYYY-MM-DD");
      return;
    }
    if (gender && !["1", "2", "3"].includes(gender)) {
      Alert.alert("Hiba", "Nem (gender) mező: 1 / 2 / 3 lehet.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nickname: trimOrNull(nickname),
        birthday: birthday || null,
        gender: gender ? Number(gender) : null,
        dateOfStart: dateOfStart || null,
        description: trimOrNull(description),

        isAnonymous,
        isPublic,
        onHoliday,

        lessNotification,
        emailNotification,
        dailyNotification,
        profilePic: avatarPresetId ? String(avatarPresetId) : undefined,

        //profilePicUrl: avatarUrl || null,
      };
      const preset = avatarPresetId ? String(avatarPresetId) : undefined;
      if (!preset) delete payload.profilePic;
      const res = await apiFetch("/users/me/profile", {
        method: "PATCH",
        body: payload,
      });

      const updated = res?.data ?? res;

      setServerUser(updated);
      hydrateForm(updated);

      Alert.alert("Mentve", "A profil beállításai frissültek.");
    } catch (e) {
      console.log("AccountScreen save error:", e?.message, e?.status, e?.data);
      Alert.alert(
        "Hiba",
        e?.message ?? "Nem sikerült menteni a módosításokat.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert("Kijelentkezés", "Biztosan ki szeretnél jelentkezni?", [
      { text: "Mégse", style: "cancel" },
      {
        text: "Kijelentkezés",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }
  function renderAvatar({ avatarUrl, avatarPresetId, fullName }) {
    const preset = AVATAR_PRESETS.find((p) => p.id === String(avatarPresetId));

    if (avatarUrl) {
      return (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      );
    }

    if (preset) {
      return (
        <Image
          source={preset.src}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      );
    }

    return <Text style={styles.avatarText}>{getInitials(fullName)}</Text>;
  }

  const displayUser = serverUser || authUser;

  if (loading) {
    return (
      <View style={styles.pageCenter}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Profil betöltése...</Text>
      </View>
    );
  }

  const fullName =
    `${displayUser?.firstName ?? ""} ${displayUser?.lastName ?? ""}`.trim() ||
    "—";
  const email = displayUser?.email ?? "—";
  function GenderSelect({ value, onChange }) {
    const options = [
      { label: "Férfi", value: "1" },
      { label: "Nő", value: "2" },
      { label: "Egyéb", value: "3" },
    ];

    return (
      <View style={styles.genderRow}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.genderPill, active && styles.genderPillActive]}
            >
              <Text
                style={[
                  styles.genderPillText,
                  active && styles.genderPillTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  function DatePickerField({ value, onChange, placeholder }) {
    const [open, setOpen] = useState(false);

    const dateObj = useMemo(() => {
      if (!value || !isValidIsoDate(value)) return new Date();
      const [y, m, d] = value.split("-").map((x) => Number(x));
      return new Date(y, (m || 1) - 1, d || 1);
    }, [value]);

    const displayText = value && isValidIsoDate(value) ? value : "";

    const commit = (pickedDate) => {
      onChange(isoDate(pickedDate));
    };

    return (
      <View>
        <Pressable onPress={() => setOpen(true)} style={styles.dateField}>
          <Text
            style={[
              styles.dateFieldText,
              !displayText && styles.dateFieldPlaceholder,
            ]}
          >
            {displayText || placeholder || "Válassz dátumot"}
          </Text>
        </Pressable>

        {open && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              // Android: event.type lehet "dismissed"
              if (Platform.OS === "android") setOpen(false);

              if (event?.type === "dismissed") return;
              if (!selectedDate) return;

              commit(selectedDate);

              // iOS-nél te döntöd el: maradjon-e nyitva; itt bezárjuk.
              if (Platform.OS === "ios") setOpen(false);
            }}
          />
        )}
      </View>
    );
  }
  return (
    <ScreenShell>
        <View style={styles.screen}>
        <KeyboardAwareScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={170}
      showsVerticalScrollIndicator={false}
    >
      
    
          {/* Header / Profile card */}
          <View style={styles.headerWrap}>
            <Text style={styles.h1}>Fiók</Text>

            <View style={styles.profileCard}>
              <View style={styles.profileTopRow}>
                <Pressable
                  onPress={() => setAvatarPickerOpen(true)}
                  style={styles.avatarCircle}
                  hitSlop={10}
                >
                  {renderAvatar({ avatarUrl, avatarPresetId, fullName })}
                </Pressable>

                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {fullName}
                  </Text>
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {email}
                  </Text>
                </View>

                <Chip
                  label={dirty ? "Módosítva" : "Szinkronban"}
                  variant={dirty ? "accent" : "neutral"}
                />
              </View>

              <View style={styles.profileMetaRow}>
                <MetaPill
                  label="Állapot"
                  value={onHoliday ? "Szabadságon" : "Elérhető"}
                />
                <MetaPill
                  label="Profil"
                  value={isPublic ? "Publikus" : "Privát"}
                />
                <MetaPill
                  label="Mód"
                  value={isAnonymous ? "Anonim" : "Normál"}
                />
              </View>
            </View>
          </View>

          {/* Sections */}
          <Section title="Alap adatok">
            <ReadOnlyRowSmall label="Név" value={fullName} />
            <CardDivider />
            <ReadOnlyRowSmall label="Email" value={email} />
            <CardDivider />

            <Field label="Becenév">
              <ModernInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Pl. Dani"
                autoCapitalize="words"
              />
            </Field>

            <Field label="Születésnap">
              <DatePickerField
                value={birthday}
                onChange={setBirthday}
                placeholder="Válassz dátumot"
              />
            </Field>

            <Field label="Belépés dátuma">
              <DatePickerField
                value={dateOfStart}
                onChange={setDateOfStart}
                placeholder="Válassz dátumot"
              />
            </Field>

            <Field label="Nem">
              <GenderSelect value={gender} onChange={setGender} />
            </Field>
          </Section>

          <Section title="Rólad">
            <Field label="Leírás">
              <ModernInput
                value={description}
                onChangeText={setDescription}
                placeholder="Rövid leírás..."
                multiline
                style={{ height: 110, textAlignVertical: "top" }}
              />
            </Field>

            <View style={{ marginTop: 2 }}>
              <GoalsList />
            </View>
          </Section>

          <Section title="Láthatóság">
            <ToggleRow
              label="Anonim mód"
              hint="A válaszok anonimként jelenhetnek meg."
              value={isAnonymous}
              onValueChange={setIsAnonymous}
            />
            <CardDivider />
            <ToggleRow
              label="Publikus profil"
              hint="Mások láthatják az alap profil infókat."
              value={isPublic}
              onValueChange={setIsPublic}
            />
            <CardDivider />
            <ToggleRow
              label="Szabadságon"
              hint="Jelöld, ha épp nem vagy elérhető."
              value={onHoliday}
              onValueChange={setOnHoliday}
            />
          </Section>

          <Section title="Értesítések">
            <ToggleRow
              label="Kevesebb értesítés"
              hint="Csökkentett push mennyiség."
              value={lessNotification}
              onValueChange={setLessNotification}
            />
            <CardDivider />
            <ToggleRow
              label="Email értesítések"
              hint="Fontos események emailben."
              value={emailNotification}
              onValueChange={setEmailNotification}
            />
            <CardDivider />
            <ToggleRow
              label="Napi értesítés"
              hint="Napi kérdőív / kedv emlékeztető."
              value={dailyNotification}
              onValueChange={setDailyNotification}
            />
          </Section>
          <Modal
            visible={avatarPickerOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setAvatarPickerOpen(false)}
          >
            <Pressable
              style={styles.avatarModalBackdrop}
              onPress={() => setAvatarPickerOpen(false)}
            >
              <Pressable style={styles.avatarModalCard} onPress={() => {}}>
                <View style={styles.avatarModalHeader}>
                  <Text style={styles.avatarModalTitle}>Profilkép</Text>
                  <Pressable
                    onPress={() => setAvatarPickerOpen(false)}
                    hitSlop={10}
                    style={styles.avatarModalClose}
                  >
                    <Text style={styles.avatarModalCloseText}>×</Text>
                  </Pressable>
                </View>

                <Text style={styles.avatarModalHint}>
                  Válassz egy preset avatart, vagy tölts fel saját képet.
                </Text>

                <View style={styles.avatarGrid}>
                  {AVATAR_PRESETS.map((p) => {
                    const active =
                      String(avatarPresetId) === p.id && !avatarUrl;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => {
                          setAvatarUrl(""); // preset választáskor töröljük az egyéni képet
                          setAvatarPresetId(p.id);
                        }}
                        style={[
                          styles.avatarPresetBtn,
                          active && styles.avatarPresetBtnActive,
                        ]}
                      >
                        <Image
                          source={p.src}
                          style={styles.avatarPresetImg}
                          resizeMode="cover"
                        />
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.avatarActions}>
                  <View style={{ height: 10 }} />
                </View>
              </Pressable>
            </Pressable>
          </Modal>

          {/* Save bar */}
          <View style={{ marginTop: 16 }}>
            <View style={styles.actionContainer}>
              <Button
                label={
                  saving ? "Mentés..." : dirty ? "Változások mentése" : "Mentés"
                }
                onPress={handleSave}
                variant="primary"
                disabled={!dirty || saving}
              />

              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Kijelentkezés</Text>
              </Pressable>

              <Pressable onPress={loadMe} style={styles.refreshBtn}>
                <Text style={styles.refreshText}>Frissítés a szerverről</Text>
              </Pressable>
            </View>

          
          </View>
       </KeyboardAwareScrollView>
      </View>
   
    </ScreenShell>
  );
}

/* -------------------- UI helpers -------------------- */

function Section({ title, children }) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

function TwoColRow({ children }) {
  return <View style={styles.twoColRow}>{children}</View>;
}

function ReadOnlyRowSmall({ label, value }) {
  return (
    <View style={{ paddingVertical: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.readOnlySmall} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function CardDivider() {
  return <View style={styles.cardDivider} />;
}

function ModernInput(props) {
  const { style, ...rest } = props;
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      <TextInput
        {...rest}
        placeholderTextColor={"rgba(74, 93, 122, 0.45)"}
        style={[styles.input, style]}
        onFocus={(e) => {
          setFocused(true);
          props?.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props?.onBlur?.(e);
        }}
      />
    </View>
  );
}

function ToggleRow({ label, hint, value, onValueChange }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  function showHint() {
    if (!hint) return;
    setOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 3200);
  }

  return (
    <View style={{ paddingVertical: 12 }}>
      <View style={styles.toggleRowTop}>
        <View style={{ flex: 1 }}>
          <View style={styles.toggleLabelRow}>
            <Text style={styles.toggleLabel}>{label}</Text>

            {!!hint && (
              <Pressable
                onPress={showHint}
                hitSlop={10}
                style={styles.infoIcon}
              >
                <Text style={styles.infoIconText}>i</Text>
              </Pressable>
            )}
          </View>

          {!!hint && (
            <InfoBubble
              visible={open}
              text={hint}
              onDismiss={() => setOpen(false)}
            />
          )}
        </View>

        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.primary200, true: colors.accent300 }}
          thumbColor={colors.white}
        />
      </View>
    </View>
  );
}

function InfoBubble({ visible, text, onDismiss }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: visible ? 160 : 120,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.infoBubble,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-2, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.infoBubbleText}>{text}</Text>

      <Pressable onPress={onDismiss} hitSlop={10} style={styles.infoClose}>
        <Text style={styles.infoCloseText}>×</Text>
      </Pressable>
    </Animated.View>
  );
}

function MetaPill({ label, value }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

/* -------------------- utils -------------------- */

function isoDate(dateLike) {
  try {
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

function isValidIsoDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function trimOrNull(s) {
  if (s === null || s === undefined) return null;
  const t = String(s).trim();
  return t.length ? t : null;
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const a = parts[0]?.[0] ?? "—";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase();
}

/* -------------------- styles -------------------- */

const styles = {
  screen: {
    flex: 1,
   
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  pageCenter: {
    flex: 1,
    backgroundColor: colors.primary50,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    color: colors.primary700,
    fontWeight: "700",
  },

  h1: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textDark,
    letterSpacing: 0.2,
  },

  headerWrap: {
    marginBottom: 8,
  },

  profileCard: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    padding: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(80, 126, 179, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(80, 126, 179, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary700,
    letterSpacing: 0.6,
  },

  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: "rgba(18, 34, 56, 0.92)",
  },
  profileEmail: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(53, 79, 110, 0.78)",
  },

  profileMetaRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  metaPill: {
    backgroundColor: "rgba(80, 126, 179, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(80, 126, 179, 0.16)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(53, 79, 110, 0.78)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary700,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textDark,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 8,
    marginTop: 2,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    padding: 14,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  cardDivider: {
    height: 1,
    backgroundColor: "rgba(190,207,227,0.55)",
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textDark,
    letterSpacing: 0.2,
  },

  readOnlySmall: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(18, 34, 56, 0.88)",
  },

  twoColRow: {
    flexDirection: "row",
    gap: 10,
  },

  inputWrap: {
    backgroundColor: "rgba(80, 126, 179, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.70)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  inputWrapFocused: {
    borderColor: "rgba(80, 126, 179, 0.55)",
    backgroundColor: "rgba(80, 126, 179, 0.08)",
  },
  input: {
    backgroundColor: "transparent",
    paddingHorizontal: 2,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(18, 34, 56, 0.92)",
  },

  toggleRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  toggleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textDark,
  },

  infoIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(80, 126, 179, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(80, 126, 179, 0.28)",
  },
  infoIconText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary700,
    marginTop: -1,
  },

  infoBubble: {
    zIndex: 1000,
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.70)",
    position: "absolute",
    left: 60,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  infoBubbleText: {
    color: "rgba(18, 34, 56, 0.85)",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    paddingRight: 18,
  },
  infoClose: {
    position: "absolute",
    right: 6,
    top: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(80, 126, 179, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(80, 126, 179, 0.18)",
  },
  infoCloseText: {
    color: "rgba(18, 34, 56, 0.75)",
    fontSize: 14,
    fontWeight: "900",
    marginTop: -1,
  },

  refreshBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  refreshText: {
    color: colors.primary700,
    fontWeight: "800",
  },
  dateField: {
    backgroundColor: "rgba(80, 126, 179, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.70)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateFieldText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(18, 34, 56, 0.92)",
  },
  dateFieldPlaceholder: {
    color: "rgba(74, 93, 122, 0.50)",
  },

  genderRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  genderPill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.75)",
    backgroundColor: "rgba(80, 126, 179, 0.06)",
  },
  genderPillActive: {
    backgroundColor: "rgba(80, 126, 179, 0.16)",
    borderColor: "rgba(80, 126, 179, 0.45)",
  },
  genderPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(53, 79, 110, 0.85)",
  },
  genderPillTextActive: {
    color: "rgba(18, 34, 56, 0.92)",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  avatarModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(18, 34, 56, 0.42)",
    padding: 16,
    justifyContent: "center",
  },

  avatarModalCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.55)",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  avatarModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  avatarModalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "rgba(18, 34, 56, 0.92)",
  },

  avatarModalClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(80, 126, 179, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(80, 126, 179, 0.18)",
  },

  avatarModalCloseText: {
    fontSize: 18,
    fontWeight: "900",
    color: "rgba(18, 34, 56, 0.75)",
    marginTop: -1,
  },

  avatarModalHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(53, 79, 110, 0.78)",
  },

  avatarGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  avatarPresetBtn: {
    width: 56,
    height: 56,
    borderRadius: 56/2,
    backgroundColor: "rgba(80, 126, 179, 0.06)",
    borderWidth: 2,
    borderColor: "rgba(190, 207, 227, 0.70)",
    overflow: "hidden",
  },

  avatarPresetBtnActive: {
    borderColor: "rgba(250, 83, 147, 0.55)",
    backgroundColor: "rgba(250, 83, 147, 0.10)",
  },

  avatarPresetImg: {
    width: "100%",
    height: "100%",
  },

  avatarActions: {
    marginTop: 14,
  },
  actionContainer: {
    marginTop: 16,
    gap: 10,
  },

  logoutButton: {
    backgroundColor: "rgba(220, 53, 69, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(220, 53, 69, 0.35)",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "rgb(200,40,60)",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.3,
  },
};
