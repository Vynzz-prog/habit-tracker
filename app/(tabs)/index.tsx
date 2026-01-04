import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HabitCard from "../../components/HabitCard";
import { COLORS } from "../../constants/theme";

type Habit = { id: string; title: string };
type CompletedMap = { [key: string]: boolean };
type HistoryMap = { [date: string]: CompletedMap };

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [completed, setCompleted] = useState<CompletedMap>({});
  const [history, setHistory] = useState<HistoryMap>({});
  const [lastReset, setLastReset] = useState<string>("");

  // EDIT STATE
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editText, setEditText] = useState("");

  const todayKey = new Date().toISOString().split("T")[0];

  // ==================================================
  // LOAD DATA
  // ==================================================
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const h = await AsyncStorage.getItem("habits");
        const c = await AsyncStorage.getItem("completed");
        const hs = await AsyncStorage.getItem("history");
        const r = await AsyncStorage.getItem("lastReset");

        setHabits(h ? JSON.parse(h) : []);
        setCompleted(c ? JSON.parse(c) : {});
        setHistory(hs ? JSON.parse(hs) : {});

        const today = new Date().toDateString();
        if (!r) {
          setLastReset(today);
          await AsyncStorage.setItem("lastReset", today);
        } else {
          setLastReset(r);
        }
      };

      load();
    }, [])
  );

  // ==================================================
  // RESET HARIAN
  // ==================================================
  useEffect(() => {
    if (!lastReset) return;

    const today = new Date().toDateString();
    if (today !== lastReset) {
      const newHistory = { ...history, [todayKey]: completed };
      setHistory(newHistory);
      AsyncStorage.setItem("history", JSON.stringify(newHistory));

      setCompleted({});
      AsyncStorage.setItem("completed", JSON.stringify({}));

      setLastReset(today);
      AsyncStorage.setItem("lastReset", today);
    }
  }, [lastReset]);

  // ==================================================
  // ADD HABIT
  // ==================================================
  const addHabit = async () => {
    if (!newHabit.trim()) return;

    const newData = [
      ...habits,
      { id: Date.now().toString(), title: newHabit },
    ];

    setHabits(newData);
    await AsyncStorage.setItem("habits", JSON.stringify(newData));
    setNewHabit("");
  };

  // ==================================================
  // TOGGLE
  // ==================================================
  const toggleHabit = async (id: string) => {
    const updated = { ...completed, [id]: !completed[id] };
    setCompleted(updated);
    await AsyncStorage.setItem("completed", JSON.stringify(updated));

    const newHistory = { ...history, [todayKey]: updated };
    setHistory(newHistory);
    await AsyncStorage.setItem("history", JSON.stringify(newHistory));
  };

  // ==================================================
  // DELETE
  // ==================================================
  const deleteHabit = async (id: string) => {
    const newHabits = habits.filter((h) => h.id !== id);
    setHabits(newHabits);
    await AsyncStorage.setItem("habits", JSON.stringify(newHabits));
  };

  // ==================================================
  // SAVE EDIT
  // ==================================================
  const saveEdit = async () => {
    if (!editingHabit || !editText.trim()) return;

    const updated = habits.map((h) =>
      h.id === editingHabit.id ? { ...h, title: editText } : h
    );

    setHabits(updated);
    await AsyncStorage.setItem("habits", JSON.stringify(updated));

    setEditingHabit(null);
    setEditText("");
  };

  // ==================================================
  // UI
  // ==================================================
  const total = habits.length;
  const done = Object.values(completed).filter(Boolean).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: COLORS.gold, fontSize: 28, fontWeight: "bold" }}>
          Habit Saya
        </Text>

        <Text style={{ color: COLORS.goldLight, marginBottom: 20 }}>
          {done}/{total} selesai hari ini ({percent}%)
        </Text>

        <FlatList
          data={habits}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <HabitCard
              item={item}
              completed={!!completed[item.id]}
              onToggle={() => toggleHabit(item.id)}
              onDelete={() => deleteHabit(item.id)}
              onEdit={() => {
                setEditingHabit(item);
                setEditText(item.title);
              }}
            />
          )}
        />

        {/* INPUT TAMBAH */}
        <View style={{
          position: "absolute",
          bottom: 110,
          left: 20,
          right: 20,
          backgroundColor: COLORS.card,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: COLORS.gold,
        }}>
          <TextInput
            value={newHabit}
            onChangeText={setNewHabit}
            placeholder="Tambah Habit…"
            placeholderTextColor={COLORS.textSecondary}
            style={{ color: COLORS.text }}
          />
        </View>

        {/* FAB */}
        <TouchableOpacity
          onPress={addHabit}
          style={{
            position: "absolute",
            bottom: 36,
            right: 26,
            backgroundColor: COLORS.gold,
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="add" size={32} color={COLORS.background} />
        </TouchableOpacity>

        {/* 🔥 EDIT MODAL */}
        {editingHabit && (
          <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#000000AA",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.card,
                padding: 20,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: COLORS.gold,
              }}
            >
              <Text style={{ color: COLORS.gold, fontSize: 20, marginBottom: 12 }}>
                Edit Habit
              </Text>

              <TextInput
                value={editText}
                onChangeText={setEditText}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gold,
                  borderRadius: 10,
                  padding: 12,
                  color: COLORS.text,
                  marginBottom: 16,
                }}
              />

              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity onPress={() => setEditingHabit(null)}>
                  <Text style={{ color: COLORS.textSecondary, marginRight: 20 }}>
                    Batal
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={saveEdit}>
                  <Text style={{ color: COLORS.gold, fontWeight: "bold" }}>
                    Simpan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
