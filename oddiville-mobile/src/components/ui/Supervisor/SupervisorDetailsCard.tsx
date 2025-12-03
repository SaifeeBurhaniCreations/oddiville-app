import { getColor } from '@/src/constants/colors'
import { StyleSheet, View } from 'react-native'
import { B4, C1, H3, H6 } from '../../typography/Typography'
import { OrderReceiverDetailsCardProps } from '@/src/types'
import React from 'react'
import Tag from '../Tag'

const SupervisorDetailsCard = ({ title, address, detail, otherDetails, helperDetails, badge }: OrderReceiverDetailsCardProps) => {
    return (
        <View style={styles.cardWrapper}>
            <View style={styles.card}>
                <View>
                    <View style={[styles.HStack, styles.JustifyBetween, styles.alignCenter]}>
                        <H3>{title}</H3>
                        {badge && <Tag color={"red"} size="md" icon={badge?.icon}>{badge?.text}</Tag>}
                    </View>

                    <C1 color={getColor("green", 400)}>{address}</C1>
                </View>
                <View style={styles.cardDetails}>
                    {detail.icon}
                    <View style={[styles.HStack, styles.gap4]}>
                        <H6 color={getColor("green", 700)}>{detail.name}:</H6>
                        <B4 color={getColor("green", 700)}>{detail.value}</B4>
                    </View>
                </View>
                <View style={styles.cardExtraDetails}>
                    {otherDetails.map((detail, index) => (
                        <React.Fragment key={index}>
                            <View style={[styles.HStack, styles.gap6, styles.alignCenter]}>
                                {detail.icon}
                                <View style={[styles.HStack, styles.gap4]}>
                                    <H6 color={getColor("green", 700)}>{detail.name}:</H6>
                                    <B4 color={getColor("green", 700)}>{detail.value}</B4>
                                </View>
                            </View>
                            {otherDetails && index !== otherDetails?.length - 1 && <View style={styles.seprator} />}
                        </React.Fragment>
                    ))}
                </View>
            </View>
            <View style={[styles.HStack, styles.gap8, styles.alignCenter, styles.paddingVertical8, styles.paddingHorizontal12]}>
                {helperDetails?.map((hdetail, index) => (
                    <React.Fragment key={index}>
                        <View style={[styles.HStack, styles.gap4]}>
                            <H6 color={getColor("light")}>{hdetail.name}:</H6>
                            <B4 color={getColor("light")}>{hdetail.value}</B4>
                        </View>
                        {index !== helperDetails?.length - 1 && <View style={styles.seprator} />}
                    </React.Fragment>
                ))}
            </View>
        </View>
    )
}

export default SupervisorDetailsCard

const styles = StyleSheet.create({
    cardWrapper: {
        backgroundColor: getColor("green"),
        borderRadius: 16,
        elevation: 2,
    },
    card: {
        flexDirection: "column",
        gap: 12,
        backgroundColor: getColor("light"),
        padding: 12,
        borderRadius: 16,
    },
    cardDetails: {
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 100),
        paddingBottom: 12,
    },
    cardExtraDetails: {
        flexDirection: "row",
        gap: 12,
    },
    HStack: {
        flexDirection: "row",
    },
    gap4: {
        gap: 4,
    },
    alignCenter: {
        alignItems: "center"
    },
    gap6: {
        gap: 6,
    },
    gap8: {
        gap: 8,
    },
    JustifyBetween: {
        justifyContent: "space-between",
    },
    paddingVertical8: {
        paddingVertical: 8
    },
    paddingHorizontal12: {
        paddingHorizontal: 12,
    },
    seprator: {
        width: 1,
        height: "100%",
        backgroundColor: getColor("green", 100),
        borderRadius: 1
    }
})