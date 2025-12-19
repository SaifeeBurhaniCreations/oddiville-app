import { getColor } from '@/src/constants/colors'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { H4 } from '../typography/Typography'
import { MenuCardProps } from '@/src/types'
import ForwardChevron from '../icons/navigation/ForwardChevron'
import { memo } from 'react'
import { useAppNavigation } from '@/src/hooks/useAppNavigation'

const MenuCard = ({ item, onPress, style }: MenuCardProps) => {
    const { goTo } = useAppNavigation();


    const handlePress = () => {
        onPress()
        goTo(item.href); 
    };

    return (
        <TouchableOpacity activeOpacity={0.7} style={[styles.card, style]} onPress={handlePress}> 
            <View style={[styles.HStack, styles.justifyBetween, styles.alignItemsCenter, styles.gap12]}>
                <item.icon color={getColor("green", 700)} size={item.style?.size} />
                <H4 color={getColor("green", 700)}>{item.name}</H4>
            </View>
            <ForwardChevron color={getColor("green", 700)} />
        </TouchableOpacity>
    );
};


export default memo(MenuCard);

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor("light", 500),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        boxShadow: "0px 6px 12px -6px rgba(0, 17, 13, 0.06)",
        borderRadius: 16,
    },
    lastCardText: {
        color: getColor("red", 500),
    },
    HStack: {
        flexDirection: "row",
    },
    justifyBetween: {
        justifyContent: "space-between"
    },
    alignItemsCenter: {
        alignItems: "center"
    },
    gap12: {
        gap: 12
    }
});
