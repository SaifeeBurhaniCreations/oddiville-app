import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FilterComponentProps } from '@/src/types/export/types'
import Input from '../../Inputs/Input'

const CustomTimeRange = ({ state, setState }: FilterComponentProps) => {
    return (
        <View style={styles.Hstack}>
            <Input
                value={state.from ?? ""}
                onChangeText={(date: string) =>
                    setState(prev => ({ ...prev, from: date }))
                }
                placeholder="Select date"
                mask="date"
                style={{ flex: 1 }}
            >
                From
            </Input>

            <Input
                value={state.to ?? ""}
                onChangeText={(date: string) =>
                    setState(prev => ({ ...prev, to: date }))
                }
                placeholder="Select date"
                mask="date"
                style={{ flex: 1 }}
            >
                To
            </Input>
        </View>
    );
};

export default CustomTimeRange

const styles = StyleSheet.create({
    Hstack: {
        flexDirection: "row",
        gap: 16,
    },
})