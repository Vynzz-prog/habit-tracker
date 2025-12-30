import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { COLORS } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // MATIKAN HEADER DEFAULT AGAR (tabs) HILANG
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.gold,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox" color={color} size={size} />
          ),
        }}
      />

      {/* STATISTIK */}
      <Tabs.Screen
        name="stats"
        options={{
          title: "Statistik",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" color={color} size={size} />
          ),
        }}
      />

      {/* ARSIP */}
      <Tabs.Screen
        name="archive"
        options={{
          title: "Arsip",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="archive" color={color} size={size} />
          ),
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
