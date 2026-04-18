import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { apiFetch } from "../../../shared/api/http"; // igazítsd az útvonalat a projektedhez
import { colors } from "../../../../theme/colors";

export default function GoalsList() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/users/me/goals");
      setGoals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("Goals load error:", e?.message, e?.status, e?.data);
      Alert.alert("Hiba", e?.message ?? "Nem sikerült betölteni a célokat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const addGoal = async () => {
    const text = newGoal.trim();
    if (!text) return;

    setAdding(true);
    try {
      const created = await apiFetch("/users/me/goals", {
        method: "POST",
        body: { text },
      });
      setGoals((prev) => [...prev, created]);
      setNewGoal("");
    } catch (e) {
      console.log("Goal add error:", e?.message, e?.status, e?.data);
      Alert.alert("Hiba", e?.message ?? "Nem sikerült hozzáadni a célt.");
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = (goalId) => {
    Alert.alert("Törlés", "Biztosan törlöd ezt a célt?", [
      { text: "Mégse", style: "cancel" },
      { text: "Törlés", style: "destructive", onPress: () => deleteGoal(goalId) },
    ]);
  };

  const deleteGoal = async (goalId) => {
    try {
      await apiFetch(`/users/me/goals/${goalId}`, { method: "DELETE" });
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (e) {
      console.log("Goal delete error:", e?.message, e?.status, e?.data);
      Alert.alert("Hiba", e?.message ?? "Nem sikerült törölni.");
    }
  };

  const hasItems = useMemo(() => goals?.length > 0, [goals]);

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, index === 0 && styles.rowFirst]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowText} numberOfLines={2}>
          {item.text}
        </Text>
      </View>

      <Pressable
        onPress={() => confirmDelete(item.id)}
        hitSlop={12}
        style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
      >
        <Text style={styles.iconBtnText}>×</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Célok</Text>
        <Text style={styles.subtitle}>Rövid, konkrét motivációk</Text>
      </View>

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          value={newGoal}
          onChangeText={setNewGoal}
          placeholder="Új cél / motiváció..."
          placeholderTextColor={"rgba(74, 93, 122, 0.50)"}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={addGoal}
        />

        <Pressable
          onPress={addGoal}
          disabled={adding}
          style={({ pressed }) => [
            styles.addBtn,
            (pressed || adding) && styles.addBtnPressed,
          ]}
        >
          <Text style={styles.addBtnText}>{adding ? "…" : "+"}</Text>
        </Pressable>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ paddingVertical: 10 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={[styles.listWrap, !hasItems && styles.listWrapEmpty]}>
          <FlatList
            data={goals}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Még nincs célod. Adj hozzá egyet fent!
              </Text>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = {
  wrap: {
    gap: 10,
    marginTop: 14,
  },

  headerRow: {
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color:colors.textDark,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(53, 79, 110, 0.78)",
  },

  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(80, 126, 179, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.70)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(18, 34, 56, 0.92)",
  },

  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(80, 126, 179, 0.28)",
    backgroundColor: "rgba(80, 126, 179, 0.10)",
  },
  addBtnPressed: {
    opacity: 0.75,
  },
  addBtnText: {
    fontSize: 20,
    fontWeight: "900",
    color: "rgba(18, 34, 56, 0.86)",
    marginTop: -1,
  },

  // Lean list container (nem kártya, csak finom keret)
  listWrap: {
    borderWidth: 1,
    borderColor: "rgba(190, 207, 227, 0.60)",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  listWrapEmpty: {
    padding: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  rowFirst: {
    paddingTop: 14,
  },
  rowText: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(18, 34, 56, 0.90)",
    lineHeight: 18,
  },

  separator: {
    height: 1,
    backgroundColor: "rgba(190, 207, 227, 0.55)",
  },

  // Minimal delete button (nem dobozos “card”)
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(80, 126, 179, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(80, 126, 179, 0.16)",
  },
  iconBtnPressed: {
    opacity: 0.75,
  },
  iconBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "rgba(18, 34, 56, 0.75)",
    marginTop: -1,
  },

  emptyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(53, 79, 110, 0.75)",
  },
};