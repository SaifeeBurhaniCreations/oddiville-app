import { getColor } from '@/src/constants/colors'
import { ProductionCardProps } from '@/src/types'
import { StyleSheet, Text, View } from 'react-native'
import { B4, H2 } from '../typography/Typography'
import Tag from './Tag'
import LaneIcon from '../icons/page/LaneIcon'
import LaneInactiveIcon from '../icons/page/LaneInactiveIcon'

const ProductionCard = ({ productName, description, badgeText, laneNumber, laneName }: ProductionCardProps) => {
    const isOccupied = badgeText === "Occupied"
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {isOccupied ? (
                    <View style={[styles.laneIcon, styles.occupied]}>
                        <LaneIcon />
                    </View>
                ) : (
                    <View style={[styles.laneIcon, styles.vacant]}>
                        <LaneInactiveIcon />
                    </View>
                )}
                <Tag color={isOccupied ? "yellow" : "red"} size='lg'>{badgeText}</Tag>
            </View>
            <View style={styles.cardText}>
                <H2>{productName}</H2>
                <B4 color={getColor("green", 400)}>{laneName}</B4>
                <B4 color={getColor("green", 400)}>{description}</B4>
            </View>
            <Text style={styles.laneNum}>{laneNumber}</Text>
        </View>
    )
}

export default ProductionCard

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor("light"),
        borderRadius: 16,
        padding: 12,
        flexDirection: "column",
        gap: 12,
        position: "relative",
        flex: 1
    },
    cardText: {
        flexDirection: "column",
        gap: 4
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    laneIcon: {
        padding: 6,
        borderRadius: 8,
    },
    occupied: {
        backgroundColor: getColor("green")
    },
    vacant: {
        backgroundColor: getColor("green", 500, 0.05)
    },
    laneNum: {
        position: "absolute",
        bottom: -20,
        right: 0,
        fontSize: 70,
        color: getColor("green", 700, 0.1),

    }
})