import { RatingCardProps } from '@/src/types'
import { StyleSheet, View } from 'react-native'
import RatingCardEntity from './RatingCardEntity'
import { H4 } from '@/src/components/typography/Typography'
import React from 'react'

const RatingCard = ({ children, active, onChange, style }: RatingCardProps) => {
    const ratings: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1]

    const ratingCard = (
        <View style={styles.card}>
            {ratings.map((rating) => (
                <RatingCardEntity
                    key={rating}
                    rating={rating}
                    active={active === rating}
                    onPress={() => onChange?.(rating)}
                />
            ))}
        </View>
    )

    return children ? (
        <View style={[styles.wrapper, style]}>
            <H4>{children}</H4>
            {ratingCard}
        </View>
    ) : ratingCard
}

export default RatingCard

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "column",
        gap: 12
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16
    }
})
