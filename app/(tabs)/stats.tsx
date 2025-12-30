import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
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
  const [maxVal, setMaxVal] = useState(1);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------
  useEffect(() => {
    const load = async () => {
      const h = await AsyncStorage.getItem("history");
      const hb = await AsyncStorage.getItem("habits");

      if (h) setHistory(JSON.parse(h));
      if (hb) setHabits(JSON.parse(hb));
    };

    load();
  }, []);

  // --------------------------------------------------
  // BUILD WEEK (SUNDAY → SATURDAY)
  // --------------------------------------------------
  useEffect(() => {
    if (habits.length === 0) return;

    const data: number[] = [];

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);

    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);

      const key = d.toISOString().split("T")[0];
      const dayData = history[key] || {};
      const done = Object.values(dayData).filter(Boolean).length;

      data.push(done);
    }

    setChartData(data);
    setMaxVal(Math.max(...data, 1));
  }, [history, habits]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text
        style={{
          color: COLORS.gold,
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
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
        <BarChart data={chartData} max={maxVal} />

        {/* DAY LABELS */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
            paddingHorizontal: 5,
          }}
        >
          {DAY_LABELS.map((label, idx) => (
            <Text key={idx} style={{ color: COLORS.goldLight }}>
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
        const dayOfWeek = today.getDay();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - dayOfWeek);

        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        const textDate = d.toISOString().split("T")[0];

        return (
          <View
            key={i}
            style={{
              paddingVertical: 10,
              borderBottomColor: COLORS.card,
              borderBottomWidth: 1,
            }}
          >
            <Text style={{ color: COLORS.text }}>
              {textDate}: {value}/{habits.length}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
