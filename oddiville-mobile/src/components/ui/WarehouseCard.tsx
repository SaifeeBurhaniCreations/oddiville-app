import { Pressable, StyleSheet, View } from 'react-native'
import CustomImage from './CustomImage'
import { B3, B4, C1, H5 } from '../typography/Typography'
import CustomCheckbox from './Checkbox'
import { WarehouseCardProps } from '@/src/types'
import { getColor } from '@/src/constants/colors'
import ActionButton from './Buttons/ActionButton'

const WarehouseCard = ({ name, image, address, label, icon, items, withCardStyle, isChecked, onPress }: WarehouseCardProps) => {
  return (
    <Pressable style={[withCardStyle ? styles.card : styles.cardEmpty]} onPress={onPress}>
      <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <CustomImage src={image} width={40} height={40} style={{ borderRadius: 8 }} />
        <View style={[styles.cardTitleSection, { gap: withCardStyle ? 0 : 4 }]}>
          <H5>{name}</H5>
          <B4 color={getColor("green", 400)} numberOfLines={2}>{address}</B4>
        </View>
      </View>

      <View style={{ alignSelf: withCardStyle ? 'flex-start' : 'center' }}>
        {icon ? (
          <ActionButton icon={icon} />
        ) : (
          <CustomCheckbox checked={isChecked} />
        )}
      </View>
      </View>
      <View>
      {items && (<B3>{label}</B3>)} 
      {items && (<C1>{items && items?.join(", ")}</C1>)}
      </View>
    </Pressable>
  )
}

export default WarehouseCard

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    backgroundColor: getColor("light"),
    padding: 12,
    borderRadius: 16,
  },
  cardEmpty: {
    flexDirection: 'column',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
  },
  cardContent: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    alignItems: 'center',
  },
  cardTitleSection: {
    flexDirection: 'column',
    flexShrink: 1,
  },
})
