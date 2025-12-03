import { getColor } from '@/src/constants/colors';
import { ProductDetailsComponentProps } from '@/src/types';
import { Pressable, StyleSheet, View } from 'react-native';
import { B2, B3, B4, B5, H5 } from '../../typography/Typography';
import React from 'react';
import { getIcon } from '@/src/utils/iconUtils';
import FileIcon from '../../icons/common/FileIcon';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { generateImageFileName } from '@/src/utils/common';

const ProductDetailsComponent = ({ data }: ProductDetailsComponentProps) => {
    const { validateAndSetData } = useValidateAndOpenBottomSheet();

  
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
                                        {items.map((item, i) => (
                                            <React.Fragment key={i}>
                                                <View style={styles.detailRow}>
                                                    {getIcon(item.icon)}
                                                    <H5>{item.label}:</H5>
                                                    <B4>{item.value}</B4>
                                                </View>
                                                {items?.length > 1 && i !== items?.length - 1 && <View style={styles.separator}></View>}
                                            </React.Fragment>
                                        ))}
                                    </View>
                                );
                            })}

                        </View>
                    ))}

                    {content.fileName && (
                        <View style={styles.receipt}>
                            <View style={[styles.row, styles.gap12]}>
                                <FileIcon />
                                <B2> {generateImageFileName(content.fileName
                                    ?.split('.')?.[1]!)}</B2>
                            </View>
                            <Pressable onPress={()=> handleOpenPdfViewer(content.fileName!)}>
                                <B5 color={getColor("green")}>View receipt</B5>
                            </Pressable>
                        </View>

                    )}
                </View>
            ))}
        </View>
    );
};


export default ProductDetailsComponent;

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
        gap: 8,
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
});
