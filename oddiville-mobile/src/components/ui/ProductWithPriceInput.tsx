import { getColor } from '@/src/constants/colors'
import { StyleSheet, View } from 'react-native'
import CustomImage from './CustomImage'
import { H4, SubHeadingV3 } from '../typography/Typography'
import { ProductWithPriceInputProps } from '@/src/types';
import PriceInput from './Inputs/PriceInput';
import { getImageSource } from '@/src/utils/arrayUtils';

const ProductWithPriceInput = ({ name, weight }: ProductWithPriceInputProps) => {

    return (
        <View style={styles.card}>
            <View style={styles.titleWithImageSection}>
                <View style={styles.productImage}>
                    <CustomImage src={getImageSource({image: name}).image} width={32} height={32} resizeMode='contain' />
                </View>
                <View>
                    <H4 color={getColor("green", 700)}>{name}</H4>
                    <SubHeadingV3 color={getColor("green", 700)}>{weight}</SubHeadingV3>
                </View>
            </View>
            <PriceInput value='' onChangeText={() => {}}  placeholder='Price' addonText='Kg' />

        </View>
    )
}

export default ProductWithPriceInput

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    titleWithImageSection: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    productImage: {
        backgroundColor: getColor("green", 300),
        borderRadius: 8,
        padding: 4,
        justifyContent: "center",
        alignItems: "center",
    },
})