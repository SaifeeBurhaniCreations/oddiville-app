import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomImage from './CustomImage';
import { C1, H3 } from '../typography/Typography';
import Tag from './Tag';
import { getColor } from '@/src/constants/colors';
import StarIcon from '../icons/page/StarIcon';
import Button from './Buttons/Button';
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { RawMaterialProps } from '@/src/types/ui';
import { getRatingColor } from '@/src/utils/common';
import { getImageSource } from '@/src/utils/arrayUtils';

const RawMaterialCard = ({ name, image, description, rating, disabled, href, detailByRating, quantity }: RawMaterialProps) => {

    const { goTo } = useAppNavigation();
    const paramData = {
        name,
        rating,
        detailByRating
    }
    

    const handlePress = () => {
        if (href) {
            // @ts-ignore
            goTo(href, { data: paramData, source: "raw_material" });
        }
    };

    
    const result_rating = rating?.trim()?.replace(/(\d+(\.\d+)?) - \1/g, '$1');

    let color = "red" as "green" | "blue" | "yellow" | "red";
    const ratingNum = Math.round(Number(result_rating));
    
    const ratingClamped = Math.min(5, Math.max(1, ratingNum));
    
    color = getRatingColor(ratingClamped as 1 | 2 | 3 | 4 | 5);

    if(!image) return;
const rmImage = getImageSource(image).image;

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled && !href}
            style={[styles.card, disabled && styles.disabledCard]}
        >
            <View style={styles.cardLeft}>
                <View style={styles.productImage}>
                    <CustomImage
                        src={rmImage}
                        width={40}
                        height={40}
                        resizeMode='contain'
                        style={[styles.image, disabled && styles.imageDisabled]}
                    />
                </View>
                <View>
                    {quantity ? <H3 color={getColor("green", disabled ? 200 : 700)}>{quantity}</H3> : <H3 color={getColor("green", disabled ? 200 : 700)}>{name}</H3>}
                    {description && <C1 color={getColor("green", 400)}>{description}</C1>}
                </View>
            </View>

            <View style={styles.actionArea}>
                {disabled ? (
                    <Button onPress={handlePress} size='sm' variant='outline'>
                        Order
                    </Button>
                ) : (
                    <Tag
                        color={color}
                        size='md'
                        style={styles.tag}
                        icon={<StarIcon />}
                    >
                        {result_rating}
                    </Tag>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default RawMaterialCard;


const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: getColor('light'),
        borderRadius: 16,
        justifyContent: 'space-between',
        marginBottom: 0,
    },
    disabledCard: {
        opacity: 0.7,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImage: {
        backgroundColor: getColor('green', 300),
        borderRadius: 8,
        padding: 4,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        borderRadius: 8,
    },
    imageDisabled: {
        opacity: 0.5,
    },
    actionArea: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tag: {
        alignSelf: 'center',
    },
});
