import { useAuth } from "@/src/context/AuthContext";
import Loader from "../ui/Loader";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useRoute } from '@react-navigation/native';
import BottomBar from "@/src/components/ui/BottomBar";
import { AdminTabLayout, SupervisorTabLayout } from "@/src/components/layout/Layouts";
import React from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { getColor } from "@/src/constants/colors";
import HomeScreen from "@/src/screens/HomeScreen";
import ChamberScreen from "@/src/screens/ChamberScreen";
import OrderScreen from "@/src/screens/DispatchOrder/OrderScreen";
import ProductionScreen from "@/src/screens/ProductionScreen";

import SupervisorOrderScreen from "@/src/screens/supervisor/SupervisorOrderScreen";
import SupervisorRawMaterialScreen from "@/src/screens/supervisor/SupervisorRawMaterialScreen";
import SupervisorProductionScreen from "@/src/screens/supervisor/SupervisorProductionScreen";
import SupervisorContractorScreen from "@/src/screens/supervisor/SupervisorContractorScreen";

const Tab = createBottomTabNavigator();

function MainTabs({ role }: { role: "superadmin" | "admin" | "supervisor" }) {
    const route = useRoute();

    const tabScreen = route?.params?.screen;

    const initialTab = tabScreen || (role === "admin" || role === "superadmin" ? "Home" : "SuperRawMaterial");

    if (role === "superadmin" || role === "admin") {
        return (
            <Tab.Navigator tabBar={(props: BottomTabBarProps & { variant: "admin" | "supervisor" | "default" }) => <BottomBar {...props} variant="admin" />} initialRouteName={initialTab}>
                <Tab.Screen
                    name="Home"
                    options={{ headerShown: false }}
                >
                    {() => (
                        <AdminTabLayout>
                            <HomeScreen />
                        </AdminTabLayout>
                    )}
                </Tab.Screen>
                <Tab.Screen
                    name="Orders"
                    options={{ headerShown: false }}
                >
                    {() => (
                        <AdminTabLayout>
                            <OrderScreen />
                        </AdminTabLayout>
                    )}
                </Tab.Screen>
                <Tab.Screen
                    name="Chamber"
                    options={{ headerShown: false }}
                >
                    {() => (
                        <AdminTabLayout>
                            <ChamberScreen />
                        </AdminTabLayout>
                    )}
                </Tab.Screen>
                <Tab.Screen
                    name="x"
                    options={{ headerShown: false }}
                >
                    {() => (
                        <AdminTabLayout>
                            <ProductionScreen />
                        </AdminTabLayout>
                    )}
                </Tab.Screen>
            </Tab.Navigator>
        );
    } else {
        return (
            <Tab.Navigator tabBar={(props: BottomTabBarProps & { variant: "admin" | "supervisor" | "default" }) => <BottomBar {...props} variant="supervisor" />} initialRouteName={initialTab}>
                <Tab.Screen
                    name="SuperRawMaterial"
                    options={{ headerShown: false }}
                >
                    {() => (
                        <SupervisorTabLayout>
                            <SupervisorRawMaterialScreen />
                        </SupervisorTabLayout>
                    )}
                </Tab.Screen>
                <Tab.Screen
                    name="SuperOrder"
                    options={{ headerShown: false }}
                >
                    {() => (
                        <SupervisorTabLayout>
                            <SupervisorOrderScreen />
                        </SupervisorTabLayout>
                    )}
                </Tab.Screen>
                <Tab.Screen
                    name="SuperProduction"
                    options={{ headerShown: false }}
                >
                    {() => (
                        <SupervisorTabLayout>
                            <SupervisorProductionScreen />
                        </SupervisorTabLayout>
                    )}
                </Tab.Screen>
                <Tab.Screen
                    name="SuperContractor"
                    options={{ headerShown: false }}
                >
                    {() => (
                        <SupervisorTabLayout>
                            <SupervisorContractorScreen />
                        </SupervisorTabLayout>
                    )}
                </Tab.Screen>

            </Tab.Navigator>
        )
    }
}
function MainTabsFromContext() {
    const { role } = useAuth();

    if (!role) return <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
            <Loader />
        </View>
    </View>;
    return <MainTabs role={role} />;
}

export default MainTabsFromContext;

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.05),
        zIndex: 2,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})