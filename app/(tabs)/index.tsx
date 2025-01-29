import { FlatList, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/cn";
import {
  GoogleOneTapSignIn,
  statusCodes,
  type OneTapUser,
} from "@react-native-google-signin/google-signin";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function TabOneScreen() {
  return (
    <View className="px-4 items-center justify-center flex-1">
      <LinearGradient colors={["#fff", "#F5F5F5"]} style={styles.background} />
      <Text className="text-2xl font-semibold self-start py-4">
        Good morning, Galo!
      </Text>

      <ProgressIndicators />
      <WeekIndicator />

      <Text className="text-primary font-bold text-2xl self-start pt-8 pl-3">
        Tuesday, August 10
      </Text>
      <FlatList
        className="w-full pt-5"
        data={[
          { id: 1, label: "Daily declutter" },
          { id: 2, label: "Open mail", category: "Entryway" },
          { id: 3, label: "Make coffee", category: "Kitchen" },
          { id: 4, label: "Walk the dog", category: "Pet" },
          { id: 5, label: "Clean bathroom", category: "Bathroom" },
        ]}
        renderItem={({ item }) => (
          <View className="bg-background rounded-xl p-4 flex-row items-center gap-2 w-full">
            <BouncyCheckbox
              size={25}
              fillColor="#50C878"
              unFillColor="#FFFFFF"
              textComponent={
                <View className="justify-center items-start pl-4 w-full">
                  <Text className="text-lg font-medium">{item.label}</Text>
                  {item.category && (
                    <Text className="text-sm">{item.category}</Text>
                  )}
                </View>
              }
              iconStyle={{ borderColor: "#50C878" }}
              innerIconStyle={{ borderWidth: 2 }}
              onPress={(isChecked: boolean) => {
                console.log(isChecked);
              }}
            />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="gap-4 w-full pb-4"
      />
    </View>
  );
}

function ProgressIndicators() {
  return (
    <View className="flex-row w-full justify-between px-2">
      <View className="bg-sky-200 rounded-3xl items-center justify-center aspect-square p-6 gap-1">
        <View className="items-center">
          <Text className="text-lg font-medium">Daily</Text>
          <Text className="text-lg font-medium">Progress</Text>
        </View>
        <Text className="font-bold text-2xl">100%</Text>
      </View>
      <View className="bg-green-200 rounded-3xl items-center justify-center aspect-square p-6 gap-1">
        <View className="items-center">
          <Text className="text-lg font-medium">Weekly</Text>
          <Text className="text-lg font-medium">Progress</Text>
        </View>
        <Text className="font-bold text-2xl">100%</Text>
      </View>
      <View className="bg-red-200 rounded-3xl items-center justify-center aspect-square p-6 gap-1">
        <View className="items-center">
          <Text className="text-lg font-medium">Declutter</Text>
          <Text className="text-lg font-medium">Streak</Text>
        </View>
        <Text className="font-bold text-2xl">10</Text>
      </View>
    </View>
  );
}

function WeekIndicator() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const date = new Date();
  const currentDay = date.getDay();

  return (
    <View className="flex-row w-full justify-between pt-8">
      {days.map((day, index) => (
        <View
          key={index}
          className={cn(
            "bg-green-200 justify-center items-center aspect-square h-8 rounded-md",
            {
              "bg-primary": index === currentDay,
            }
          )}
        >
          <Text
            className={cn("font-semibold", {
              "text-primary-foreground": index === currentDay,
            })}
          >
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
});
