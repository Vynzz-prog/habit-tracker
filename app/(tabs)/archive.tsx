import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";

type Habit = { id: string; title: string };
type CompletedMap = { [key: string]: boolean };
type HistoryMap = { [date: string]: CompletedMap };

export default function ArchiveScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [history, setHistory] = useState<HistoryMap>({});
  const [archived, setArchived] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --------------------------------------------------
  // LOAD all data
  // --------------------------------------------------
  useEffect(() => {
    const load = async () => {
      const hb = await AsyncStorage.getItem("habits");
      const hs = await AsyncStorage.getItem("history");
      const arc = await AsyncStorage.getItem("archived");

      if (hb) setHabits(JSON.parse(hb));
      if (hs) setHistory(JSON.parse(hs));
      if (arc) setArchived(JSON.parse(arc));

      setIsLoaded(true);
    };

    load();
  }, []);

  // --------------------------------------------------
  // CHECK & MOVE HABITS TO ARCHIVE
  // --------------------------------------------------
  useEffect(() => {
    if (!isLoaded) return;

    const newArchive: Habit[] = [...archived];
    const active: Habit[] = [];

    habits.forEach((habit) => {
      let streak = 0;

      // cek 7 hari terakhir
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];

        const todayHabits = history[key] || {};
        const doneToday = todayHabits[habit.id];

        if (doneToday) streak++;
      }

      // jika streak ≥ 7 → archive
      if (streak >= 7) {
        // pastikan belum masuk arsip
        const exist = newArchive.find((h) => h.id === habit.id);
        if (!exist) newArchive.push(habit);
      } else {
        active.push(habit);
      }
    });

    setArchived(newArchive);

    // update habits (remove archived)
    setHabits(active);

    AsyncStorage.setItem("habits", JSON.stringify(active));
    AsyncStorage.setItem("archived", JSON.stringify(newArchive));
  }, [history, isLoaded]);

  // --------------------------------------------------
  // UN-ARCHIVE HABIT
  // --------------------------------------------------
  const unArchive = (habit: Habit) => {
    const newArc = archived.filter((h) => h.id !== habit.id);
    const newActive = [...habits, habit];

    setArchived(newArc);
    setHabits(newActive);

    AsyncStorage.setItem("archived", JSON.stringify(newArc));
    AsyncStorage.setItem("habits", JSON.stringify(newActive));
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
  <SafeAreaView
    edges={["top"]}
    style={{ flex: 1, backgroundColor: COLORS.background }}
  >
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text
        style={{
          color: COLORS.gold,
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Arsip Habit
      </Text>

      {archived.length === 0 && (
        <Text style={{ color: COLORS.textSecondary }}>
          Belum ada habit yang diarsipkan.
        </Text>
      )}

      {archived.map((habit) => (
        <View
          key={habit.id}
          style={{
            backgroundColor: COLORS.card,
            padding: 16,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.gold,
            marginBottom: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: COLORS.text, fontSize: 18 }}>
            {habit.title}
          </Text>

          <TouchableOpacity
            onPress={() => unArchive(habit)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              backgroundColor: COLORS.gold,
              borderRadius: 8,
            }}
          >
            <Text
              style={{ color: COLORS.background, fontWeight: "bold" }}
            >
              Kembalikan
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);
}
