import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomImage from './CustomImage'
import { B4, C1, H3 } from '../typography/Typography'
import { getColor } from '@/src/constants/colors'
import ChipGroup from './ChipGroup'
import { productDetails } from '@/src/types'
import { mapPackageIcon } from '@/src/utils/common'
import BoxIcon from '../icons/common/BoxIcon'

const DispatchProductList = ({ products, isChecked }: { products: productDetails[], isChecked: boolean }) => {
    return (
        <View style={styles.column}>
            {products?.map((product, index) => {

                return (
                    <View style={styles.card} key={index}>
                        <View style={[styles.gapedRow8, isChecked && styles.separator]}>
                            {typeof product?.image === 'string' && product.image.includes("http") ? (
                                <CustomImage src={product.image} width={32} height={32} borderRadius={8} />
                            ) : (
                                <BoxIcon size={32} />
                            )}
                            
                            <View style={styles.cardBody}>
                                <View>
                                    <View style={styles.row}>
                                        <H3>{product?.title}</H3>

                                        <View style={styles.gapedRow}>
                                            <B4>{product?.weight}</B4>
                                            <B4>{product?.price}</B4>
                                        </View>
                                    </View>
                                    <C1 color={getColor("green", 400)}>{product?.description}</C1>

                                </View>

                                {product?.packagesSentence && <C1 color={getColor("green", 400)}>{product?.packagesSentence}</C1>}
                            </View>
                        </View>
                        {
                            isChecked && (
                                <React.Fragment>
                                    <ChipGroup size={"sm"} isClickable={false} data={
                                        product.chambers?.map(value => ({
                                            title: `${String(value.name)} (${String(value.quantity)})`
                                        }))
                                    }>Chambers</ChipGroup>
                                    {product.packages && product.packages?.length > 0 ? (
                                        <ChipGroup size={"sm"} isClickable={false} data={
                                            product.packages?.map(value => {
                                                const IconComp = mapPackageIcon(value)
                                                return {
                                                    title: `${value.size} ${value.unit}: ${value.quantity}`,
                                                icon: IconComp && <IconComp color={getColor("green", 700)} size={16} />,
                                            }
                                        })
                                    }>Package</ChipGroup>
                                    ) : null}
                                </React.Fragment>
                            )
                        }

                    </View>
                )
            })}

        </View>
    )
}
// [
//     {
//         title: "500 Gm: 80",
//         icon: <PaperRollIcon  />
//     },
//     {
//         title: "1 kg: 10",
//         icon: <BagIcon color={getColor("green", 700)} size={16} />
//     },

// ]


export default DispatchProductList

const styles = StyleSheet.create({
    column: {
        flexDirection: "column",
        gap: 12,
    },
    card: {
        backgroundColor: getColor("light"),
        padding: 12,
        flexDirection: "column",
        gap: 8,
        borderRadius: 16,
        boxShadow: "0px 6px 12px -6px rgba(0, 17, 13, 0.06)",
    },
    cardBody: {
        flexDirection: "column",
        gap: 8,
        flex: 1
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    gapedRow: {
        flexDirection: "row",
        gap: 12,
    },
    separator: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
        paddingBottom: 8,
    },
    gapedRow8: {
        flexDirection: "row",
        gap: 8,
    },
})