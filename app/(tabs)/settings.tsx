import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";

// Handler notifikasi
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function SettingsScreen() {
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // ===============================
  // LOAD + REQUEST PERMISSION
  // ===============================
  useEffect(() => {
    const init = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin notifikasi ditolak");
        return;
      }

      const saved = await AsyncStorage.getItem("reminderTime");
      if (saved) setReminderTime(new Date(saved));
    };

    init();
  }, []);

  // ===============================
  // SIMPAN & JADWALKAN NOTIFIKASI
  // ===============================
  const saveReminderTime = async (date: Date) => {
    setReminderTime(date);
    await AsyncStorage.setItem("reminderTime", date.toISOString());

    // Hapus semua notif lama
    await Notifications.cancelAllScheduledNotificationsAsync();

    // ===============================
    // HITUNG WAKTU NEXT TRIGGER
    // ===============================
    const now = new Date();
    const triggerDate = new Date();

    triggerDate.setHours(date.getHours());
    triggerDate.setMinutes(date.getMinutes());
    triggerDate.setSeconds(0);

    // kalau jam sudah lewat → BESOK
    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    // ===============================
    // SCHEDULE NOTIFICATION
    // ===============================
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Habix ⏰",
        body: "Jangan lupa cek habit hari ini 💪",
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        year: triggerDate.getFullYear(),
        month: triggerDate.getMonth() + 1,
        day: triggerDate.getDate(),
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
      },
    });

    Alert.alert(
      "Pengingat Aktif",
      `Notifikasi akan berbunyi setiap hari jam ${date
        .toLocaleTimeString()
        .slice(0, 5)}`
    );
  };

  // ===============================
  // RESET DATA
  // ===============================
  const resetAll = () => {
    Alert.alert(
      "Reset Semua Data?",
      "Semua habit dan pengaturan akan dihapus.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            await Notifications.cancelAllScheduledNotificationsAsync();
            Alert.alert("Data berhasil direset");
          },
        },
      ]
    );
  };

  // ===============================
  // UI
  // ===============================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: COLORS.gold, fontSize: 28, fontWeight: "bold" }}>
          Settings
        </Text>

        <Text style={{ color: COLORS.goldLight, marginTop: 20 }}>
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
            marginTop: 10,
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
            onChange={(_, selected) => {
              setShowPicker(false);
              if (selected) saveReminderTime(selected);
            }}
          />
        )}

        <TouchableOpacity
          onPress={resetAll}
          style={{
            backgroundColor: "#FF3B30",
            padding: 16,
            borderRadius: 14,
            marginTop: 40,
          }}
        >
          <Text style={{ color: "#000", fontWeight: "bold", textAlign: "center" }}>
            Reset Semua Data
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
