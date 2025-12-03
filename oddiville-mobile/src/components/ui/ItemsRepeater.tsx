import { StyleSheet, View } from 'react-native';
import React, { ReactNode } from 'react';
import { getColor } from '@/src/constants/colors';
import { B2, H5 } from '../typography/Typography';
import { formatWeight } from '@/src/utils/common';

const ItemsRepeater = ({
    description,
    title,
    children,
    showToast,
    ...props
}: {
    description: string;
    title: string;
    children?: ReactNode;
    showToast?: (type: "success" | "error" | "info", message: string) => void;
}) => {

    return (
        <View style={styles.card} {...props}>
            <View style={styles.cardHeader}>
                <H5 color={getColor('light')}>{title}</H5>
                <B2 color={getColor('light')}>
                    {formatWeight(Number(description))}
                </B2>
            </View>

            <View style={styles.cardBody}>
                {children}
            </View>
        </View>
    );
};

export default ItemsRepeater;

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor('green'),
        borderRadius: 16,
    },
    cardHeader: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardBody: {
        backgroundColor: getColor('light'),
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        gap: 12,
    },
    labelInput: {
        flexDirection: 'column',
        gap: 16,
    },
    justifyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    flexGrow: {
        flex: 1,
    },
    separator: {
        borderBottomWidth: 1,
        borderColor: getColor('green', 100),
        paddingBottom: 16,
    },
});