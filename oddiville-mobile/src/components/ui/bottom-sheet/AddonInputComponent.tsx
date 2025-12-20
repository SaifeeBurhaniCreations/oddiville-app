import { StyleSheet, TextInput, View } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { AddonInputComponentProps } from '@/src/types';
import { B4, H4 } from '../../typography/Typography';
import { useState } from 'react';
import { useGlobalFormValidator } from '@/src/sbc/form/globalFormInstance';
export type StoreMaterialForm = {
    id: string;
    unit: string;
    size: string;
    quantity: string;
    packaging_size: string;
    packaging_type: string;
};

const AddonInputComponent = ({ data, conditionKey }: AddonInputComponentProps) => {

    const { placeholder, label, value, addonText, formField } = data;
    const [qty, setQty] = useState(value);

    const { values, errors, setField } = useGlobalFormValidator<StoreMaterialForm>("store-product");
    
    const renderAddonText = (text: string) => (
        <B4 color={getColor("green", 400)} style={styles.addonText}>{text}</B4>
    );


    return (
        <View style={styles.inputContainer}>
            <H4>{label}</H4>
        <View style={[styles.inputWrapper, {paddingRight: 0, borderColor: getColor("green", 100) }]}>
        <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        keyboardType='number-pad'
        onChangeText={val => setField(formField as any, val)}
        placeholderTextColor={getColor("green", 700, 0.7)}
        textAlignVertical="center"
        value={values[formField as any] || ""}
    />
            {addonText && renderAddonText(addonText)}
        </View>
        {(errors.formField) && (
                    <View>
                        <B4 color={getColor('red', 700)}>
                            {errors[formField as any] || 'Something went wrong.'}
                        </B4>
                    </View>
                )}
        </View>
    )
};

export default AddonInputComponent;

const styles = StyleSheet.create({
    textInput: {
        flex: 1,
        fontFamily: "FunnelSans-Regular",
        fontSize: 16,
        color: getColor("green", 700),
        minHeight: 44
    },
    inputContainer: {
        flexDirection: "column",
        gap: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: getColor("light"),
        paddingHorizontal: 12,
    },
    addonText: {
        padding: 12,
        backgroundColor: getColor("green", 100),
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
});
