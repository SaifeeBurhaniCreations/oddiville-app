import { Pressable, StyleSheet, View } from 'react-native'
import CustomImage from './CustomImage'
import { C1, H3 } from '../typography/Typography'
import { WarehouseItemCardProps } from '@/src/types'
import { getColor } from '@/src/constants/colors'
import Tag from './Tag'
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet'

const WarehouseItemCard = ({ name, description, image, rating, identifier }: WarehouseItemCardProps) => {
  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const TagIcon = rating.icon;

  const handleOpen = () => {
    validateAndSetData("temp123", identifier);
};
  return (
    <Pressable style={styles.card} onPress={handleOpen}>
      <View style={styles.cardContent}>
        <CustomImage src={image} width={40} height={40} style={{ borderRadius: 8 }} />
        <View style={styles.cardTitleSection}>
          <H3>{name}</H3>
          <C1 color={getColor("green", 400)} numberOfLines={2}>{description}</C1>
        </View>
      </View>
      <View style={styles.tagContainer}>
        <Tag color='blue' icon={<TagIcon />}>{rating.text}</Tag>
      </View>
    </Pressable>
  )
}

export default WarehouseItemCard

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: getColor("light"), 
    borderRadius: 16,
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    alignItems: 'center',
  },
  cardTitleSection: {
    flexDirection: 'column',
    gap: 4,
    flexShrink: 1,
  },
  tagContainer: {
    alignSelf: 'center', 
  }
})
