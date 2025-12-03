import { getColor } from '@/src/constants/colors'
import { StyleSheet, View } from 'react-native'
import TruckRightIcon from '@/src/components/icons/page/TruckRightIcon'
import { B4, C1, H3, H6 } from '../typography/Typography'
import ClockIcon from '../icons/common/ClockIcon'
import { TruckWeightCardProps } from '@/src/types'

const TruckWeightCard = ({title, description, truckWeight, otherDescription}: TruckWeightCardProps) => {
    const isTruckOtherDetails = otherDescription && truckWeight;
  return (
    <View style={styles.card}>
        <View style={[styles.cardBody, isTruckOtherDetails && styles.border, isTruckOtherDetails  ? styles.padding12 : styles.padding4 ]}>
        <View style={styles.iconContainer}>
            <TruckRightIcon />
        </View>
        <View>
            <H3>{`${parseFloat(parseFloat(title).toFixed(2))} Kg`}</H3>
            <C1 color={getColor("green", 400)}>{description}</C1>
        </View>
        </View>
        {otherDescription && truckWeight && (
        <View style={styles.cardFooter}>
            <View style={styles.footerTextIcon}>
              <ClockIcon size={18} />  
            <H6>{otherDescription}</H6>
            </View>
            <B4>{truckWeight}</B4>
            </View>
        )}
    </View>
  )
}

export default TruckWeightCard

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor("light"),
        padding: 12,
        flexDirection: "column",
        gap: 12,
        borderRadius: 16,
        elevation: 1,
    },
    cardBody: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    iconContainer: {
        backgroundColor: getColor("blue", 100),
        padding: 8,
        borderWidth: 1,
        borderColor: getColor("blue"),
        borderRadius: 8,
    },
    footerTextIcon: {
        flexDirection: "row",
        gap: 6,
    },
    extraDetails: {
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 100),
        paddingBottom: 12,
        marginBottom: 12,
    },
    border: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
    },
    padding4: {
        padding: 4,
    },
    padding12: {
        padding: 12,
    },
})