import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";

type Habit = { id: string; title: string };
type CompletedMap = { [key: string]: boolean };


const DEBUG_FORCE_ARCHIVE = false;

export default function ArchiveScreen() {
  const [archived, setArchived] = useState<Habit[]>([]);

  // ==================================================
  // HITUNG & LOAD ARSIP (READ ONLY)
  // ==================================================
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const habits: Habit[] = JSON.parse(
          (await AsyncStorage.getItem("habits")) || "[]"
        );

        const history: Record<string, CompletedMap> = JSON.parse(
          (await AsyncStorage.getItem("history")) || "{}"
        );

        const archivedStored: Habit[] = JSON.parse(
          (await AsyncStorage.getItem("archived")) || "[]"
        );

        const result: Habit[] = [...archivedStored];

        habits.forEach((habit) => {
          let completedDays = 0;

          for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split("T")[0];
            if (history[key]?.[habit.id]) completedDays++;
          }

          const shouldArchive =
            DEBUG_FORCE_ARCHIVE || completedDays >= 7;

          if (shouldArchive && !result.find((h) => h.id === habit.id)) {
            result.push(habit);
          }
        });

        setArchived(result);
        await AsyncStorage.setItem("archived", JSON.stringify(result));
      };

      load();
    }, [])
  );

  const unArchive = async (habit: Habit) => {
    const updated = archived.filter((h) => h.id !== habit.id);
    setArchived(updated);
    await AsyncStorage.setItem("archived", JSON.stringify(updated));
  };

  // ==================================================
  // UI
  // ==================================================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            color: COLORS.gold,
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 10,
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
          <TouchableOpacity
            key={habit.id}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/archive/[id]",
                params: {
                  id: habit.id,
                  title: habit.title,
                },
              })
            }
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
            <Text style={{ color: COLORS.text, fontSize: 16 }}>
              {habit.title}
            </Text>

            <TouchableOpacity
              onPress={() => unArchive(habit)}
              style={{
                backgroundColor: COLORS.gold,
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: COLORS.background,
                  fontWeight: "bold",
                }}
              >
                Keluarkan
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
