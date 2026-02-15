// 1. React and React Native core
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

// 2. Third-party dependencies
import { ScrollView } from 'react-native-gesture-handler';

// 3. Project components
import Button from '@/src/components/ui/Buttons/Button';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import PageHeader from '@/src/components/ui/PageHeader';
import BottomSheet from '@/src/components/ui/BottomSheet';
import Loader from '@/src/components/ui/Loader';
import FormField from '@/src/sbc/form/FormField';
import FileUploadGallery from '@/src/components/ui/FileUploadGallery';
import CustomImage from '@/src/components/ui/CustomImage';
import { C1, H3 } from '@/src/components/typography/Typography';
import Tag from '@/src/components/ui/Tag';

// 4. Project hooks
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { useParams } from '@/src/hooks/useParams';
import { DispatchOrderProduct, useOrderById, useUpdateOrder } from '@/src/hooks/dispatchOrder';
import { useTrucks } from '@/src/hooks/truck';

// 5. Project constants/utilities
import { useFormValidator } from '@/src/sbc/form';
import { getColor } from '@/src/constants/colors';
import EmptyState from '@/src/components/ui/EmptyState';
import { getEmptyStateData } from '@/src/utils/common';
import { useToast } from '@/src/context/ToastContext';

// 6. Types
// No items of this type

// 7. Schemas
// No items of this type

// 8. Assets 
// No items of this type


type ShippingOrder = {
    agency_name: string;
    driver_name: string;
    phone: string;
    type: string;
    number: string;
    sample_images: File[] | string[];
    status: string;
};

const ShippingDetailsForm = () => {
    const { height: screenHeight } = useWindowDimensions();
    const { goTo } = useAppNavigation();
    const { orderId } = useParams('shipping-details', 'orderId');
    const toast = useToast();
    const { data: truckData, isFetching: truckLoading } = useTrucks();
    const { data: orderData, isFetching: isFetching } = useOrderById(orderId ?? null);
    const updateOrder = useUpdateOrder();

    const [existingImage, setExistingImage] = useState<string[]>([]);
    const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

    const handleTruckSelection = (truck: any) => {
        const truckCapacity = Number(truck.size);
        const orderWeight = Number(totalProductWeight);

        if (orderWeight > truckCapacity) {
            toast.error(
                `Order weight (${orderWeight} kg) exceeds truck capacity (${truckCapacity} kg)`
            );
            return;
        }

        if (selectedTruckId === truck.id) {
            setSelectedTruckId(null);
            setFields({
                agency_name: "",
                driver_name: "",
                phone: "",
                type: "",
                number: "",
                status: "in-progress",
            });
        } else {
            setSelectedTruckId(truck.id);
            setFields({
                agency_name: truck.agency_name || "",
                driver_name: truck.driver_name || "",
                phone: truck.phone || "",
                type: truck.type || "",
                number: truck.number || "",
                status: "in-progress",
            });
        }
    };

    const {
        values,
        setField,
        setFields,
        errors,
        resetForm,
        validateForm,
        isValid,
    } = useFormValidator<ShippingOrder>(
        {
            agency_name: '',
            driver_name: '',
            phone: '',
            type: '',
            number: '',
            sample_images: [],
            status: 'in-progress',
        },
        {
            agency_name: [{ type: 'required', message: 'Agency name is required!' }],
            type: [{ type: 'required', message: 'Type is required!' }],
            driver_name: [{ type: 'required', message: 'Driver name is required!' }],
            number: [{ type: 'required', message: 'Vehicle number is required!' }],
            phone: [
                { type: 'required', message: 'Phone number required' },
                { type: 'maxLength', length: 10, message: 'Max 10 digits' },
            ],
            sample_images: [],
            status: [],
        },
        {
            validateOnChange: false,
            debounce: 300,
        }
    );

    useEffect(() => {
        if (orderId && orderData?.truck_details) {
            resetForm();
            setFields({
                agency_name: orderData.truck_details.agency_name,
                driver_name: orderData.truck_details.driver_name,
                phone: orderData.truck_details.phone,
                type: orderData.truck_details.type,
                number: orderData.truck_details.number,
            });
        }
    }, [orderId, orderData]);

    const onSubmit = async () => {
        const result = validateForm(values);
        if (!result.success) return;

        const formData = new FormData();
        const truck_details = {
            agency_name: result.data.agency_name,
            driver_name: result.data.driver_name,
            phone: result.data.phone,
            type: result.data.type,
            number: result.data.number,
        }
        formData.append('truck_details', JSON.stringify(truck_details));
        formData.append('status', result.data.status);
        formData.append('dispatch_date', JSON.stringify(new Date()));

        if (existingImage?.length > 0) {
            formData.append("existing_sample_images", JSON.stringify(existingImage));
        }

        if (values.sample_images && Array.isArray(values.sample_images)) {
            values.sample_images.forEach((img: any, idx: number) => {
                let fileData: any;
                if (typeof img === 'string') {
                    const name = img.split('/').pop() || `sample_image_${idx}.jpg`;
                    const type = name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
                    fileData = { uri: img, name, type };
                } else if (img instanceof File) {
                    fileData = img;
                }
                if (fileData) formData.append("sample_images", fileData);
            });
        }

        updateOrder.mutate({ id: orderId!, data: formData }, {
            onSuccess: (result) => { toast.success('Shipping details updated successfully!'); goTo('sales') },
            onError: (error) => { toast.error('Failed to update shipping details'); }
        });
    };
    const emptyStateData = getEmptyStateData("truck_details");

    const totalProductWeight =
        orderData?.dispatched_items
            ? Object.values(orderData.dispatched_items).reduce(
                (productTotal: number, skuObj: any) => {
                    return (
                        productTotal +
                        Object.values(skuObj).reduce((skuTotal: number, skuData: any) => {
                            const { packet, totalBags } = skuData;

                            if (!packet || !totalBags) return skuTotal;

                            const { size, unit, packetsPerBag } = packet;

                            const weightInGrams =
                                Number(totalBags) *
                                Number(packetsPerBag) *
                                Number(size);

                            const weightInKg =
                                unit === "gm" ? weightInGrams / 1000 : weightInGrams;

                            return skuTotal + weightInKg;
                        }, 0)
                    );
                },
                0
            )
            : 0;

    return (
        <View style={styles.pageContainer}>
            <PageHeader page="Shipping Details" />
            <ScrollView>
                <View style={styles.wrapper}>
                    <View style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}>
                        <BackButton label="Update Shipping Details" backRoute="home" />
                    </View>

                    <FormField name="sample_images" form={{ values, setField, errors }}>
                        {({ value, onChange, error }) => (
                            <FileUploadGallery
                                fileStates={[
                                    value,
                                    onChange
                                ]}
                                existingStates={[existingImage, setExistingImage]}
                            >
                                Capture photo
                            </FileUploadGallery>
                        )
                        }
                    </FormField>

                    <View style={{ flexDirection: 'column', flex: 1, gap: 16 }}>
                        {
                            !truckLoading && truckData && truckData?.length > 0 ? truckData?.map((truck, index: number) => {
                                const truckCapacity = Number(truck.size);
                               const rawRemaining = truckCapacity - totalProductWeight;
                            const remaining = Math.max(0, rawRemaining);
                            const isOverWeight = rawRemaining < 0;

                                return (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={[
                                            styles.container,
                                            isOverWeight && { opacity: 0.5 }
                                        ]}

                                        onPress={() => truck.active && !isOverWeight && handleTruckSelection(truck)}
                                        disabled={!truck.active || isOverWeight}
                                        >
                                        <View style={styles.card}>
                                            <View style={styles.headerRow}>
                                                <View style={styles.leftRow}>
                                                    {truck?.challan && <CustomImage style={styles.avatar} src={truck?.challan} width={40} height={40} />}
                                                    <View style={styles.nameSection}>
                                                        <View style={styles.nameRow}>
                                                            <H3 color={getColor('green', 700)}>{truck.number}</H3>
                                                        </View>
                                                      <C1 color={isOverWeight ? "red" : getColor("green", 400)}>
                                                        {truck.agency_name || "Unknown Agency"} | 
                                                        Capacity: {truck.size} kg | 
                                                        Remaining: {remaining} kg
                                                        {isOverWeight && " (Over Capacity)"}
                                                        </C1>

                                                    </View>
                                                </View>
                                                <View style={styles.headerRow}>
                                                    {
                                                        selectedTruckId === truck?.id && <Tag color={'yellow'} size="md">Selected</Tag>
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }) : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <EmptyState stateData={emptyStateData} style={{ marginTop: -(screenHeight / 7) }} />
                            </View>
                        }
                    </View>

                    <Button onPress={onSubmit}   disabled={!isValid || updateOrder.isPending || !selectedTruckId}>
                        {updateOrder.isPending ? 'Proceeding...' : 'Proceed'}
                    </Button>
                </View>
            </ScrollView>

            <BottomSheet color="green" />
            {(isFetching || updateOrder.isPending) && (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            )}
        </View>
    );
};

export default ShippingDetailsForm;


const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
    },
    wrapper: {
        flex: 1,
        gap: 24,
        flexDirection: 'column',
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        padding: 16,
        minHeight: '100%'
    },
    HStack: {
        flexDirection: 'row',
        gap: 8,
    },
    justifyBetween: {
        justifyContent: 'space-between',
    },
    alignCenter: {
        alignItems: 'center',
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

    container: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: getColor("light", 500),
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
    },
    card: {
        padding: 12,
        gap: 8,
        backgroundColor: getColor("light"),
        borderRadius: 16,
        overflow: "hidden",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    leftRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    nameSection: {
        flexDirection: "column",
        gap: 0,
        flexShrink: 1,
    },
    nameRow: {
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap",
    },
    avatar: {
        borderRadius: 8,
    },
    roleDefinationText: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
});