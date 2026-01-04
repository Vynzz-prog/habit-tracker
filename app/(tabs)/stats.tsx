import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BarChart from "../../components/BarChart";
import { COLORS } from "../../constants/theme";

type CompletedMap = { [key: string]: boolean };
type HistoryMap = { [date: string]: CompletedMap };
type Habit = { id: string; title: string };

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]; // Sunday → Saturday

export default function StatsScreen() {
  const [history, setHistory] = useState<HistoryMap>({});
  const [habits, setHabits] = useState<Habit[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);

  // LOAD DATA 
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const h = await AsyncStorage.getItem("history");
        const hb = await AsyncStorage.getItem("habits");

        const parsedHistory: HistoryMap = h ? JSON.parse(h) : {};
        const parsedHabits: Habit[] = hb ? JSON.parse(hb) : [];

        setHistory(parsedHistory);
        setHabits(parsedHabits);

        const totalHabits = parsedHabits.length;

        // ===============================
        // BUILD DATA MINGGU INI (PERSENTASE)
        // ===============================
        const data: number[] = [];

        const today = new Date();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - today.getDay());

        for (let i = 0; i < 7; i++) {
          const d = new Date(sunday);
          d.setDate(sunday.getDate() + i);
          const key = d.toISOString().split("T")[0];

          const done = Object.values(parsedHistory[key] || {}).filter(Boolean).length;
          const percent = totalHabits === 0 ? 0 : done / totalHabits;

          data.push(percent); 
        }

        setChartData(data);
      };

      load();
    }, [])
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            color: COLORS.gold,
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 10,
          }}
        >
          Statistik Mingguan
        </Text>

        <Text style={{ color: COLORS.textSecondary, marginBottom: 10 }}>
          Total Habit Aktif: {habits.length}
        </Text>

        {/* BAR CHART */}
        <View
          style={{
            backgroundColor: COLORS.card,
            padding: 20,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.gold,
          }}
        >
          <BarChart data={chartData} />

          {/* DAY LABEL */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            {DAY_LABELS.map((label, i) => (
              <Text key={i} style={{ color: COLORS.goldLight }}>
                {label}
              </Text>
            ))}
          </View>
        </View>

        {/* DETAIL */}
        <Text
          style={{
            color: COLORS.gold,
            fontSize: 20,
            fontWeight: "bold",
            marginTop: 30,
            marginBottom: 10,
          }}
        >
          Ringkasan Minggu Ini
        </Text>

        {chartData.map((value, i) => {
          const today = new Date();
          const sunday = new Date(today);
          sunday.setDate(today.getDate() - today.getDay());

          const d = new Date(sunday);
          d.setDate(sunday.getDate() + i);
          const dateKey = d.toISOString().split("T")[0];

          const done = Math.round(value * habits.length);

          return (
            <View
              key={i}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.card,
              }}
            >
              <Text style={{ color: COLORS.text }}>
                {dateKey}: {done}/{habits.length}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
