import { Pressable, StyleSheet, View } from 'react-native'
import CustomImage from './CustomImage'
import { getColor } from '@/src/constants/colors';
import { RawMaterialStockCardProps } from '@/src/types';
import { B4, H3 } from '../typography/Typography';
import { statusBaseIcon } from "@/src/utils/common"
import { getImageSource } from '@/src/utils/arrayUtils';

const RawMaterialStockCard = ({ id, name, image, weightSentence, status, totalItem, disabled = false, onPress }: RawMaterialStockCardProps) => {

    const isLastRow = Math.floor((id - 1) / 2) === Math.floor((totalItem - 1) / 2);

    const iconResult = statusBaseIcon(status);
    const IconComponent = iconResult?.Component;

    return (
        <Pressable onPress={onPress} style={[styles.cardWrapper, { borderRightWidth: (id % 2 === 1 ) ? 1 : 0, borderRightColor: getColor("green", 100),  borderBottomWidth: isLastRow ? 0 : 1,
            borderBottomColor: getColor("green", 100), }]}>
            <View style={styles.productImage}>
                <CustomImage src={getImageSource({image}).image} width={40} height={40} style={{ borderRadius: 8, opacity: disabled ? 0.5 : 1 }} resizeMode='contain' />
            </View>
            <View style={styles.cardText}>
                <View style={styles.titleWithIcon}>
                    <H3>{name}</H3>
                    {status !== "success" && IconComponent && <IconComponent />}
                </View>
                <B4 color={status === "warning" ? getColor("yellow", 700) : status === "danger" ? getColor("red", 700) : getColor("green", 400)}>{weightSentence}</B4>
            </View>
        </Pressable>
    )
}

export default RawMaterialStockCard

const styles = StyleSheet.create({
    cardWrapper: {
        flexDirection: "column",
        gap: 8,
        padding: 8,
        alignItems: "center",
        width: "50%",
    },
    productImage: {
        backgroundColor: getColor("green", 300),
        borderRadius: 8,
        padding: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    cardText: {
        flexDirection: "column",
        gap: 2,
        alignItems: "center"
    },
    titleWithIcon: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center"
    },

})