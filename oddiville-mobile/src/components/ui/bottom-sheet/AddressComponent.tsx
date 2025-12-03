import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { B2, H5 } from '@/src/components/typography/Typography';
import LocationIcon from '@/src/components/icons/page/LocationIcon';
import { AddressProps } from "@/src/types";

const AddressComponent: React.FC<AddressProps> = ({ data, color }) =>  {
    const { label, value } = data
    
    return (
    <View
        style={[
            styles.rowGap12,
            styles.bottomBorderContainer,
            { borderBottomColor: getColor(color, 100) },
        ]}
    >
        <View style={[styles.rowGap6, { alignItems: "flex-start" }]}>
            {label && value && <LocationIcon color={getColor(color, 700)} />}
            <View style={[styles.rowGap4, { alignItems: 'flex-start' }]}>
                <H5 color={getColor(color, 700)} style={{ flexWrap: 'wrap', width: '95%' }}>
                    {label} <B2 color={getColor(color, 700)}>{value}</B2>
                </H5>
            </View>
        </View>
    </View>
);
}

export default AddressComponent;

const styles = StyleSheet.create({
    rowGap12: {
        flexDirection: 'row',
        gap: 12,
    },
    bottomBorderContainer: {
        borderBottomWidth: 1,
        paddingBottom: 12,
    },
    rowGap6: {
        flexDirection: 'row',
        gap: 6,
    },
    rowGap4: {
        flexDirection: 'row',
        gap: 4,
    },
});