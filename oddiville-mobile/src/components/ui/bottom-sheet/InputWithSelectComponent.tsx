import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { InputWithSelectComponentProps } from '@/src/types';
import { B4, C1, H4 } from '../../typography/Typography';
import React, { useState } from 'react';
import DownChevron from '../../icons/navigation/DownChevron';
import { RootState } from '@/src/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { getLimitedMaterialNames } from '@/src/utils/arrayUtils';
import { useGlobalFormValidator } from '@/src/sbc/form/globalFormInstance';
import { setSource } from '@/src/redux/slices/unit-select.slice';
import { setSource as setRmSource } from '@/src/redux/slices/bottomsheet/raw-material.slice';
import { StoreMaterialForm } from './AddonInputComponent';
import { selectChamber } from '@/src/redux/slices/chamber.slice';
import { setChamberQty } from '@/src/redux/slices/bottomsheet/chamber-ratings.slice';
import { computeCurrentValue } from '@/src/utils/common';
import { useChamber } from '@/src/hooks/useChambers';
import { useChamberStock } from '@/src/hooks/useChamberStock';
import DetailsToast from '../DetailsToast';
import { RMSoruceMap } from '@/src/lookups/getRMBackSource';

export type AddProductPackageForm = {
    raw_materials: string[];
    product_name: string;
    unit: string;
    size: string;
    quantity: string;
    chamber_name: string;
};

export type AddPackageSizeForm = {
    id: string;
    unit: string;
    size: string;
    quantity: string;
};

const InputWithSelectComponent = ({ data }: InputWithSelectComponentProps) => {
    const dispatch = useDispatch()
    const { slectedUnit } = useSelector((state: RootState) => state.selectUnit);
    const selectedRawMaterial = useSelector((state: RootState) => state.rawMaterial.selectedRawMaterials);
    const chamberRatingsById = useSelector((state: RootState) => state.chamberRatings.byId);
    const { meta } = useSelector((state: RootState) => state.bottomSheet);
    // const { chambers, chamberCapacityWithName } = useSelector((state: RootState) => state.productionBegins);

    const { data: chambersY } = useChamber();
    const { data: stocksY } = useChamberStock();

    type Chamber = {
        id: string;
        chamber_name: string;
        capacity: number;
    };

    type ChamberGoods = {
        id: string;
        chamber: { id: string; quantity: string }[];
    };

    function getRemainingChamberQuantities(
        chambersY: Chamber[] | undefined,
        stocksY: ChamberGoods[] | undefined
    ) {
        return (chambersY ?? []).map(chamber => {
            const quantities = (stocksY ?? []).flatMap(stock =>
                stock.chamber
                    .filter(ch => ch.id === chamber.id)
                    .map(ch => parseFloat(ch.quantity))
            );
            const totalOccupied = quantities.reduce((acc, val) => acc + val, 0);
            const remaining = chamber.capacity - totalOccupied;

            return {
                chamber_id: chamber.id,
                chamber_name: chamber.chamber_name,
                capacity: chamber.capacity,
                occupied: totalOccupied,
                remaining
            };
        });
    }

    const [toastVisible, setToastVisible] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    const [toastMessage, setToastMessage] = useState("");

    const { validateAndSetData } = useValidateAndOpenBottomSheet();

    const packageFormValidator = useGlobalFormValidator<AddProductPackageForm>('add-product-package');

    const packageSizeValidator = useGlobalFormValidator<AddPackageSizeForm>('add-package-size');
    const { values: storeValues, errors: storeErrors, setField: storeSetField } = useGlobalFormValidator<StoreMaterialForm>('store-product');

    const { placeholder, label, value, placeholder_second, label_second, key, alignment, formField_1, source, source2 } = data;
    const [qty, setQty] = useState(value);

    const showToast = (type: "success" | "error" | "info", message: string) => {
        setToastType(type);
        setToastMessage(message);
        setToastVisible(true);
    };

    const handlePress = () => {
        console.log("source2", source2);
        
        dispatch(setSource(source));
        const mapKey = `${key}:${source}`;
        const mapped = RMSoruceMap[mapKey];
        if(source2) {
            dispatch(setRmSource(source2));
        } else if (mapped) {
            dispatch(setRmSource(mapped));
          }


        if (['package-weight', 'add-raw-material'].includes(key)) {
            validateAndSetData('Abc123', key);
        } else if (source === 'supervisor-production') {
            validateAndSetData('Abc123', 'rating');
            dispatch(selectChamber(formField_1))
        }
    };

    const { values, errors, setField } =
        meta?.type === 'add-product-package' ? packageFormValidator : packageSizeValidator;

    const chamberKey: string = (formField_1 ?? '').trim();

    const chamberRating: string = chamberKey ? chamberRatingsById[chamberKey]?.rating ?? '' : '';

    const addRawMaterialValue = getLimitedMaterialNames(selectedRawMaterial, 10);

    const rawMap = {
        'add-raw-material': addRawMaterialValue,
        'supervisor-production': chamberRating,
        'package-weight': slectedUnit
    };

    const placeholder_second_val = placeholder_second ? placeholder_second : "Select";

    const raw = rawMap[key] !== undefined ? rawMap[key] : false;

    const currentValue = computeCurrentValue(key, raw, chamberRating, placeholder_second_val);

    const currentChamberName = String(formField_1);

    const chamberSummary = getRemainingChamberQuantities(chambersY, stocksY)?.find(
        c => c.chamber_name === currentChamberName
    );

    const remainingKg = chamberSummary?.remaining;

    const renderInput = () => (
        meta?.type === 'add-product-package' || meta?.type === 'add-package' || meta?.type === 'supervisor-production' ? (
            <>
                <TextInput
                    style={styles.textInput}
                    keyboardType={(meta?.type === 'add-product-package' || meta?.type === 'add-package') ? 'default' : 'number-pad'}
                    placeholder={placeholder}
                    onChangeText={(val) => {
                        if (meta?.type === 'supervisor-production') {
                            const inputQty = Number(val) || 0;
                            const name = typeof formField_1 === "string" ? formField_1 : "";

                            if (remainingKg !== undefined && inputQty > remainingKg) {
                                storeSetField(name as keyof StoreMaterialForm, String(remainingKg));
                                dispatch(setChamberQty({ name, quantity: String(remainingKg) }));
                                showToast("error", `Capacity not available! Value adjusted to remaining: ${remainingKg} Kg`);
                                return;
                            }
                            storeSetField(name as keyof StoreMaterialForm, String(inputQty));
                            dispatch(setChamberQty({ name, quantity: String(inputQty) }));
                        } else {
                            setField(formField_1 as any, val);
                        }
                    }}
                    // onChangeText={(val) => {
                    //     if (meta?.type === 'supervisor-production') {
                    //         const key = formField_1 as keyof StoreMaterialForm;
                    //         const prevValue = storeValues[key];
                    //         const value = {
                    //             ...(typeof prevValue === 'object' && prevValue !== null ? prevValue : { rating: 0 }),
                    //             quantity: Number(val) || 0,
                    //         };
                    //         dispatch(setChamberQty({ name: key, quantity: String(Number(val) || 0) }))
                    //         storeSetField(key, value);
                    //     } else {
                    //         setField(formField_1 as any, val);
                    //     }
                    // }}
                    placeholderTextColor={getColor('green', 700, 0.7)}
                    textAlignVertical='center'
                    value={meta?.type === 'supervisor-production' ? storeValues[formField_1 as any] || '' : values[formField_1 as any] || ''}
                />
                {(errors.formField_1) && (
                    <View>
                        <B4 color={getColor('red', 700)}>
                            {meta?.type === 'supervisor-production' ? storeErrors[formField_1 as any] || '' : errors[formField_1 as any] || 'Something went wrong.'}
                        </B4>
                    </View>
                )}
            </>
        ) : (
            <TextInput
                style={styles.textInput}
                placeholder={placeholder}
                onChangeText={(newQty) => setQty(newQty)}
                placeholderTextColor={getColor('green', 700, 0.7)}
                textAlignVertical='center'
                value={qty}
            />
        )
    );

    return (
        <>
        <View style={styles.inputContainer}>
            <View style={styles.inputSelectWrapper}>
                <View style={{ flex: alignment === 'half' ? 1 : 5, flexDirection: 'column', gap: 8 }}>
                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                        <H4>{label.slice(0, 13)}...</H4>
                        <B4 color={getColor('green', 700)}>
                            {remainingKg} Kg
                        </B4>
                    </View>
                    <View style={[styles.inputWrapper, { borderColor: getColor('green', 100) }]}>
                        {renderInput()}
                    </View>
                </View>

                <View style={{ flexDirection: "column", gap: 4, alignItems: "center" }}>
                    <View style={{ flex: alignment === 'half' ? 1 : 2, flexDirection: 'column', gap: 8 }}>
                        <H4>{label_second}</H4>
                        <TouchableOpacity style={[styles.selectContainer, { borderWidth: storeErrors[chamberKey] ? 1 : 0, borderColor: getColor("red") }]} onPress={handlePress}>
                            <B4 color={getColor('green', 700)}>{currentValue}</B4>
                            <DownChevron size={16} color={getColor('green', 700)} />
                        </TouchableOpacity>
                    </View>
                    {storeErrors[chamberKey] && (
                        <View>
                            <C1 color={getColor('red', 700)}>
                                {String(storeErrors[chamberKey] || 'Field required!')}
                            </C1>
                        </View>
                    )}
                </View>
            </View>
        </View>        
        <DetailsToast
            type={toastType}
            message={toastMessage}
            visible={toastVisible}
            onHide={() => setToastVisible(false)}
          />
          </>
    );
}

export default InputWithSelectComponent;

const styles = StyleSheet.create({
    textInput: {
        flex: 1,
        fontFamily: 'FunnelSans-Regular',
        fontSize: 16,
        color: getColor('green', 700),
        minHeight: 44
    },
    inputContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: getColor('light'),
        paddingHorizontal: 12,
    },
    addonText: {
        padding: 12,
        backgroundColor: getColor('green', 100),
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    inputSelectWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectContainer: {
        backgroundColor: getColor('light'),
        borderWidth: 1,
        borderColor: getColor('green', 100),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 44,

    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.05),
        zIndex: 2,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
