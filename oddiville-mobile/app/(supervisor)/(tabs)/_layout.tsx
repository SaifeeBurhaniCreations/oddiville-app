import CustomTabBar from "@/src/components/ui/BottomBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props: any) => <CustomTabBar {...props} variant="supervisor" />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="supervisor-raw-material"
                options={{
                    title: "Raw Material",
                    tabBarLabel: "raw-material"
                }}
            />
            <Tabs.Screen
                name="supervisor-orders"
                options={{
                    title: "Orders",
                    tabBarLabel: "orders"
                }}
            />
            <Tabs.Screen
                name="supervisor-production"
                options={{
                    title: "Production",
                    tabBarLabel: "production"
                }}
            />
            <Tabs.Screen
                name="supervisor-contractor"
                options={{
                    title: "Contractor",
                    tabBarLabel: "contractor"
                }}
            />
        </Tabs>
    );
}