
import { StyleSheet, View } from 'react-native'
import React from 'react'
import UpChevron from '../icons/navigation/UpChevron'
import { getColor } from '@/src/constants/colors'

const ChevronComponent = ({ open }: { open: boolean }) => {
    const rotation = open ? '180deg' : '0deg'


    return (
        <View style={styles.icons} 
        accessibilityRole="image"
        accessibilityLabel={open ? 'Collapse section' : 'Expand section'}
        accessibilityHint="Tap to toggle section visibility">
            <View style={{ transform: [{ rotate: rotation }] }}>
                <UpChevron color={getColor('green', 700)} />
            </View>
        </View>
    )
}

export default React.memo(ChevronComponent)

const styles = StyleSheet.create({
    icons: {
        backgroundColor: getColor("light"),
        borderRadius: 50,
        borderWidth: 1,
        borderColor: getColor("green", 100),
        padding: 4,
    },
})