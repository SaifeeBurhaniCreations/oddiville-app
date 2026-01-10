import PageHeader from '@/src/components/ui/PageHeader';
import { getColor } from '@/src/constants/colors';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import Select from '@/src/components/ui/Select';
import Input from '@/src/components/ui/Inputs/Input';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import BottomSheet from '@/src/components/ui/BottomSheet';
import { useState, useEffect } from 'react';
import Loader from '@/src/components/ui/Loader';
import Button from '@/src/components/ui/Buttons/Button';
import { RootState } from '@/src/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import PriceInput from '@/src/components/ui/Inputs/PriceInput';
import VendorPricing from '@/src/components/ui/VendorPricing';
import { getLimitedMaterialNames, getLimitedVendorNames } from '@/src/utils/arrayUtils';
import DetailsToast from '@/src/components/ui/DetailsToast'
import { useFormValidator } from '@/src/sbc/form';
import FormField from '@/src/sbc/form/FormField';
import { VendorInputState } from '@/src/types';
import { clearRawMaterials, setSource } from '@/src/redux/slices/bottomsheet/raw-material.slice';
import { addRawMaterialOrder } from '@/src/services/rawmaterial.service';
import { clearVendors } from '@/src/redux/slices/bottomsheet/vendor.slice';
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { Platform } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { resolveAccess } from '@/src/utils/policiesUtils';
import { PURCHASE_BACK_ROUTES, resolveBackRoute, resolveDefaultRoute } from '@/src/utils/backRouteUtils';

const screenHeight = Dimensions.get('window').height;

type RawMaterialOrderForm = {
    quantity: number | null;
    rawMaterial: any[];
    vendors: any[];
    est_arrival_date: string;
    order_date: string;
    vendorQuantities: VendorInputState[];
};

const RawMaterialOrderScreen = () => {
  const { role, policies } = useAuth();
    
    const safeRole = role ?? "guest";
    const safePolicies = policies ?? [];
    const access = resolveAccess(safeRole, safePolicies);

    const dispatch = useDispatch();
    const { validateAndSetData } = useValidateAndOpenBottomSheet();
    const selectedRM = useSelector((state: RootState) => state.rawMaterial.selectedRawMaterials);
    const selectedVendor = useSelector((state: RootState) => state.vendor.selectedVendors);

    const [totalWeight, setTotalWeight] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    const [toastMessage, setToastMessage] = useState("");

    const { goTo } = useAppNavigation()

    const showToast = (type: "success" | "error" | "info", message: string) => {
        setToastType(type);
        setToastMessage(message);
        setToastVisible(true);
    };

    const {
        values,
        setField,
        errors,
        resetForm,
        validateForm,
        isValid,
    } = useFormValidator<RawMaterialOrderForm>(
        {
            quantity: null,
            rawMaterial: [],
            vendors: [],
            order_date: new Date().toISOString(),
            est_arrival_date: "",
            vendorQuantities: [],
        },
        {
            quantity: [
                { type: 'required', message: "quantity required !" },
                { type: 'number', message: "quantity must be number !" }
            ],
            rawMaterial: [
                {
                    type: 'custom',
                    validate: (val) => Array.isArray(val) && val?.length > 0,
                    message: 'Select at least one raw material',
                }
            ],
            vendors: [
                {
                    type: 'custom',
                    validate: (val) => Array.isArray(val) && val?.length > 0,
                    message: "Vendors required !"
                }
            ],
            est_arrival_date: [],
            order_date: [],
            vendorQuantities: [
                
            ],
        },
        {
            validateOnChange: true,
            debounce: 300
        }
    );

    useEffect(() => {
        if (!selectedVendor || selectedVendor?.length === 0) {
            setField('vendorQuantities', []);
            return;
        }

        const existing = values.vendorQuantities;

        const updated = selectedVendor.map((vendor: any) => {
            const found = existing.find(v => v.name === vendor.name);
            return (
                found || {
                    name: vendor.name,
                    price: 0,
                    quantity: 0,
                }
            );
        });

        const updatedIds = new Set(selectedVendor.map(v => v.name));
        const isDifferent =
            updated?.length !== existing?.length ||
            existing.some((v) => !updatedIds.has(v.name));

        if (isDifferent) {
            setField('vendorQuantities', updated);
        }
    }, [selectedVendor]);

    const onSubmit = async () => {
        const updatedValues = {
            ...values,
            rawMaterial: selectedRM,
            vendors: selectedVendor,
        };

        const updatedVendorQuantities = updatedValues.vendorQuantities.map(vendor => {
            const price = Number(vendor.price);
            const quantity = Number(vendor.quantity);

            return {
                ...vendor,
                price: price * quantity,
            };
        });
        const newValue = { ...updatedValues, vendorQuantities: updatedVendorQuantities, };

        setField("rawMaterial", selectedRM);
        setField("vendors", selectedVendor);


        const result = validateForm(newValue);
        if (result.success) {
            setIsSubmitting(true)
            setIsLoading(true);
            const response = await addRawMaterialOrder(result.data);

            if (response.status === 201) {
                setIsSubmitting(false)
                setIsLoading(false);
                showToast('info', 'Order placed!')
                resetForm()
                dispatch(clearRawMaterials())
                dispatch(clearVendors())
                goTo('purchase')
            }
        }
    };

    const handleOpen = async () => {
        setIsLoading(true);
        dispatch(setSource("add"))
        await validateAndSetData("Abc123", "add-raw-material");
        setIsLoading(false);
    };

    const handleVendorOpen = async () => {
        setIsLoading(true);
        await validateAndSetData("Abc123", "add-vendor");
        setIsLoading(false);
    };

    const isNotChoosed = selectedRM?.length === 0;

    const backRoute = resolveBackRoute(access, PURCHASE_BACK_ROUTES, resolveDefaultRoute(access));
    
    return (
        <View style={styles.pageContainer}>
            <PageHeader page={'Raw material'} />
            <View style={styles.wrapper}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 110}
                >
                    <ScrollView
                                keyboardShouldPersistTaps="handled"
                                 contentContainerStyle={{
    paddingBottom: Math.max(24, Math.min(56, screenHeight * 0.2)),
  }}
                                showsVerticalScrollIndicator={false}
                            >
                        <View style={styles.headerBodyWrapper}>
                            <BackButton label='Order raw material' backRoute={backRoute} style={styles.paddingH16} />

                            <View style={styles.body}>
                                {!isNotChoosed ?
                                    <View style={[styles.contentRow1, styles.paddingH16]}>
                                        <View style={{ flex: 1 }}>
                                            <FormField name="rawMaterial" form={{ values, setField, errors }}>
                                                {({ value, onChange, error }) => (
                                                    <Select
                                                        value={getLimitedMaterialNames(selectedRM, 10) || "Select raw material"}
                                                        options={[]}
                                                        onPress={async () => {
                                                            setIsLoading(true);
                                                            dispatch(setSource("add"))
                                                            await validateAndSetData("Abc123", "add-raw-material");
                                                            setIsLoading(false);

                                                            onChange(selectedRM);
                                                        }}
                                                        showOptions={false}
                                                        error={error}
                                                        legacy
                                                    >
                                                        Raw material
                                                    </Select>
                                                )}
                                            </FormField>
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <FormField name="quantity" form={{ values, setField, errors }}>
                                                {({ value, onChange, error }) => (
                                                    <PriceInput
                                                        value={value === null ? "" : String(value)}
                                                        onChangeText={(val: string) => {
                                                            onChange(val);
                                                            setTotalWeight(Number(val));
                                                        }}
                                                        placeholder="Enter"
                                                        addonText="Kg"
                                                        error={error}
                                                    >
                                                        Order quantity
                                                    </PriceInput>
                                                )}
                                            </FormField>
                                        </View>
                                    </View>

                                    :
                                    <Select options={["Select raw material"]} onPress={handleOpen} showOptions={false} style={styles.paddingH16} legacy>
                                        Raw material
                                    </Select>
                                }

                                <View style={styles.paddingH16}>
                                    <FormField name="est_arrival_date" form={{ values, setField, errors }}>
                                        {({ value, onChange, error }) => (
                                            <Input
                                                value={value || ""}
                                                onChangeText={onChange}
                                                placeholder="Select date"
                                                mask="date"
                                                error={error}
                                            >
                                                Est. arrival date (Optional)
                                            </Input>
                                        )}
                                    </FormField>
                                </View>


                                <View style={styles.paddingH16}>
                                    <Select
                                        value={getLimitedVendorNames(selectedVendor, 30) || "Select vendor"}
                                        options={[]}
                                        onPress={handleVendorOpen}
                                        showOptions={false}
                                        disabled={totalWeight === 0}
                                        error={errors?.vendors}
                                        legacy
                                    >
                                        Vendor
                                    </Select>
                                </View>

                                {totalWeight > 0 && selectedRM?.length > 0 && selectedVendor?.length > 0 &&
                                    <FormField name="vendorQuantities" form={{ values, setField, errors }}>
                                        {({ value, onChange, error }) => (
                                            <VendorPricing
                                                values={value}
                                                totalWeight={totalWeight}
                                                onChangeVendors={onChange}
                                                showToast={showToast}
                                                vendorCount={selectedVendor?.length}
                                            />
                                        )}
                                    </FormField>
                                }


                            </View>
                            
                            <View style={styles.paddingH16}>
                                <Button variant='fill' disabled={!isValid || isSubmitting} onPress={onSubmit}>{isSubmitting ? 'Placing order...' : 'Place order'}</Button>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>

            <BottomSheet color='green' />

            {isLoading && (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            )}

            <DetailsToast
                type={toastType}
                message={toastMessage}
                visible={toastVisible}
                onHide={() => setToastVisible(false)}
            />
        </View>
    )
}

export default RawMaterialOrderScreen

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
        position: "relative",
    },
    wrapper: {
        flex: 1,
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        paddingVertical: 16,
        justifyContent: "space-between",
    },
    headerBodyWrapper: {
        flexDirection: "column",
        gap: 24,
    },
    body: {
        flexDirection: "column",
        gap: 16,
    },
    contentRow1: {
        flexDirection: "row",
        gap: 16,
    },
    flexGrow: {
        flex: 1,
    },
    flexWrap: {
        flexWrap: "wrap",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.1),
        zIndex: 2,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paddingH16: {
        paddingHorizontal: 16
    },
    paddingH12: {
        paddingHorizontal: 12      
    },
    keyboardAvoidingView: {
        flex: 1,
    },
});