import { VendorCardProps, VendorProps } from '@/src/types'
import { Pressable, StyleSheet, View } from 'react-native'
import Checkbox from '../../Checkbox'
import { B4, H5 } from '@/src/components/typography/Typography'
import { getColor } from '@/src/constants/colors'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/src/redux/store'
import { toggleVendor } from '@/src/redux/slices/bottomsheet/vendor.slice'

const VendorComponent: React.FC<VendorCardProps> = ({ data }) => {
    const dispatch = useDispatch();
    const selected = useSelector((state: RootState) => state.vendor.selectedVendors);
    
    const isSelected = (name: string) => {
        return selected?.some(item => item.name === name);
    };

    const handleToggle = (item: VendorProps) => {
        dispatch(toggleVendor({name: item.name}));
    };
    return (
        <View style={styles.cardContainer}>
            {data?.map((item, index) => {
                return (
                    <Pressable key={index + item.name} style={styles.card} onPress={() => handleToggle(item)}>
                        <Checkbox checked={isSelected(item.name)} />
                        <View style={styles.contentContainer}>
                            <View style={styles.leftContent}>
                                <H5>{item.name}</H5>
                                <B4 color={getColor("green", 400)}>{item.address}</B4>
                            </View>
                        </View>
                    </Pressable>
                )
            })}
        </View>
    )
}

export default VendorComponent

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: "column",
        gap: 16,
    },
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    leftContent: {
        flex: 1,
        gap: 4,
    },
})