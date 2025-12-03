import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { B3, B4, H5, H6 } from '@/src/components/typography/Typography';
import { TruckFullDetailsComponentProps } from "@/src/types";
import CustomImage from '../CustomImage';
import PhoneIcon from '../../icons/common/PhoneIcon';
import Tag from '../Tag';
import ActionButton from '../Buttons/ActionButton';
import fallbackDriver from "@/src/assets/images/fallback/driver-fallback.png"
const TruckFullDetailsComponent: React.FC<TruckFullDetailsComponentProps> = ({ data }) => {

    const { title, driverName, number, type, arrival_date, date_title, agency, driverImage } = data;

    return (
        <View style={[styles.column, styles.detailsBorder]}>
            <B3 color={getColor("yellow", 700)} style={{ textTransform: "uppercase" }}>
                {title}
            </B3>
            <View style={styles.row}>
                <View style={styles.rowGap8}>
                    <CustomImage src={fallbackDriver} width={40} height={40} borderRadius={8} />
                    {/* <CustomImage src={driverImage} width={40} height={40} borderRadius={8} /> */}
                    <View>
                        <H5>{driverName}</H5>
                        <B4>{number}</B4>
                    </View>
                </View>

                <View style={styles.rowGap12}>
                    <View style={styles.justifyCenter}>
                        <Tag size='xl'>{type}</Tag>
                    </View>
                    <View style={styles.justifyCenter}>
                        <ActionButton variant='outline' icon={PhoneIcon} />
                    </View>
                </View>
            </View>

            <View style={styles.dateAgency}>
                <View style={styles.dateBlock}>
                    <H6>{date_title}:</H6>
                    <B4>{arrival_date}</B4>
                </View>
                <View style={styles.agencyBlock}>
                    <View style={styles.separator} />
                    <View>
                        <H6>Agency:</H6>
                        <B4>{agency}</B4>
                    </View>
                </View>
            </View>

        </View>
    );
};

export default TruckFullDetailsComponent;

const styles = StyleSheet.create({
    column: {
        flexDirection: "column",
        gap: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    rowGap8: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center"
    },
    rowGap12: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    dateAgency: {
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
    },
    dateBlock: {
        flex: 1
    },
    agencyBlock: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 12,
        flex: 1

    },
    separator: {
        width: 1,
        backgroundColor: getColor("green", 100),
        height: "100%",
    },
    justifyCenter: {
        justifyContent: "center",
    },
    detailsBorder: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
        paddingBottom: 16,
    },
});