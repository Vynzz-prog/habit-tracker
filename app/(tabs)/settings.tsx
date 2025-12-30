import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";

// Handler hanya untuk memastikan notifikasi tampil
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function SettingsScreen() {
  const [reminderTime, setReminderTime] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const saved = await AsyncStorage.getItem("reminderTime");
      if (saved) setReminderTime(new Date(saved));
    };
    loadData();
  }, []);

  const saveReminderTime = async (date: Date) => {
    setReminderTime(date);
    await AsyncStorage.setItem("reminderTime", date.toISOString());
    Alert.alert("Waktu pengingat disimpan!\n\n(Notifikasi jadwal hanya aktif setelah build APK)");
  };

  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Tes Notifikasi",
        body: "Ini contoh notifikasi dari aplikasi Hobia.",
      },
      trigger: null, // langsung tampil
    });
  };

  const resetAll = () => {
    Alert.alert(
      "Reset Semua Data?",
      "Semua habit, arsip, dan settings akan dihapus permanen.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert("Data berhasil direset!");
          },
        },
      ]
    );
  };

  return (
  <SafeAreaView
    edges={["top"]}
    style={{ flex: 1, backgroundColor: COLORS.background }}
  >
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: COLORS.gold, fontSize: 28, fontWeight: "bold", marginBottom: 30 }}>
        Settings
      </Text>

      {/* Waktu Pengingat */}
      <Text style={{ color: COLORS.goldLight, fontSize: 20, marginBottom: 10 }}>
        Waktu Pengingat
      </Text>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          backgroundColor: COLORS.card,
          padding: 16,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: COLORS.gold,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: COLORS.gold, fontSize: 18 }}>
          {reminderTime.toLocaleTimeString().slice(0, 5)}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          display="spinner"
          onChange={(event, selected) => {
            setShowPicker(false);
            if (selected) saveReminderTime(selected);
          }}
        />
      )}

      {/* Tes Notifikasi */}
      <TouchableOpacity
        onPress={sendTestNotification}
        style={{
          backgroundColor: COLORS.card,
          padding: 16,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: COLORS.gold,
          marginBottom: 30,
        }}
      >
        <Text style={{ color: COLORS.gold }}>Tes Notifikasi</Text>
      </TouchableOpacity>

      {/* Reset */}
      <TouchableOpacity
        onPress={resetAll}
        style={{ backgroundColor: "#FF3B30", padding: 16, borderRadius: 14, marginBottom: 25 }}
      >
        <Text style={{ color: "#000", fontWeight: "bold", textAlign: "center" }}>
          Reset Semua Data
        </Text>
      </TouchableOpacity>

      {/* Tentang */}
      <View
        style={{
          backgroundColor: COLORS.card,
          padding: 16,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: COLORS.gold,
        }}
      >
        <Text style={{ color: COLORS.textSecondary }}>
          Hobia — Habit Tracker Premium {"\n"}
          Versi 1.0.0 {"\n"}
          Dibuat dengan React Native + Expo
        </Text>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}
