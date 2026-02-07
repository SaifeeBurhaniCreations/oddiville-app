// 1. React and React Native core
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';

// 2. Third-party dependencies
import { formatDate, isValid as isValidDate } from 'date-fns';

// 3. Project components
import PageHeader from '@/src/components/ui/PageHeader';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import SupervisorOrderDetailsCard from '@/src/components/ui/Supervisor/SupervisorOrderDetailsCard';
import TruckWeightCard from '@/src/components/ui/TruckWeightCard';
import PriceInput from '@/src/components/ui/Inputs/PriceInput';
import RatingCard from '@/src/components/ui/RatingCard/RatingCard';
import FileUpload from '@/src/components/ui/FileUpload';
import Button from '@/src/components/ui/Buttons/Button';
import LinkButton from '@/src/components/ui/Buttons/LinkButton';
import DatabaseIcon from '@/src/components/icons/page/DatabaseIcon';
import Loader from '@/src/components/ui/Loader';

// 4. Project hooks
import { useParams } from '@/src/hooks/useParams';
import { useProductionById, useStartProduction } from '@/src/hooks/production';
import { useRawMaterialOrderById } from '@/src/hooks/useRawMaterialOrders';
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { useAdmin } from '@/src/hooks/useAdmin';

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';
import FormField from '@/src/sbc/form/FormField';
import { useFormValidator } from '@/src/sbc/form';

// 6. Types
import { OrderProps } from '@/src/types';
import DetailsToast from '@/src/components/ui/DetailsToast';
import { useAuth } from '@/src/context/AuthContext';
import { resolveAccess } from '@/src/utils/policiesUtils';
import { PRODUCTION_BACK_ROUTES, resolveBackRoute, resolveDefaultRoute } from '@/src/utils/backRouteUtils';

type RNImageFile = {
    uri: string;
    type?: string;
    fileName?: string;
    name?: string;
};

type ProductionStart = {
    sample_quantity: string;
    rating: string;
    sample_image: string | RNImageFile | null;
    supervisor: string;
};

// Constants
const DEFAULT_VALUE = "--";
const KG_TO_TONS = 1000;
const DATE_FORMAT = "MMM d, yyyy";

const ProductionStartScreen = () => {
    const { role, policies } = useAuth();

    const safeRole = role ?? "guest";
    const safePolicies = policies ?? [];
    const access = resolveAccess(safeRole, safePolicies);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    const [toastMessage, setToastMessage] = useState("");

    // Hooks
    const { rmId: id } = useParams('raw-material-receive', 'rmId');
    const { goTo } = useAppNavigation();
    const adminData = useAdmin();

    const {
        data: productionData,
        isFetching: productFetching,
        error: productionError,
        isError: isProductionError
    } = useProductionById(id!);

    const rawOrderId = productionData?.raw_material_order_id;
    const {
        data: rawMaterialOrderData,
        isFetching: dataFetching,
        error: rawMaterialError,
        isError: isRawMaterialError
    } = useRawMaterialOrderById(rawOrderId);

    const startProduction = useStartProduction();

    const showToast = (type: "success" | "error" | "info", message: string) => {
        setToastType(type);
        setToastMessage(message);
        setToastVisible(true);
    };

    useEffect(() => {
        if (isProductionError && productionError) {
            showToast("error", "Failed to load production data. Please try again!");

            goTo('production')
        }
        if (isRawMaterialError && rawMaterialError) {
            showToast("error", "Failed to load raw material order data!");
        }
    }, [isProductionError, productionError, isRawMaterialError, rawMaterialError, goTo]);

    const {
        values,
        setField,
        errors,
        validateForm,
        resetForm,
        isValid,
    } = useFormValidator<ProductionStart>(
        {
            sample_quantity: '0',
            rating: '',
            sample_image: null,
            supervisor: adminData?.name || '',
        },
        {
            sample_quantity: [],
            rating: [
                {
                    type: 'custom',
                    validate: (value: number) => {
                        if (!value || value === 0) return false;
                        const ratings = [1, 2, 3, 4, 5];
                        console.log(value);

                        if (!ratings.includes(value)) return false;
                        return true;
                    },
                    message: "Rating is required and must be one of 1, 2, 3, 4, 5."
                }
            ],
            sample_image: [],
            // sample_image: [
            //     {
            //         type: 'custom',
            //         validate: (value: any) => {
            //             if (!value) return false;
            //             if (typeof value === 'string' && !value.trim()) return false;
            //             if (typeof value === 'object' && (!value.uri || !value.uri.trim())) return false;
            //             return true;
            //         },
            //         message: "Sample image is required and must be a valid image file."
            //     }
            // ],
        },
        {
            validateOnChange: true,
            debounce: 300,
        }
    );
   
    const orderDetail = useMemo<OrderProps>(() => {
        const safeProductName = productionData?.product_name || DEFAULT_VALUE;
        const safeVendor = rawMaterialOrderData?.vendor || DEFAULT_VALUE;

        const quantityReceived = rawMaterialOrderData?.quantity_received;
        const unit = rawMaterialOrderData?.unit;
        const quantityText = quantityReceived && unit
            ? `${quantityReceived} ${unit}`
            : DEFAULT_VALUE;

        const orderDate = rawMaterialOrderData?.order_date;
        const arrivalDate = rawMaterialOrderData?.arrival_date;

        const formatDateSafely = (dateInput: any) => {
            if (!dateInput) return DEFAULT_VALUE;
            try {
                const date = new Date(dateInput);
                return isValidDate(date) ? formatDate(date, DATE_FORMAT) : DEFAULT_VALUE;
            } catch {
                return DEFAULT_VALUE;
            }
        };

        return {
            title: safeProductName,
            name: safeVendor,
            description: [
                {
                    name: "Quantity",
                    value: quantityText,
                    iconKey: "database",
                },
            ],
            helperDetails: [
                {
                    name: "Order",
                    value: formatDateSafely(orderDate),
                },
                {
                    name: "Arrival",
                    value: formatDateSafely(arrivalDate),
                },
            ],
        };
    }, [productionData, rawMaterialOrderData]);

    const truckDetails = useMemo(() => {
        const truckDetailsData = rawMaterialOrderData?.truck_details;

        if (!truckDetailsData) {
            return {
                title: DEFAULT_VALUE,
                description: "Product weight",
                truckWeight: DEFAULT_VALUE,
                otherDescription: "Truck weight",
            };
        }

        const parseTruckWeight = (weight: any): number => {
            if (typeof weight === 'number') return weight;
            if (typeof weight === 'string') {
                const parsed = parseFloat(weight);
                return isNaN(parsed) ? 0 : parsed;
            }
            return 0;
        };

        const truckWeight = parseTruckWeight(truckDetailsData.truck_weight);
        const tareWeight = parseTruckWeight(truckDetailsData.tare_weight);

        const netWeight = truckWeight > 0 && tareWeight > 0
            ? truckWeight - tareWeight
            : 0;

        return {
            title: netWeight > 0 ? `${(netWeight)} Kg` : DEFAULT_VALUE,
            description: "Product weight",
            truckWeight: truckWeight > 0 ? `${(truckWeight / KG_TO_TONS).toFixed(2)} Tons` : DEFAULT_VALUE,
            otherDescription: "Truck weight",
        };
    }, [rawMaterialOrderData]);

    const buildFormData = useCallback((form: ProductionStart, status: string): FormData => {
        const formData = new FormData();

        formData.append("sample_quantity", form.sample_quantity.trim());
        formData.append("rating", form.rating);
        formData.append("status", status);
        formData.append("start_time", new Date().toISOString());

        if (status === 'in-progress' && adminData?.name) {
            formData.append("supervisor", adminData.name.trim());
        }

        if (form.sample_image) {
            try {
                let fileData: any = null;

                if (typeof form.sample_image === 'string') {
                    const uri = form.sample_image.trim();
                    if (uri) {
                        const fileName = uri.split('/').pop() || 'sample_image.jpg';
                        const fileExtension = fileName.split('.').pop()?.toLowerCase();

                        let mimeType = 'application/octet-stream';
                        if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
                            mimeType = 'image/jpeg';
                        } else if (fileExtension === 'png') {
                            mimeType = 'image/png';
                        } else if (fileExtension === 'pdf') {
                            mimeType = 'application/pdf';
                        }

                        fileData = {
                            uri,
                            name: fileName,
                            type: mimeType,
                        };
                    }
                } else if (form.sample_image && typeof form.sample_image === 'object' && 'uri' in form.sample_image) {
                    const { uri, name, fileName, type } = form.sample_image;
                    if (uri?.trim()) {
                        fileData = {
                            uri: uri.trim(),
                            name: (fileName || name || 'sample_image.jpg').trim(),
                            type: type || 'application/octet-stream',
                        };
                    }
                }

                if (fileData && fileData.uri) {
                    formData.append("sample_image", fileData);
                }
            } catch (error) {
                console.error("Error processing sample image:", error);
                showToast("error", "Failed to process the selected image file!");
            }
        }

        return formData;
    }, [adminData]);

    const onSubmit = useCallback(async (status: 'in-progress' | 'in-queue') => {
        if (isSubmitting || startProduction.isPending) {
            return;
        }

        if (!id) {
            showToast("error", "Production ID is missing!");
            return;
        }

        if (!adminData?.name && status === 'in-progress') {
            showToast("error", "Supervisor information is missing!");
            return;
        }

        const result = validateForm();
        if (!result.success) {
            const firstError = Object.values(result.errors)[0];
            if (firstError) {
                showToast("error", firstError);
            }
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = buildFormData(result.data, status);

            await new Promise((resolve, reject) => {
                startProduction.mutate(
                    { id: id, data: formData },
                    {
                        onSuccess: (response) => {
                            console.log("Production started successfully:", response);

                            if (status === 'in-progress') {
                                goTo("production-complete", { id: id });
                            } else {
                                goTo('production');
                            }

                            setTimeout(() => {
                                resetForm();
                            }, 100);

                            resolve(response);
                        },
                        onError: (error) => {
                            console.error("Production start failed:", error);

                            let errorMessage = "Failed to start production. Please try again.";

                            if (error instanceof Error) {
                                if (error.message.includes('network')) {
                                    errorMessage = "Network error. Please check your connection and try again.";
                                } else if (error.message.includes('validation')) {
                                    errorMessage = "Invalid data provided. Please check your inputs.";
                                }
                            }
                            showToast("error", errorMessage);
                            reject(error);
                        }
                    }
                );
            });

        } catch (error) {
            console.error("Production submission failed:", error);

            if (error instanceof Error && error.message === "File processing failed") {
                return;
            }
            showToast("error", "An unexpected error occurred. Please try again!");
        } finally {
            setIsSubmitting(false);
        }
    }, [id, adminData, isSubmitting, startProduction, validateForm, buildFormData, goTo, resetForm]);

    const isLoading = productFetching || dataFetching;
    const isFormDisabled = isLoading || isSubmitting || startProduction.isPending || !productionData;

    if (isProductionError && !productionData) {
        return (
            <View style={styles.pageContainer}>
                <PageHeader page="Production" />
                <View style={styles.errorContainer}>
                    <Loader />
                </View>
            </View>
        );
    }

    const backRoute = resolveBackRoute(access, PRODUCTION_BACK_ROUTES, resolveDefaultRoute(access));
    
    return (
        <View style={styles.pageContainer}>
            <PageHeader page="Production" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.wrapper}>
                    <View style={[styles.VStack, styles.gap16]}>
                        <BackButton
                            label="Production Start"
                            backRoute={backRoute}
                        />

                        <SupervisorOrderDetailsCard
                            order={orderDetail}
                            color="green"
                            bgSvg={DatabaseIcon}
                        />

                        <TruckWeightCard {...truckDetails} />

                        <FormField name="sample_quantity" form={{ values, setField, errors }}>
                            {({ value, onChange, error }) => (
                                <PriceInput
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder="Enter quantity"
                                    addonText="Kg"
                                    error={error}
                                    editable={!isFormDisabled}
                                >
                                    Sample quantity
                                </PriceInput>
                            )}
                        </FormField>

                        <FormField name="rating" form={{ values, setField, errors }}>
                            {({ value, onChange, error }) => (
                                <RatingCard
                                    active={value}
                                    onChange={onChange}
                                >
                                    Select rating
                                </RatingCard>
                            )}
                        </FormField>

                        <FormField name="sample_image" form={{ values, setField, errors }}>
                            {({ value, onChange, error }) => (
                                <FileUpload
                                    fileState={[value, onChange]}
                                    error={error}
                                // disabled={isFormDisabled}
                                />
                            )}
                        </FormField>
                    </View>

                    <View style={styles.gap16}>
                        <Button
                            variant="fill"
                            disabled={isFormDisabled}
                            onPress={() => onSubmit('in-progress')}
                        // loading={isSubmitting && startProduction.isPending}
                        >
                            {isSubmitting || startProduction.isPending
                                ? "Starting production..."
                                : "Start production"
                            }
                        </Button>

                        <LinkButton
                            disabled={isFormDisabled}
                            onPress={() => onSubmit('in-queue')}
                        >
                            {isSubmitting || startProduction.isPending
                                ? "Adding to queue..."
                                : "Add to production queue"
                            }
                        </LinkButton>
                    </View>
                </View>
            </ScrollView>
            <DetailsToast
                type={toastType}
                message={toastMessage}
                visible={toastVisible}
                onHide={() => setToastVisible(false)}
            />

            {/* Loading overlay */}
            {isLoading && (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            )}
        </View>
    );
};

export default ProductionStartScreen;

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
    },
    wrapper: {
        flex: 1,
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        padding: 16,
        gap: 12,
        justifyContent: "space-between",
        minHeight: '100%',
    },
    HStack: {
        flexDirection: "row"
    },
    VStack: {
        flexDirection: "column"
    },
    justifyBetween: {
        justifyContent: "space-between",
    },
    alignCenter: {
        alignItems: "center"
    },
    gap8: {
        gap: 8,
    },
    gap16: {
        gap: 16,
    },
    p16: {
        padding: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 999,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
    },
});