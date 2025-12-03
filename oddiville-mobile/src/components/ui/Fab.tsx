import PlusIcon from "@/src/components/icons/page/PlusIcon";
import { FabProps } from "@/src/types";
import { getColor } from "@/src/constants/colors";
import { StyleSheet, View, TouchableOpacity, Animated, Dimensions, Pressable } from "react-native";
import {  useEffect, memo } from "react";
import { FAB_ITEMS } from "@/src/constants/FabItems";
import { B3 } from "../typography/Typography";
import { useDispatch, useSelector } from "react-redux";
import { closeFab, toggleFab } from "@/src/redux/slices/fab.Slice";
import { RootState } from "@/src/redux/store";
import { useMemoizedStyle } from "@/src/hooks/useMemoizedStyle";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";

const { width: screenWidth } = Dimensions.get("window")
const Fab = ({ position, color }: FabProps) => {
    const dispatch = useDispatch()
    const { isOpen } = useSelector((state: RootState) => state.fab)

    const fadeAnim = new Animated.Value(0);
    const translateY = new Animated.Value(10);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: isOpen ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        Animated.timing(translateY, {
            toValue: isOpen ? 0 : 10,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isOpen]);

    const rotateStyle = useMemoizedStyle(
        {
            transform: [{ rotate: isOpen ? "45deg" : "0deg" }],
        },
        [isOpen]
    );

    const { goTo } = useAppNavigation();

    const fabButtonStyle = useMemoizedStyle(
        {
            backgroundColor: isOpen
                ? getColor("light", 500)
                : getColor(color, 500),
            ...(isOpen ? styles.activeShadow : styles.inactiveShadow),
        },
        [isOpen, color]
    );

    return (
        <View style={styles.container}>
            {isOpen && (
                <Animated.View
                    style={[
                        styles.fabContainer,
                        { opacity: fadeAnim, transform: [{ translateY }] }
                    ]}
                >
                    {FAB_ITEMS.map((item, index) => {
                        const scale = new Animated.Value(1);

                        const handlePressIn = () => {
                            Animated.spring(scale, {
                                toValue: 1,
                                useNativeDriver: true,
                            }).start();
                        };

                        const handlePressOut = () => {
                            Animated.spring(scale, {
                                toValue: 1,
                                friction: 3,
                                tension: 40,
                                useNativeDriver: true,
                            }).start();
                        };

                        return (
                            <Animated.View key={index} style={[styles.fabItemsContainer, { transform: [{ scale }] }]}>
                                <Pressable
                                    onPressIn={handlePressIn}
                                    onPress={()=> {
                                        goTo(item.href);
                                        dispatch(closeFab())
                                    }}
                                    onPressOut={handlePressOut}
                                    style={styles.fabItem}
                                >
                                    <item.icon color={getColor(color, 500)} size={24} />
                                    <B3 color={getColor(color, 700)}>{item.text}</B3>
                                </Pressable>
                            </Animated.View>
                        );
                    })}

                </Animated.View>
            )}

            {/* Floating Action Button (FAB) */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    dispatch(toggleFab(!isOpen))
                }}
                style={[
                    styles.fab,
                    fabButtonStyle,
                    position === "left" ? styles.left : styles.right
                ]}
            >
                <View style={rotateStyle}>
                    <PlusIcon color={isOpen ? getColor(color, 500) : getColor("light", 500)} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default memo(Fab);

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 96,
        right: 0,
        alignItems: "center",
    },

    fabContainer: {
        width: screenWidth * 0.5,
        position: "absolute",
        bottom: 52,
        right: 16,
        alignItems: "center",
    },
    fabItem: {
        backgroundColor: getColor("light"),
        flexDirection: "row",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 50,
        marginBottom: 12,
        shadowColor: "rgba(10, 73, 59, 0.20)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,// Android shadow
    },

    /* ✅ FAB Styles */
    fab: {
        borderRadius: 50,
        padding: 16,
    },
    left: {
        left: 12,
    },
    right: {
        right: 12,
    },

    inactiveShadow: {
        shadowColor: "rgba(10, 73, 59, 0.20)",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    activeShadow: {
        shadowColor: "rgba(10, 73, 59, 0.40)",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    fabItemsContainer: {
        flexDirection: "row",
         alignSelf: "flex-end"
    }
});
