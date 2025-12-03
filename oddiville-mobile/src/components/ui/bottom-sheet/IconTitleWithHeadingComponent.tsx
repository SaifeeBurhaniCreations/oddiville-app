import React from 'react';
import { IconTitleWithHeadingProps } from '@/src/types';
import { View } from 'moti';
import { Pressable, StyleSheet } from 'react-native';
import { B3, SubHeading } from '../../typography/Typography';
import { getColor } from '@/src/constants/colors';
import CustomImage from '../CustomImage';
import { useDispatch } from 'react-redux';
import { setCountry } from '@/src/redux/slices/bottomsheet/location.slice';
import { closeBottomSheet } from '@/src/redux/slices/bottomsheet.slice';

const IconTitleWithHeading: React.FC<IconTitleWithHeadingProps> = ({ data, color }) => {
    const dispatch = useDispatch();
    const handleToggle = (item: { label: string; icon: string; isoCode: string }) => {
        dispatch(setCountry(item));
        dispatch(closeBottomSheet());
    };
    return (
        <View style={styles.column}>
            {data?.map((details, index) => (
                <View key={index} style={styles.column}>
                    <B3 color={getColor("yellow", 700)} style={{ textTransform: "uppercase" }}>
                        {details?.title}
                    </B3>
                    {details?.iconTitle?.map((iT, rowIndex) => (
                        <Pressable onPress={() => handleToggle(iT)} key={`${index}-${rowIndex}`} style={[styles.row, rowIndex < details?.iconTitle?.length - 1 && styles.separator]}>
                            <CustomImage src={iT?.icon} width={24} height={24} />
                            <SubHeading>{iT?.label}</SubHeading>
                        </Pressable>
                    ))}
                </View>

            ))}
        </View>
    );
}

export default IconTitleWithHeading;

const styles = StyleSheet.create({
    column: {
        flexDirection: "column",
        gap: 24,
    },
    row: {
        flexDirection: "row",
        gap: 8
    },
    separator: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
        paddingBottom: 12,
    }
})