import CustomTabBar from "@/src/components/ui/BottomBar";
import { Tabs } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";

export default function TabLayout() {
  const { width } = Dimensions.get("window");
  const isSmallDevice = width <= 360; // ✅ small phones

  return (
    <Tabs
      tabBar={(props: any) => <CustomTabBar {...props} variant="admin" />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: isSmallDevice ? "Home" : "Home",
        }}
      />

      <Tabs.Screen
        name="purchase"
        options={{
          title: "Purchase",
          tabBarLabel: isSmallDevice ? "Buy" : "Purchase",
        }}
      />

      <Tabs.Screen
        name="production"
        options={{
          title: "Production",
          tabBarLabel: isSmallDevice ? "Prod" : "Production",
        }}
      />

      <Tabs.Screen
        name="package"
        options={{
          title: "Package",
          tabBarLabel: isSmallDevice ? "Pack" : "Package",
        }}
      />

      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          tabBarLabel: isSmallDevice ? "Sales" : "Sales",
        }}
      />
    </Tabs>
  );
}
