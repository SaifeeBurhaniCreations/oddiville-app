import { Pressable, StyleSheet, View } from 'react-native';
import { ProductListAccordianComponentProps } from '@/src/types';
import { B3, B4, C1, H3 } from '../../typography/Typography';
import { getColor } from '@/src/constants/colors';
import React, { useState } from 'react';
import CustomImage from '../CustomImage';
import UpChevron from '../../icons/navigation/UpChevron';
import DownChevron from '../../icons/navigation/DownChevron';
import CustomSwitch from '../Switch';
import ChipGroup from '../ChipGroup';
import { mapPackageIcon } from '@/src/utils/common';
import BoxIcon from '../../icons/common/BoxIcon';

const ProductListAccordianComponent = ({ data }: ProductListAccordianComponentProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState(data?.detailView?.isDetailView || false)

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.accordianHeader}>
                    <Pressable onPress={() => setIsOpen(!isOpen)}>
                    <B3 color={getColor("yellow", 700)} style={{ textTransform: "uppercase" }}>
                        {data.label}
                    </B3>
                    </Pressable>
                    <View style={styles.gapedRow8}>
                        {data?.detailView && (
                            <React.Fragment>
                                <CustomSwitch setIsChecked={setIsChecked} isChecked={isChecked} post>
                                    {data?.detailView?.text}
                                </CustomSwitch>

                                <View style={styles.separator} />
                            </React.Fragment>
                        )}
                    <Pressable onPress={() => setIsOpen(!isOpen)}>
                        {isOpen ? (
                            <View style={styles.icons}>
                                <UpChevron color={getColor("green", 700)} />
                            </View>
                        ) : (
                            <View style={styles.icons}>
                                <DownChevron color={getColor("green", 700)} />
                            </View>
                        )}
                    </Pressable>
                    </View>

                </View>
            </View>
            {isOpen && (
                <View style={styles.column}>
                    {data?.products?.map((product, index) => {
                        const chambers = product.chambers?.map((val: any) => ({ title: `${val.name} (${val.quantity})` }))?.filter(Boolean)
                        const packages = product.packages?.map((val: any) => {
                            const IconComp = mapPackageIcon(val)
                            return { title: `${val.size}${val.unit}: (${val.quantity})`, icon: IconComp && <IconComp color={getColor("green", 700)} size={16} /> }
                        })?.filter(Boolean)
                        return (
                            <View style={styles.card} key={index}>
                                <View style={[styles.gapedRow8, isChecked && styles.devider]}>
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
    
                                        <C1 color={getColor("green", 400)}>{product?.packagesSentence}</C1>
                                    </View>
                                </View>
                                {
                                    isChecked && (
                                        <React.Fragment>
                                            <ChipGroup size={"sm"} isClickable={false} data={chambers}>Chambers</ChipGroup>
                                            <ChipGroup size={"sm"} isClickable={false} data={packages}>Package</ChipGroup>
                                        </React.Fragment>
                                    )
                                }
    
                            </View>
                        )
                    })}

                </View>
            )}

        </View>
    );
};

export default ProductListAccordianComponent;

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        gap: 12,
        paddingBottom: 8
    },
    column: {
        flexDirection: "column",
        gap: 12,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    gapedRow: {
        flexDirection: "row",
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
    accordianHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    icons: {
        backgroundColor: getColor("light"),
        borderRadius: 50,
        borderWidth: 1,
        borderColor: getColor("green", 100),
        padding: 4,
    },
    separator: {
        width: 1,
        backgroundColor: getColor("green", 100),
    },
    gapedRow8: {
        flexDirection: "row",
        gap: 8,
    },
    devider: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
        paddingBottom: 8,
    },
});