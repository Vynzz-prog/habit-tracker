import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";

type CompletedMap = { [key: string]: boolean };
type HistoryMap = { [date: string]: CompletedMap };

export default function ArchiveDetailScreen() {
  const { id, title } = useLocalSearchParams<{
    id: string;
    title: string;
  }>();

  const [history, setHistory] = useState<HistoryMap>({});

  // ==================================================
  // LOAD HISTORY (READ-ONLY)
  // ==================================================
  useEffect(() => {
    const load = async () => {
      const h = await AsyncStorage.getItem("history");
      if (h) setHistory(JSON.parse(h));
    };
    load();
  }, []);

  // ==================================================
  // BUILD DATA
  // ==================================================
  const entries = Object.keys(history)
    .sort()
    .map((date) => ({
      date,
      done: history[date]?.[id] ?? false,
    }));

  const success = entries.filter((e) => e.done).length;
  const percent =
    entries.length === 0
      ? 0
      : Math.round((success / entries.length) * 100);

  // ==================================================
  // UI
  // ==================================================
  return (
    <>
    
      <Stack.Screen
        options={{
          title: title || "Detail Habit",
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.gold,
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* JUDUL */}
          <Text
            style={{
              color: COLORS.gold,
              fontSize: 26,
              fontWeight: "bold",
              marginBottom: 6,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: COLORS.goldLight,
              marginBottom: 20,
            }}
          >
            Konsistensi: {percent}%
          </Text>

          {/* MINI BAR PROGRESS */}
          <View
            style={{
              flexDirection: "row",
              marginBottom: 24,
              alignItems: "flex-end",
            }}
          >
            {entries.map((e, i) => (
              <View
                key={i}
                style={{
                  width: 14,
                  height: e.done ? 60 : 20,
                  backgroundColor: e.done
                    ? COLORS.gold
                    : COLORS.card,
                  marginRight: 6,
                  borderRadius: 4,
                }}
              />
            ))}
          </View>

          {/* DETAIL PER TANGGAL */}
          {entries.map((e, i) => (
            <View
              key={i}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.card,
              }}
            >
              <Text style={{ color: COLORS.text }}>
                {e.date}: {e.done ? "1/1 ✅" : "0/1 ❌"}
              </Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
