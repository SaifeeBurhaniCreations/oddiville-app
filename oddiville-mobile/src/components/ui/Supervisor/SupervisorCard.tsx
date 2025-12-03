import { StyleSheet, TouchableOpacity, View } from "react-native";
import { getColor } from "@/src/constants/colors";
import { B6, C1, H2, H6 } from "../../typography/Typography";
import { SupervisorOrderCardProps } from "@/src/types";
import CtaButton from "../Buttons/CtaButton";
import { findCtaText } from "@/src/utils/common";
import React from "react";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

const SupervisorCard = ({ order, color = "yellow", bgSvg: BgSvg, isEdit }: SupervisorOrderCardProps) => {
    const { goTo } = useAppNavigation()
    const { validateAndSetData } = useValidateAndOpenBottomSheet();
    
    const handleOpen = () => {
        if(!order) return;
        // @ts-ignore
        if(order.status === "completed" && order?.id) {
            order.identifier && order.identifier !== undefined && validateAndSetData( order?.id, order.identifier)
        } else if(order.href && order?.id) {
            goTo(order.href, { rmId: order?.id })
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handleOpen} activeOpacity={0.7}>
            {BgSvg && (<BgSvg style={styles.cardBackgroundImage} />)}
            <View style={styles.card}>
                <View style={styles.cardHeaderContent}>
                    <View style={styles.cardHeader}>
                        <H2 color={getColor(color, 700)}>{order.title}</H2>
                        {order.helperDetails?.map((helperDetail, index) => (
                            <View key={index} style={[styles.HStack, styles.gap6, styles.alignCenter]}>
                                {helperDetail.icon}
                                <View style={[styles.HStack, styles.gap4]}>
                                    <B6 color={getColor(color, 700)}>{helperDetail.name}:</B6>
                                    <C1 color={getColor(color, 700)}>{helperDetail.value}</C1>
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={styles.hSeprator}>
                        <H6>{order.name}</H6>
                        {order.address && <C1 color={getColor("green", 700, 0.7)}>{order.address}</C1>}
                    </View>
                    <View style={styles.cardBody}>
                        {order?.details?.map((detail, index) => (
                            <React.Fragment key={index}>
                                <View style={[styles.HStack, styles.gap6, styles.alignCenter]}>
                                    {detail.icon}
                                    <View style={[styles.HStack, styles.gap4]}>
                                        <B6 color={getColor(color, 700)}>{detail.name}:</B6>
                                        <C1 color={getColor(color, 700)}>{detail.value}</C1>
                                    </View>
                                </View>
                                {order && order?.details && (index !== order?.details?.length - 1) && <View style={styles.seprator} />}
                            </React.Fragment>
                        ))}
                    </View>
                </View>
                {
                    order.buttons &&
                    <View style={styles.actionButtonsContainer}>
                        {order.buttons && order.buttons.map((text) => (
                            <CtaButton key={text} color={color}>{findCtaText(text)}</CtaButton>
                        ))}
                    </View>
                }
            </View>
        </TouchableOpacity>
    );
};

export default SupervisorCard;

const styles = StyleSheet.create({
    container: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: getColor("light", 500),
        borderRadius: 16,
        elevation: 2, // Android
        shadowColor: "#000", // iOS
    },
    card: {
        padding: 12,
        gap: 24,
        flexDirection: "column",

    },
    cardHeaderContent: {
        flexDirection: "column",
        gap: 8,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    cardHeaderTime: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    cardBody: {
        flexDirection: "row",
        gap: 12,
    },
    actionButtonsContainer: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    cardBackgroundImage: {
        position: "absolute",
        bottom: 0,
        right: 12,
        width: 120,
        height: 120,
        opacity: 0.3,
        zIndex: -1,
        resizeMode: "contain",
    },
    timeWithText: {
        flexDirection: "row",
        gap: 4,
    },
    HStack: {
        flexDirection: "row",
    },
    alignCenter: {
        alignItems: "center"
    },
    gap6: {
        gap: 6,
    },
    gap4: {
        gap: 4,
    },
    seprator: {
        width: 1,
        height: "100%",
        backgroundColor: getColor("green", 100),
        borderRadius: 1
    },
    hSeprator: {
        paddingTop: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 100),
    }
});
