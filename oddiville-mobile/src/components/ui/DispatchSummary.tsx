import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { getColor } from '@/src/constants/colors';
import { B1, B4, C1 } from '../typography/Typography';
import CalandarIcon from '../icons/page/CalandarIcon';
import { SummaryItem } from '@/src/types';

type ColorType = 'red' | 'green' | 'blue' | 'yellow';


const colors: ColorType[] = ['red', 'yellow', 'blue', 'green'];

const DispatchSummary = ({summaryData}: {summaryData: SummaryItem[]}) => {
    return (
        <View style={{ paddingVertical: 16 }}>
            {summaryData.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === summaryData?.length - 1;
                const color = colors[index % colors?.length];

                return (
                    <View key={index} style={styles.row}>
                        <View style={styles.iconWrapper}>
                            {!isFirst && <View style={styles.lineTop} />}
                            <View
                                style={[
                                    styles.circleIcon,
                                    { backgroundColor: getColor(color) },
                                ]}
                            >
                                {item.icon}
                            </View>
                            {!isLast && <View style={styles.lineBottom} />}
                        </View>

                        <View style={styles.content}>
                            <B1>{item.message}</B1>
                            {item.reason ? <B4>{item.reason}</B4> : null}
                            <View style={styles.dateRow}>
                                <CalandarIcon color={getColor('green', 400, 0.6)} />
                                <C1>{item.date}</C1>
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

export default DispatchSummary;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconWrapper: {
        width: 40,
        alignItems: 'center',
        position: 'relative',
    },
    circleIcon: {
        width: 40,
        height: 40,
        borderRadius: 9999,
        padding: 8,
        zIndex: 2,
    },
    lineTop: {
        position: 'absolute',
        top: 0,
        height: '50%',
        width: 1,
        backgroundColor: '#ccc',
        zIndex: 1,
    },
    lineBottom: {
        position: 'absolute',
        top: 0,
        height: '100%',
        width: 1,
        backgroundColor: '#ccc',
        zIndex: 1,
    },
    content: {
        flex: 1,
        paddingBottom: 24,
        paddingLeft: 12,
        gap: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
});
