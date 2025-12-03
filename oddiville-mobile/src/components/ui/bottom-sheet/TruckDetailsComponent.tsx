import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { B2, B5, H5 } from '@/src/components/typography/Typography';
import { InfoRowProps } from "@/src/types";
import { chunkArray } from '@/src/utils/arrayUtils';
import UserSquareIcon from "@/src/components/icons/page/UserSquareIcon"
import TruckIcon from '../../icons/page/TruckIcon';
import VehicleNumberIcon from '../../icons/page/VehicleNumberIcon';

const TruckDetailsComponent: React.FC<InfoRowProps> = ({ data, color }) => {
    const chunkedData = chunkArray(data, 2);
    
    return (
        <View
            style={[
                styles.secondContainer,
                {
                    borderTopColor: getColor(color, 100),
                    borderBottomColor: getColor(color, 100),
                },
            ]}
        >
            <View style={styles.columnContainer}>
            <B5 color={getColor("yellow", 700)} style={{textTransform: "uppercase"}}>Truck detail</B5>
                {chunkedData.map((row, rowIdx) => (
                    <View key={rowIdx} style={[styles.rowContainer, {gap: 8}]}>
                        {row.map((item, idx) => (
                            <React.Fragment key={idx}>
                                <View style={styles.itemContainer}>
                                    {item.icon === 'userSquare' && <UserSquareIcon color={getColor(color, 700)} />}
                                    {item.icon === 'truck' && <TruckIcon color={getColor(color, 700)} />}
                                    {item.icon === 'vehicleNumber' && <VehicleNumberIcon color={getColor(color, 700)} />}
                                    
                                    <View style={styles.textContainer}>
                                        <H5 color={getColor(color, 700)} numberOfLines={1}>
                                            {item.label}
                                        </H5>
                                        <B2 color={getColor(color, 700)} numberOfLines={1}>
                                            {(row.length === 2 && idx === 0)
                                                ? `${item.value?.slice(0, 8)}${item.value && item.value.length > 8 ? "..." : ""}`
                                                : item.value}
                                            </B2>


                                    </View>
                                </View>
                                {idx < row.length - 1 && (
                                    <View style={[styles.verticalDivider, { backgroundColor: getColor(color, 100) }]} />
                                )}
                            </React.Fragment>
                        ))}

                    </View>
                ))}
            </View>
        </View>
    );
};

export default TruckDetailsComponent;

const styles = StyleSheet.create({
    secondContainer: {
        // borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingBottom: 12,
        // paddingVertical: 12,
    },
    columnContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 4,
    },
    textContainer: {
        flexDirection: 'row',
        gap: 8,
        flex: 1,
    },
    verticalDivider: {
        width: 1,
        height: 15,
    },
});