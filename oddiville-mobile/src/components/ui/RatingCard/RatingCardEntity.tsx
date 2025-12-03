import FiveStarIcon from '@/src/components/icons/page/Rating/FiveStarIcon'
import FourStarIcon from '@/src/components/icons/page/Rating/FourStarIcon'
import OneStarIcon from '@/src/components/icons/page/Rating/OneStarIcon'
import ThreeStarIcon from '@/src/components/icons/page/Rating/ThreeStarIcon'
import TwoStarIcon from '@/src/components/icons/page/Rating/TwoStarIcon'
import { getColor } from '@/src/constants/colors'
import { RatingCardEntitiyProps } from '@/src/types'
import { StyleSheet, TouchableOpacity } from 'react-native'

const getColorByRating = (rating: number) => {
switch(rating) {
    case 5:
        return "blue"
    case 4:
        return "green"
    case 3:
        return "light"
    case 2:
        return "yellow"
    case 1:
        return "red"
    default:
        return "blue"
}
}

const RatingCardEntity = ({ rating, active, onPress }: RatingCardEntitiyProps) => {
    const Icon = {
        5: FiveStarIcon,
        4: FourStarIcon,
        3: ThreeStarIcon,
        2: TwoStarIcon,
        1: OneStarIcon,
    }[rating]

    return (
        <TouchableOpacity
            style={[
                styles.ratingCard,
                active && { backgroundColor: rating === 4 ? getColor(getColorByRating(rating), 500, 0.1): getColor(getColorByRating(rating), 100), borderWidth: 1, borderColor: rating === 3 ? getColor("green", 200) : getColor(getColorByRating(rating)) },
            ]}
            onPress={onPress}
        >
            <Icon active={active} />
        </TouchableOpacity>
    )
}

export default RatingCardEntity

const styles = StyleSheet.create({
    ratingCard: {
        backgroundColor: getColor("light"),
        padding: 12,
        borderRadius: 12,
    }
})
