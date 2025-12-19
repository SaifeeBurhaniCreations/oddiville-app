import { useState } from "react";
import { BOTTOM_BAR_ITEMS } from "@/src/constants/BottomBar";
import { HStack } from "../layout/HStack";
import { BottomBarProps } from "@/src/types";
import { getColor } from "@/src/constants/colors";
import { VStack } from "../layout/VStack";
import { B4 } from "../typography/Typography";
import { Dimensions, StyleSheet, View } from "react-native";
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const {width: screenWidth } = Dimensions.get("screen");

const BottomBar: React.FC<BottomTabBarProps> = ({ navigation, state, variant }) => {
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [pressedTab, setPressedTab] = useState<string | null>(null);

    function renderBottombarItems(items: BottomBarProps) {
        return items.map((item, index) => {

        const isActive = state.routes[state.index]?.name === item.component;

            const isPressed = pressedTab === item.name;

            return (
                <View
                    key={item.name}
                    style={[styles.tabWrapper, isPressed && styles.pressedTab]}
                    onTouchStart={() => setPressedTab(item.name)}
                    onTouchEnd={() => {
                        setActiveTab(null)
                        navigation.navigate(item.component); 
                        setPressedTab(null);
                    }}
                >
                    <VStack gap={1} style={{ alignItems: "center" }}>
                        {isActive ? (
                            <HStack style={styles.activeIconWrapper}>
                                <item.activeIcon />
                            </HStack>
                        ) : (
                            <HStack style={styles.inactiveIconWrapper}>
                                <item.icon />
                            </HStack>
                        )}

                        <B4 color={getColor("green", isActive ? 500 : 700,)}>{item.name}</B4>
                    </VStack>
                </View>
            );
        });
    }

    return (
        <HStack
            w={"100%"}
            justify="between"
            style={{ height: screenWidth * 0.2, backgroundColor: getColor("light", 500), padding: 16 }}
        >
            {renderBottombarItems(BOTTOM_BAR_ITEMS)}
        </HStack>
    );
};

export default BottomBar;

const styles = StyleSheet.create({
    tabWrapper: {
        flex: 1,
        height: screenWidth * 0.2,
        alignItems: "center",
        justifyContent: "center",
    },
    pressedTab: {
        opacity: 0.7,
    },
    activeIconWrapper: {
        backgroundColor: getColor("green", 100),
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        paddingHorizontal: 20,
    },
    inactiveIconWrapper: {
        backgroundColor: "transparent",
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 20,
    },
});
