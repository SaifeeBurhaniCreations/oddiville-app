import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { B2, B4, B5, H1, H5 } from '@/src/components/typography/Typography';
import CalendarIcon from '@/src/components/icons/page/Calendar12Icon';
import CrossIcon from '@/src/components/icons/page/CrossIcon';
import { HeaderComponentProps } from "@/src/types";
import { getIcon } from '@/src/utils/iconUtils';

const HeaderComponent: React.FC<HeaderComponentProps> = ({ data, color = "green",onClose }) => {

    const { label, value, title, description, headerDetails, color: statusColor = "red" } = data;

    return (
        <View style={[styles.cardHeader, label && styles.border]}>
            {label && (
                <View style={styles.row}>
                    <B5 color={getColor(statusColor, 700)} style={{ textTransform: "uppercase" }}>
                        {label}
                    </B5>
                    <View style={[styles.rowGap8, { alignItems: 'center' }]}>
                        <View style={styles.cardHeaderTime}>
                            <CalendarIcon color={getColor(color, 700)} />
                            <B5 color={getColor(color, 700)}>{value}</B5>
                        </View>
                        <View style={[styles.verticalDivider, { backgroundColor: getColor(color, 100) }]} />
                        <TouchableOpacity onPress={onClose}>
                            <CrossIcon color={getColor(color, 700)} size={24} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View>
                <View style={styles.row}>
                    <H1 color={getColor(color, 700)}>{title}</H1>
                    {!label && (
                        <TouchableOpacity onPress={onClose}>
                            <CrossIcon color={getColor(color, 700)} size={24} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.twoColumnRow}>
                    {headerDetails && headerDetails.map((detail, i) => {
                        detail.value = detail.value == null ? "" : String(detail.value);

                        return (
                            <React.Fragment key={i}>
                                <View style={styles.detailRow} key={i}>
                                    {getIcon(detail.icon)}
                                    <H5>{detail.label}:</H5>
                                    <B4>{detail.value}</B4>
                                </View>
                                {headerDetails?.length > 1 && i !== headerDetails?.length - 1 && <View style={styles.separator}></View>}
                            </React.Fragment>
                        )
                    })}
                </View>

                {description && description !== "" && <B2 color={getColor("green", 400)}>{description}</B2>}
            </View>

        </View>
    );
}

export default HeaderComponent;

const styles = StyleSheet.create({
    cardHeader: {
        flexDirection: 'column',
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardHeaderTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowGap8: {
        flexDirection: 'row',
        gap: 8,
    },
    verticalDivider: {
        width: 1,
        height: 15,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    twoColumnRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    separator: {
        width: 1,
        backgroundColor: getColor("green", 100),
        alignSelf: 'stretch',
        marginHorizontal: 4,
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 100),
        paddingBottom: 16
    }
});