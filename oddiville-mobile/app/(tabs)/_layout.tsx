import CustomTabBar from "@/src/components/ui/BottomBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
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
                    tabBarLabel: "home"
                }}
            />
            <Tabs.Screen
                name="purchase"
                options={{
                    title: "Purchase",
                    tabBarLabel: "purchase"
                }}
            />
            <Tabs.Screen
                name="production"
                options={{
                    title: "Production",
                    tabBarLabel: "production"
                }}
            />
            <Tabs.Screen
                name="package"
                options={{
                    title: "Package",
                    tabBarLabel: "package"
                }}
            />
            <Tabs.Screen
                name="sales"
                options={{
                    title: "Sales",
                    tabBarLabel: "sales"
                }}
            />
        </Tabs>
    );
}