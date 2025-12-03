// 1. React and React Native core
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// 2. Third-party dependencies
import { ScrollView } from 'react-native-gesture-handler';

// 3. Project components
import Button from '@/src/components/ui/Buttons/Button';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import PageHeader from '@/src/components/ui/PageHeader';
import BottomSheet from '@/src/components/ui/BottomSheet';
import Loader from '@/src/components/ui/Loader';
import FormField from '@/src/sbc/form/FormField';
import DetailsToast from '@/src/components/ui/DetailsToast';
import FileUploadGallery from '@/src/components/ui/FileUploadGallery';
import CustomImage from '@/src/components/ui/CustomImage';
import { C1, H3 } from '@/src/components/typography/Typography';
import Tag from '@/src/components/ui/Tag';

// 4. Project hooks
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { useParams } from '@/src/hooks/useParams';
import { useOrderById, useUpdateOrder } from '@/src/hooks/dispatchOrder';
import { useTrucks } from '@/src/hooks/truck';

// 5. Project constants/utilities
import { useFormValidator } from '@/src/sbc/form';
import { getColor } from '@/src/constants/colors';

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
    const { goTo } = useAppNavigation();
    const { orderId } = useParams('shipping-details', 'orderId');
    const { data: truckData, isFetching: truckLoading } = useTrucks();
    const { data: orderData, isFetching: isFetching } = useOrderById(orderId ?? null);
    const updateOrder = useUpdateOrder();

    const [toastVisible, setToastVisible] = useState(false);
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
    const [toastMessage, setToastMessage] = useState('');
    const [existingImage, setExistingImage] = useState<string[]>([]);
    const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

    const showToast = (type: 'success' | 'error' | 'info', message: string) => {
        setToastType(type);
        setToastMessage(message);
        setToastVisible(true);
    };

    const handleTruckSelection = (truck: any) => {
        // If the same truck is already selected, deselect it
        if (selectedTruckId === truck.id) {
            setSelectedTruckId(null);
            // Clear form fields when deselecting
            setFields({
                agency_name: '',
                driver_name: '',
                phone: '',
                type: '',
                number: '',
                status: 'in-progress',
            });
        } else {
            // Select the new truck
            setSelectedTruckId(truck.id);

            // Update form fields with truck data
            setFields({
                agency_name: truck.agency_name || '',
                driver_name: truck.driver_name || '',
                phone: truck.phone || '',
                type: truck.type || '',
                number: truck.number || '',
                status: 'in-progress',
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
            onSuccess: (result) => { showToast('success', 'Shipping details updated successfully!'); goTo('admin-orders') },
            onError: (error) => { showToast('error', 'Failed to update shipping details'); }
        });
    };

    return (
        <View style={styles.pageContainer}>
            <PageHeader page="Shipping Details" />
            <ScrollView>
                <View style={styles.wrapper}>
                    <View style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}>
                        <BackButton label="Update Shipping Details" backRoute="admin-home" />
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

                    <ScrollView>
                        <View style={{ flexDirection: 'column', flex: 1, gap: 16 }}>
                            {
                                !truckLoading && truckData?.map((truck, index: number) => {
                                    return (
                                        <TouchableOpacity
                                            style={styles.container}
                                            onPress={() => truck.active && handleTruckSelection(truck)}
                                            key={index}
                                            activeOpacity={0.8}
                                            disabled={!truck.active}
                                        >
                                            <View style={styles.card}>
                                                <View style={styles.headerRow}>
                                                    <View style={styles.leftRow}>
                                                        {truck?.challan && <CustomImage style={styles.avatar} src={truck?.challan} width={40} height={40} />}
                                                        <View style={styles.nameSection}>
                                                            <View style={styles.nameRow}>
                                                                <H3 color={getColor('green', 700)}>{truck.number}</H3>
                                                            </View>
                                                            <C1 color={getColor('green', 400)}>{truck.agency_name || "Unknown Agency"}</C1>
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
                                })
                            }
                        </View>
                    </ScrollView>

                    <Button onPress={onSubmit} disabled={!isValid || updateOrder.isPending}>
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
            <DetailsToast
                type={toastType}
                message={toastMessage}
                visible={toastVisible}
                onHide={() => setToastVisible(false)}
            />
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