import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { TruckCardProps } from '@/src/types';
import CustomImage from '../CustomImage';
import { getImageSource } from '@/src/utils/arrayUtils';
import Tag from '../Tag';
import StarIcon from '../../icons/page/StarIcon';
import { B4, B5, B6, C1, H3, H6, SubHeadingV3 } from '../../typography/Typography';

const KeyValueRow = ({ icon, name, value }: { icon: React.ReactNode, name: string, value: string | number }) => (
    <View style={styles.rowItem}>
        {icon}
        <View style={styles.keyValue}>
            <B6 color={getColor("green", 700)}>{name}:</B6>
            <C1 color={getColor("green", 700)}>{value}</C1>
        </View>
    </View>
);


const TruckDetailsCard = ({ truck }: TruckCardProps) => {
    const SideIcon = truck?.sideIcon as unknown as React.ReactNode

    return (
        <View style={styles.wrapper}>
            <View style={styles.card}>
                <View style={styles.topSection}>
                    <View style={styles.titleRow}>
                        {truck.isImage && typeof truck.isImage === 'string' && (
                            <CustomImage
                                src={truck.isImage}
                                width={40}
                                height={40}
                                borderRadius={8}
                                resizeMode="cover"
                            />
                        )}

                        <View style={styles.titleColumn}>
                            <View style={{ flexDirection: 'column', gap: 2 }}>
                                {truck.title && <H3>{truck.title}</H3>}
                                {truck.description && typeof truck.description === 'string' && <H6>{truck.description}</H6>}
                            </View>


                            {SideIcon && <View style={[styles.sideIcon]}>{SideIcon}</View>}
                        </View>
                    </View>

                    {truck.rating && <Tag color="blue" icon={<StarIcon size={12} />}>{truck.rating}</Tag>}
                </View>

                {Array.isArray(truck.details) && truck.details?.length > 0 && truck.details.map((detail, idx) => (
                    <KeyValueRow key={idx} icon={detail.icon} name={detail.name!} value={detail.value} />
                ))}

                {(truck.name || truck.address) && (
                    <View>
                        {truck.name && <H6>{truck.name}</H6>}
                        {truck.address && <C1 color={getColor("green", 400)}>{truck.address}</C1>}
                    </View>
                )}

                {truck.sepratorDetails && truck?.sepratorDetails?.length > 0 && (
                    <View style={[styles.sepratorRow]}>
                        {truck.sepratorDetails.map((item, index) => (
                            <React.Fragment key={index}>
                                <KeyValueRow icon={item.icon} name={item.name} value={item.value!} />
                                {truck.sepratorDetails && index < truck.sepratorDetails?.length - 1 && <View style={styles.divider} />}
                            </React.Fragment>
                        ))}
                    </View>
                )}
            </View>

            {truck.helperDetails && truck.helperDetails?.length > 0 && (
                <View style={styles.helperSection}>
                    {truck.helperDetails.map((h, idx) => (
                        <React.Fragment key={idx}>
                            <View style={styles.helperItem}>
                                {h.icon}
                                <View style={styles.keyValue}>
                                    <H6 style={{ flexWrap: 'wrap' }} color={getColor("light")}>{h.name}:</H6>
                                    <B4 style={{ flexWrap: 'wrap' }} color={getColor("light")}>{h.value}</B4>
                                </View>
                            </View>
                            {truck.helperDetails && idx < truck.helperDetails?.length - 1 && <View style={styles.helperDivider} />}
                        </React.Fragment>
                    ))}
                </View>
            )}
            {truck.dispatchDetails && truck.dispatchDetails?.length > 0 && (
                <View style={styles.dispatchSection}>
                    {truck.dispatchDetails.map((h, idx) => (
                        <React.Fragment key={idx}>
                            <View style={styles.helperItem}>
                                {
                                    idx % 2 === 0 ? (
                                        <React.Fragment>
                                            <View style={[styles.dispatchIcon]}>
                                                {h.icon}
                                            </View>
                                            <B5 style={{ flexWrap: 'wrap' }} color={getColor("light")}>{h.value}</B5>
                                        </React.Fragment>
                                    ) : (
                                        <React.Fragment>
                                            <B5 style={{ flexWrap: 'wrap' }} color={getColor("light")}>{h.value}</B5>
                                            <View style={[styles.dispatchIcon]}>
                                                {h.icon}
                                            </View>
                                        </React.Fragment>
                                    )
                                }
                            </View>
                            {truck.dispatchDetails && idx < truck.dispatchDetails?.length - 1 && (
                                <View style={[styles.dispatchDateLayout]}>
                                    <View style={[styles.dispatchDateHyphen]} />
                                    <View style={[styles.dispatchDateDifferencer]}>
                                        <SubHeadingV3 color={getColor('light', 100)}>{truck.dateDifference}</SubHeadingV3>
                                    </View>
                                    <View style={[styles.dispatchDateHyphen]} />
                                </View>
                            )}
                        </React.Fragment>
                    ))}
                </View>
            )}
        </View>
    );
};

export default TruckDetailsCard;

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: getColor("green"),
        borderRadius: 16,
        elevation: 2,
    },
    card: {
        backgroundColor: getColor("light"),
        borderRadius: 16,
        padding: 12,
        gap: 12,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    titleRow: {
        flexDirection: 'row',
        gap: 8,
    },
    titleColumn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        width: '100%',
        alignItems: 'center'
    },
    sepratorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        borderTopColor: getColor('green', 100),
        borderTopWidth: 1,
        flexWrap: 'wrap',
        gap: 12,
    },
    divider: {
        width: 1,
        height: 16,
        backgroundColor: getColor("green", 100),
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    keyValue: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    imageWrapper: {
        backgroundColor: getColor("green", 300),
        padding: 4,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    helperSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: 12,
    },
    dispatchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 8,
        paddingHorizontal: 8,
        gap: 4,
    },
    helperItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    helperDivider: {
        width: 1,
        height: 16,
        backgroundColor: getColor("light", 300),
    },
    sideIcon: {
        padding: 8,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: getColor('green', 100)
    },
    dispatchDateDifferencer: {
        padding: 4,
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: getColor('light', 100, 0.2),
        borderColor: getColor('green', 300),
        width: 58
    },
    dispatchIcon: {
        padding: 4,
        borderRadius: '50%',
        backgroundColor: getColor('light', 100),
        flexDirection: 'row',
        height: 25,
        width: 25
    },
    dispatchDateLayout: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dispatchDateHyphen: {
        height: 1,
        width: 24,
        borderTopWidth: 1.5,
        borderColor: getColor('green', 100)
    }
});
