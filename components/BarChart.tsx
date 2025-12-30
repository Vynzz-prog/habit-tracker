import { View } from "react-native";
import { COLORS } from "../constants/theme";

type Props = {
  data: number[]; // 7 data: Sunday → Saturday
  max: number;
};

export default function BarChart({ data, max }: Props) {
  const todayIndex = new Date().getDay(); // 0 = Sunday, 6 = Saturday

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        alignItems: "flex-end",
      }}
    >
      {data.map((v: number, i: number) => {
        const height = max === 0 ? 0 : (v / max) * 100;
        const isToday = i === todayIndex;

        return (
          <View key={i} style={{ alignItems: "center" }}>
            <View
              style={{
                width: 20,
                height: 100,
                backgroundColor: COLORS.card,
                borderRadius: 6,
                overflow: "hidden",
                borderWidth: 1.5,
                borderColor: isToday ? COLORS.gold : COLORS.gold + "55",
                justifyContent: "flex-end",

                //Highlight hari ini
                shadowColor: isToday ? COLORS.gold : "transparent",
                shadowOpacity: isToday ? 0.9 : 0,
                shadowRadius: isToday ? 10 : 0,
                shadowOffset: { width: 0, height: 0 },
                elevation: isToday ? 10 : 0,
              }}
            >
              <View
                style={{
                  height,
                  backgroundColor: isToday ? COLORS.gold : COLORS.gold + "99",
                  width: "100%",
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
