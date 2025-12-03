import { StyleSheet, View } from 'react-native';
import { ProductListComponentProps } from '@/src/types';
import { B3 } from '../../typography/Typography';
import { getColor } from '@/src/constants/colors';
import CustomSwitch from '../Switch';
import React, { useState } from 'react';
import DispatchProductList from '../DispatchProductList';

const ProductListComponent = ({ data }: ProductListComponentProps) => {
    const [isChecked, setIsChecked] = useState(data.detailView.isDetailView)

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <B3 color={getColor("yellow", 700)} style={{ textTransform: "uppercase" }}>
                    {data.label}
                </B3>

                <CustomSwitch setIsChecked={setIsChecked} isChecked={isChecked} post>
                    {data.detailView.text}
                </CustomSwitch>
            </View>
            <DispatchProductList products={data?.products} isChecked={isChecked} />

        </View>
    );
};

export default ProductListComponent;

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        gap: 12,
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
    gapedRow8: {
        flexDirection: "row",
        gap: 8,
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
    separator: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
        paddingBottom: 8,
    },
});
