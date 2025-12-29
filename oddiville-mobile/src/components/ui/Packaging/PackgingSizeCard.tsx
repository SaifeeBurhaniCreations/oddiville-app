import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { getColor } from '@/src/constants/colors'
import { B4, H5 } from '../../typography/Typography'
import { PackagingSizeCardProps } from '@/src/types'
import Tag from '../Tag'
import { truncate } from '@/src/utils/arrayUtils'

const PackagingSizeCard = ({ icon, weight, quantity, disabled, onPress }: PackagingSizeCardProps) => {
    const IconComponent = icon;

  return (
<TouchableOpacity style={styles.card} onPress={onPress}>
  <View style={styles.cardBody}>
    <View style={styles.iconBg}>
      <IconComponent color={getColor("green", 500, disabled ? 0.4 : 1)} />
    </View>

    <View style={styles.textContainer}>
      <H5 color={getColor("green", disabled ? 200 : 700)}>{truncate(weight, 10)}</H5>
      <B4 color={getColor("green", disabled ? 200 : 700)}>{quantity}</B4>
    </View>

    <View style={styles.tagWrapper}>
      {disabled && <Tag color="yellow" size="md">empty</Tag>}
    </View>
  </View>
</TouchableOpacity>

  )
}

export default PackagingSizeCard

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor("light"),
        borderRadius: 16,
        padding: 8,
    },
    cardBody: {
        flexDirection: "row",
        alignItems: "center",
      },
      
      textContainer: {
        flex: 1,
        marginLeft: 8,
      },
      
      tagWrapper: {
        justifyContent: "center",
        alignItems: "flex-end",
      },
    iconBg: {
        backgroundColor: getColor("green", 500, 0.1),
        padding: 6,
        borderRadius: 6,
    }
})