import { getColor } from '@/src/constants/colors';
import { DataComponentProps } from '@/src/types';
import { StyleSheet, View } from 'react-native';
import { B3, B4, H5 } from '../../typography/Typography';
import React from 'react';
import { getIcon } from '@/src/utils/iconUtils';

const DataComponent = ({ data }: DataComponentProps) => {
    
    return (
        <View style={styles.column}>
            {data.map((content, contentIndex) => (
                <View style={[styles.body, (contentIndex !== data?.length - 1 || contentIndex === 0) && styles.detailsBorder]} key={contentIndex}>
                    <B3 color={getColor("yellow", 700)} style={{ textTransform: "uppercase" }}>
                        {content.title}
                    </B3>

                    {content.details?.map((detailObj, detailIndex) => (
                        <View key={detailIndex} style={styles.detailsColumn}>
                            {Object.entries(detailObj).map(([key, row]) => {
                                const items = Array.isArray(row) ? row : [row];

                                return (
                                    <View key={key} style={styles.twoColumnRow}>
                                        {items.map((item, i) => {
                                            const isLongValue = String(item.value)?.length > 30;

                                            return (
                                                <React.Fragment key={i}>
                                                    <View style={styles.detailRow}>
                                                        {getIcon(item.icon)}
                                                        {isLongValue ? (
                                                            <View style={styles.detailTextWrapper}>
                                                                <H5>{item.label}:</H5>
                                                                <B4 style={styles.detailValue}>{item.value}</B4>
                                                            </View>
                                                        ) : (
                                                            <View style={[styles.row, styles.gap4]}>
                                                                <H5>{item.label}:</H5>
                                                                <B4>{item.value}</B4>
                                                            </View>
                                                        )}
                                                    </View>

                                                    {items?.length > 1 && i !== items?.length - 1 && (
                                                        <View style={styles.separator} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}

                                    </View>
                                );
                            })}

                        </View>
                    ))}

                </View>
            ))}
        </View>
    );
};


export default DataComponent;

const styles = StyleSheet.create({
    column: {
        flexDirection: "column",
        gap: 16,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    gap4: {
        gap: 4,
    },
    gap8: {
        gap: 8,
    },
    gap12: {
        gap: 12,
    },
    body: {
        flexDirection: "column",
        gap: 12,
    },
    twoColumnRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 4,
    },
    separator: {
        width: 1,
        backgroundColor: getColor("green", 100),
        alignSelf: 'stretch',
        marginHorizontal: 4,
    },
    detailsColumn: {
        flexDirection: "column",
        gap: 12,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    detailsBorder: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
        paddingBottom: 16,
    },
    detailTextWrapper: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 1,
        gap: 2,
    },
    detailValue: {
        flexWrap: 'wrap',
        flexShrink: 1,
    },
});
