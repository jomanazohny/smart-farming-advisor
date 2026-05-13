import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {

  return (

    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#2e7d32",

        tabBarInactiveTintColor: "#8e8e93",

        tabBarStyle: {
          backgroundColor: "#ffffff",

          borderTopWidth: 0,

          elevation: 10,

          shadowColor: "#000",

          shadowOffset: {
            width: 0,
            height: -2,
          },

          shadowOpacity: 0.1,

          shadowRadius: 10,

          height: Platform.OS === "ios"
            ? 88
            : 65,

          paddingBottom: Platform.OS === "ios"
            ? 30
            : 10,

          paddingTop: 10,
        },

        tabBarLabelStyle: {
          fontSize: 12,

          fontWeight: "600",

          fontFamily: Platform.OS === "ios"
            ? "System"
            : "sans-serif-medium",
        },
      }}
    >

      {/* HOME */}
      <Tabs.Screen
        name="index"

        options={{
          title: "الرئيسية",

          tabBarIcon: ({
            focused,
            color,
            size
          }) => (

            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }

              size={24}

              color={color}
            />
          ),
        }}
      />

      {/* DIAGNOSE */}
      <Tabs.Screen
        name="diagnose"

        options={{
          title: "التشخيص",

          tabBarIcon: ({
            focused,
            color,
            size
          }) => (

            <Ionicons
              name={
                focused
                  ? "scan"
                  : "scan-outline"
              }

              size={28}

              color={color}
            />
          ),
        }}
      />

      {/* CHATBOT */}
      <Tabs.Screen
        name="market"

        options={{
          title: "المستشار",

          tabBarIcon: ({
            focused,
            color,
            size
          }) => (

            <Ionicons
              name={
                focused
                  ? "chatbubbles"
                  : "chatbubbles-outline"
              }

              size={24}

              color={color}
            />
          ),
        }}
      />

      {/* HISTORY */}
      <Tabs.Screen
        name="history"

        options={{
          title: "السجل",

          tabBarIcon: ({
            focused,
            color,
            size
          }) => (

            <Ionicons
              name={
                focused
                  ? "time"
                  : "time-outline"
              }

              size={24}

              color={color}
            />
          ),
        }}
      />

    </Tabs>
  );
}