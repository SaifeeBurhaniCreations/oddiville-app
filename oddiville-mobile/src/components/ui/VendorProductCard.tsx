import { getColor } from '@/src/constants/colors'
import { StyleSheet, View } from 'react-native'
import { B2, H3, H5 } from '../typography/Typography'
import { VendorProductProps } from '@/src/types'
import PriceInput from './Inputs/PriceInput'

const VendorProductCard = ({ title, weight, vendors }: VendorProductProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <H5 color={getColor("light")}>{title}</H5>
                <B2 color={getColor("light")}>{weight}</B2>
            </View>
            <View style={styles.cardBody}>
                {vendors?.map((vendor, index) => {
                    const isLastCard = index === vendors?.length - 1;
                    return (
                        <View style={styles.vendorCard}>
                            <H3>{vendor.name}</H3>
                            <View key={index} style={[styles.productContainer, !isLastCard && styles.productContainerWithBorder]}>
                            <PriceInput style={{ flex: 1 }} value='' onChangeText={() => { }} placeholder='Price' addonText='Kg'/>
                            <PriceInput style={{ flex: 1 }} value='' onChangeText={() => { }} placeholder='Enter qty.' addonText='No.'/>
                        </View>
                    </View>
                    )
                })}
            </View>
        </View>
    )
}

export default VendorProductCard

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor("green"),
        borderTopStartRadius: 12,
        borderTopEndRadius: 12,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    cardBody: {
        backgroundColor: getColor("light"),
        padding: 12,
        borderTopStartRadius: 12,
        borderTopEndRadius: 12,
        flexDirection: "column",
        gap: 16,
    },
    vendorCard: {
        flexDirection: "column",
        gap: 16,
    },
    icon: {
        backgroundColor: getColor("light"),
        padding: 4,
        borderRadius: 50
    },
    productContainer: {
        flexDirection: "row",
        gap: 24,
        alignItems: "center",
        paddingBottom: 12
    },
    productContainerWithBorder: {
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 100),
    }
})
// import { getColor } from '@/src/constants/colors'
// import { StyleSheet, View } from 'react-native'
// import { H5 } from '../typography/Typography'
// import { VendorProductProps } from '@/src/types'
// import TrashIcon from '../icons/common/TrashIcon'
// import ProductWithPriceInput from './ProductWithPriceInput'

// const VendorProductCard = ({ vendorName, products }: VendorProductProps) => {
//     return (
//         <View style={styles.card}>
//             <View style={styles.cardHeader}>
//                 <H5 color={getColor("light")}>{vendorName}</H5>
//                 <View style={styles.icon}>
//                     <TrashIcon />
//                 </View>
//             </View>
//             <View style={styles.cardBody}>
//                 {products?.map((product, index) => {
//                     const isLastCard = index === products?.length - 1;
//                     return (
//                         <View key={index} style={[styles.productContainer, !isLastCard && styles.productContainerWithBorder]}>
//                             <ProductWithPriceInput {...product} />
//                         </View>
//                     )
//                 })}
//             </View>
//         </View>
//     )
// }

// export default VendorProductCard

// const styles = StyleSheet.create({
//     card: {
//         backgroundColor: getColor("green"),
//         borderTopStartRadius: 12,
//         borderTopEndRadius: 12,
//     },
//     cardHeader: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//     },
//     cardBody: {
//         backgroundColor: getColor("light"),
//         padding: 12,
//         borderTopStartRadius: 12,
//         borderTopEndRadius: 12,
//         flexDirection: "column",
//         gap: 16,
//     },
//     icon: {
//         backgroundColor: getColor("light"),
//         padding: 4,
//         borderRadius: 50
//     },
//     productContainer: {
//         paddingBottom: 16,
//     },
//     productContainerWithBorder: {
//         borderBottomWidth: 1,
//         borderBottomColor: getColor("green", 100),
//     }
// })