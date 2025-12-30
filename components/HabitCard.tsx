import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme";

type Habit = {
  id: string;
  title: string;
};

type HabitCardProps = {
  item: Habit;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
};

export default function HabitCard({
  item,
  completed,
  onToggle,
  onDelete,
  onEdit,
}: HabitCardProps) {
  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.gold,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* LEFT */}
      <TouchableOpacity
        onPress={onToggle}
        style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
      >
        <Ionicons
          name={completed ? "checkbox" : "square-outline"}
          size={26}
          color={COLORS.gold}
        />
        <Text
          style={{
            color: COLORS.text,
            fontSize: 18,
            marginLeft: 10,
          }}
        >
          {item.title}
        </Text>
      </TouchableOpacity>

      {/* RIGHT ACTIONS */}
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={onEdit} style={{ marginRight: 14 }}>
          <Ionicons name="pencil" size={22} color={COLORS.gold} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete}>
          <Ionicons name="trash" size={22} color="#FF4D4D" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
