import { getColor } from '@/src/constants/colors';
import { DataGroupComponentProps } from '@/src/types';
import { Pressable, StyleSheet, View } from 'react-native';
import { B2, B3, B4, B5, H5 } from '../../typography/Typography';
import React from 'react';
import FileIcon from '../../icons/common/FileIcon';
import { chunkArray, getMergedDetails } from '@/src/utils/arrayUtils';
import { getIcon } from '@/src/utils/iconUtils';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { generateImageFileName } from '@/src/utils/common';

const DataGroupComponent = ({ data }: DataGroupComponentProps) => {

    const { validateAndSetData } = useValidateAndOpenBottomSheet()

    const handleOpenPdfViewer = (url: string) => {
        const ImagePreview = {
            sections: [
                {
                    type: 'title-with-details-cross',
                    data: {
                        title: 'Example_challan'
                    },
                },
                {
                    type: 'image-preview',
                    data: {
                        imageUri: url
                    }
                },

            ]
        }
        validateAndSetData("Abcd1", "image-preview", ImagePreview);
    }

    return (
        <View style={styles.column}>
            {data?.map((details, index) => {
                const mergedDetails = getMergedDetails(details);

                return (
                    <View style={styles.details} key={index}>
                        <View
                            style={[styles.wrapper, index !== data?.length - 1 && styles.detailsBorder]}>

                            <Pressable
                                style={styles.headerPressable}>
                                <View style={styles.header}>
                                    <B3 color={getColor("yellow", 700)} style={{ textTransform: "uppercase" }}>
                                        {details.title}
                                    </B3>
                                </View>
                            </Pressable>

                            <View style={styles.content}>
                                {details.title.toLowerCase().includes("product") ? (
                                    <View style={styles.detailsRowWrap}>
                                        {chunkArray(mergedDetails, 2).map((pair, idx) => (
                                            <View key={idx} style={styles.twoColumnRow}>
                                                <View style={styles.detailRow}>
                                                    {getIcon(pair[0].icon)}
                                                    <View style={[styles.row, styles.gap4]}>
                                                        <H5>{pair[0].label}:</H5>
                                                        <B4>{pair[0].value}</B4>
                                                    </View>
                                                </View>

                                                {pair[1] && (
                                                    <>
                                                        <View style={styles.separator} />
                                                        <View style={styles.detailRow}>
                                                            {getIcon(pair[1].icon)}
                                                            <View style={[styles.row, styles.gap4]}>
                                                                <H5>{pair[1].label}:</H5>
                                                                <B4>{pair[1].value}</B4>
                                                            </View>
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.detailsColumn}>
                                        {mergedDetails.map((detail, idx) => {
                                            const isLongValue = String(detail.value)?.length > 30; 

                                            return (
                                                <View key={idx} style={[styles.row, styles.gap8]}>
                                                    {getIcon(detail.icon)}
                                                    {isLongValue ? (
                                                        <View style={styles.detailTextWrapper}>
                                                            <H5>{detail.label}:</H5>
                                                            <B4 style={styles.detailValue}>{detail.value}</B4>
                                                        </View>
                                                    ) : (
                                                        <View style={[styles.row, styles.gap4]}>
                                                            <H5>{detail.label}:</H5>
                                                            <B4>{detail.value}</B4>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}

                                    </View>
                                )}

                                {details.fileName && (
                                    <View style={styles.receipt}>
                                        <View style={[styles.row, styles.gap12]}>
                                            <FileIcon />
                                            <B2>
                                                {
                                                    generateImageFileName(details.fileName
                                                        ?.split('.')?.[1]!)
                                                }
                                            </B2>
                                        </View>
                                        <Pressable onPress={() => handleOpenPdfViewer(details.fileName!)}>
                                            <B5 color={getColor("green")}>View receipt</B5>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

export default DataGroupComponent;

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
    details: {
        flexDirection: "column",
        gap: 12,
    },
    twoColumnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 4,
    },
    separator: {
        width: 1,
        backgroundColor: getColor("green", 100),
        alignSelf: 'stretch',
        marginHorizontal: 4,
    },
    receipt: {
        backgroundColor: getColor("light"),
        borderWidth: 1,
        borderColor: getColor("green", 100),
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        justifyContent: "space-between",
    },
    wrapper: {
        borderColor: getColor("green", 100),
        flexDirection: "column",
    },
    headerPressable: {
        paddingBottom: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    content: {
        flexDirection: "column",
        gap: 12,
        paddingBottom: 16,
    },
    detailsColumn: {
        flexDirection: "column",
        gap: 12,
    },
    detailsRowWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    detailsBorder: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
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
