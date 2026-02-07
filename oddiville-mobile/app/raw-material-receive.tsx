// 1. React and React Native core
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

// 2. Third-party dependencies
import { isValid as isDateValid, parse } from "date-fns";
import * as ImagePicker from 'expo-image-picker';

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import DatabaseIcon from "@/src/components/icons/page/DatabaseIcon";
import TruckWeightCard from "@/src/components/ui/TruckWeightCard";
import { B5 } from "@/src/components/typography/Typography";
import Input from "@/src/components/ui/Inputs/Input";
import SimpleFileUpload from "@/src/components/ui/SimpleFileUpload";
import SupervisorOrderDetailsCard from "@/src/components/ui/Supervisor/SupervisorOrderDetailsCard";
import Button from "@/src/components/ui/Buttons/Button";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import Modal from "@/src/components/ui/modals/Modal";
import Loader from "@/src/components/ui/Loader";

// 4. Project hooks
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { useParams } from "@/src/hooks/useParams";
import {
  ALL_KEY,
  PENDING_KEY,
  useRawMaterialOrderById,
} from "@/src/hooks/useRawMaterialOrders";
import { useUpdateRawMaterialOrder } from "@/src/hooks/useUpdateRawMaterialOrder";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import { useFormValidator } from "@/src/sbc/form";
import FormField from "@/src/sbc/form/FormField";

// 6. Types
import { OrderProps, RawMaterialOrderProps, RootStackParamList } from "@/src/types";
import { formatDateForDisplay } from "@/src/utils/dateUtils";
import DetailsToast from "@/src/components/ui/DetailsToast";
import { hasUrlField, isChallanObject } from "@/src/utils/urlUtils";
import { queryClient } from "@/src/lib/react-query";
import { useAuth } from '@/src/context/AuthContext';
import { resolveAccess } from '@/src/utils/policiesUtils';
import { PURCHASE_BACK_ROUTES, resolveBackRoute, resolveDefaultRoute } from '@/src/utils/backRouteUtils';

type RawMaterialReceived = {
  arrival_date: string;
  truck_weight: string;
  tare_weight: string;
  quantity_received: string;
  challan: null | string | { key: string; url: string };
  truck_number: string;
  driver_name: string;
  bags: string; // NEW
};


const parseWeight = (weight: any): number => {
  if (weight == null) return 0;

  // if already number
  if (typeof weight === "number") {
    return isNaN(weight) ? 0 : Math.max(0, weight);
  }

  // ensure string
  const str = String(weight);
  const parsed = parseFloat(str.replace(/[^\d.-]/g, "") || "0");
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
};


const formatOrder = (order: any): OrderProps => ({
  id: order?.id,
  title: order?.raw_material_name ?? "N/A",
  name: order?.vendor ?? "N/A",
  description: [
    {
      name: "Order quantity",
      value: `${order?.quantity_ordered ?? "--"} ${order?.unit ?? ""}`,
      iconKey: 'database',
    },
  ],
  // address: order?.address ?? "N/A",
  helperDetails: [
    {
      name: "Order",
      value: formatDateForDisplay(order?.order_date),
    },
    {
      name: "Arrival",
      value: formatDateForDisplay(order?.arrival_date),
    },
  ],
  href: "raw-material-receive",
  identifier: order?.status ?? "order-ready",
});

const SupervisorRawMaterialDetailsScreen = () => {
      const { role, policies } = useAuth();
  
      const safeRole = role ?? "guest";
      const safePolicies = policies ?? [];
      const access = resolveAccess(safeRole, safePolicies);
  
  const [loading, setLoading] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");

  const isInitialized = useRef(false);

  const { goTo } = useAppNavigation();
  const { rmId } = useParams("raw-material-receive", "rmId");

  // Validate rmId
  const safeRmId = useMemo(() => {
    return rmId && rmId !== "undefined" && rmId !== "null" ? rmId : null;
  }, [rmId]);

  const {
    data: orderData,
    isFetching,
    error,
  } = useRawMaterialOrderById(safeRmId);

  const formattedOrder = useMemo(() => {
    return orderData ? formatOrder(orderData) : null;
  }, [orderData]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const updateRawMaterialOrder = useUpdateRawMaterialOrder();

  const { values, setField, errors, validateForm, resetForm, isValid } =
    useFormValidator<RawMaterialReceived>(
      {
        arrival_date: "",
        truck_weight: "",
        tare_weight: "",
        quantity_received: "",
        challan: null,
        truck_number: "",
        driver_name: "",
        bags: "",
      },
      {
        arrival_date: [
          { type: "required", message: "Arrival date is required!" },
        ],
        truck_weight: [
          { type: "required", message: "Truck weight is required!" },
          {
            type: "custom",
            validate: (value) => parseWeight(value) > 0,
            message: "Truck weight must be greater than 0 kg!",
          },
        ],
        tare_weight: [
          { type: "required", message: "Tare weight is required!" },
          {
            type: "custom",
            validate: (value) => parseWeight(value) >= 0,
            message: "Tare weight must be 0 or greater!",
          },
        ],
        quantity_received: [
          { type: "required", message: "Quantity received is required!" },
          {
            type: "custom",
            validate: (value) =>
              parseWeight(value) > 0 &&
              parseWeight(value) <= Number(orderData?.quantity_ordered),
            message:
              "Quantity must be greater than 0 or smaller then ordered quantity",
          },
        ],
        challan: [{ type: "required", message: "Challan is required!" }],

        truck_number: [
          { type: "required", message: "Truck Number is required!" },
          {
            type: "length",
            length: 8,
            message: "Truck Number must be 8 digit!",
          },
        ],
        driver_name: [
          { type: "required", message: "Driver name is required!" },
        ],
        bags: [],
      },
      {
        validateOnChange: true,
        debounce: 300,
      }
    );

  const netWeightKg = useMemo(() => {
    const truckWeight = parseWeight(values.truck_weight);
    const tareWeight = parseWeight(values.tare_weight);
    const net = truckWeight - tareWeight;
    return net > 0 ? net : 0;
  }, [values.truck_weight, values.tare_weight]);

  const finalQuantityKg = useMemo(() => {
    const productWeight = netWeightKg;
    const bagsCount = parseWeight(values.bags || "0"); // pouch as number, 1 pouch = 1 kg
    const bagsWeight = bagsCount; // 1 pouch = 1 kg
    const final = productWeight - bagsWeight;
    return final > 0 ? final : 0;
  }, [netWeightKg, values.bags]);

  useEffect(() => {
    // only update when we have at least truck & tare
    if (!values.truck_weight || !values.tare_weight) return;
    const final = finalQuantityKg;
    // keep it as string in form
    setField("quantity_received", final > 0 ? final.toString() : "0");
  }, [finalQuantityKg, values.truck_weight, values.tare_weight, values.bags]);



  const isWeightLogicValid = useMemo(() => {
    const truckWeight = parseWeight(values.truck_weight);
    const tareWeight = parseWeight(values.tare_weight);
    return truckWeight >= tareWeight;
  }, [values.truck_weight, values.tare_weight]);

  useEffect(() => {
    if (!orderData || isInitialized.current) return;

    const truckDetails = orderData?.truck_details;
    console.log(truckDetails);
    
    const arrivalDate = formatDateForDisplay(orderData.arrival_date);
    const quantityReceived = orderData.quantity_received?.toString() || "";

    const truckWeightKg = truckDetails?.truck_weight
      ? truckDetails.truck_weight.toString()
      : "";
    const tareWeightKg = truckDetails?.tare_weight
      ? truckDetails.tare_weight.toString()
      : "";
    const truckNumber = truckDetails?.truck_number
      ? truckDetails.truck_number.toString()
      : ""; 
    const driverName = truckDetails?.driver_name
      ? truckDetails.driver_name.toString()
      : "";

      const bagsStr =
      orderData.bags !== undefined && orderData.bags !== null
        ? String(orderData.bags)
        : "";

    let challanUrl: string | null = null;
    if (truckDetails?.challan) {
      if (typeof truckDetails.challan === "string") {
        challanUrl = truckDetails.challan;
      } else if (hasUrlField(truckDetails.challan)) {
        challanUrl = (truckDetails.challan as { url: string }).url;
      }
    }

    const fieldsToUpdate = [
      ["arrival_date", arrivalDate],
      ["quantity_received", quantityReceived],
      ["truck_weight", truckWeightKg],
      ["truck_number", truckNumber],
      ["driver_name", driverName],
      ["tare_weight", tareWeightKg],
      ["bags", bagsStr],
      ["challan", challanUrl],
    ] as const;

    fieldsToUpdate.forEach(([field, value]) => {
      setField(field, value);
    });

    isInitialized.current = true;
  }, [orderData?.id]);

  useEffect(() => {
    isInitialized.current = false;
  }, [safeRmId]);

  const hasChanges = useMemo(() => {
    if (!isInitialized.current) return false;

    return (
      values.arrival_date !== "" ||
      values.truck_weight !== "" ||
      values.tare_weight !== "" ||
      values.quantity_received !== "" ||
      values.truck_number !== "" ||
      values.driver_name !== "" ||
      values.challan !== null
    );
  }, [
    values.arrival_date,
    values.truck_weight,
    values.tare_weight,
    values.quantity_received,
    values.truck_number,
    values.driver_name,
    values.challan,
  ]);

  useEffect(() => {
    setHasUnsavedChanges(hasChanges);
  }, [hasChanges]);

  const handleBackPress = () => {
    if (hasUnsavedChanges && !orderData?.arrival_date) {
      setShowDiscardModal(true);
    } else {
      goTo("purchase");
    }
  };

  const validateWeights = (): boolean => {
    const truckWeight = parseWeight(values.truck_weight);
    const tareWeight = parseWeight(values.tare_weight);
    const quantityReceived = parseWeight(values.quantity_received);

    if (truckWeight <= tareWeight) {
      showToast(
        "error",
        "Truck gross weight must be greater than tare weight!"
      );
      return false;
    }

    const netWeight = truckWeight - tareWeight;
    if (Math.abs(netWeight - quantityReceived) > quantityReceived * 0.1) {
      showToast(
        "error",
        `Net weight (${netWeight.toFixed(
          2
        )} kg) differs significantly from quantity received (${quantityReceived} kg). Please verify the weights.`
      );

      onSubmit(true);
      // [
      //   { text: "Review", style: "cancel" },
      //   { text: "Continue Anyway", onPress: () => onSubmit(true) }
      // ]
      return false;
    }

    return true;
  };

  const onSubmit = async (skipValidation = false) => {
    if (loading || updateRawMaterialOrder.isPending) return;

    const result = validateForm();
    if (!result.success) {
      showToast("error", "Please fill in all required fields correctly!");
      return;
    }

    if (!skipValidation && !validateWeights()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Parsing date safely
      const arrivalDateStr = result.data.arrival_date;
      const arrivalDate = parse(arrivalDateStr, "MMM dd, yyyy", new Date());
      if (isDateValid(arrivalDate)) {
        formData.append("arrival_date", arrivalDate.toISOString());
      } else {
        console.error("Invalid date:", arrivalDateStr);
      }

      const truckWeightTons = parseWeight(result.data.truck_weight).toString();
      const tareWeightTons = parseWeight(result.data.tare_weight).toString();

      formData.append("truck_weight", truckWeightTons);
      formData.append("tare_weight", tareWeightTons);
      formData.append("truck_number", result.data.truck_number);
      formData.append("driver_name", result.data.driver_name);

      const bagsCount = parseWeight(result.data.bags || "0").toString();
      formData.append("bags", bagsCount);
      
      formData.append(
        "quantity_received",
        parseWeight(result.data.quantity_received).toString()
      );


      const challan = orderData?.truck_details?.challan;
      if (isChallanObject(challan)) {
        formData.append("challan", JSON.stringify(challan));
      } else if (result.data.challan) {
        let fileData: any = result.data.challan;
        if (typeof result.data.challan === "string") {
          const filename =
            result.data.challan.split("/").pop() || "challan.jpg";
          const fileType = filename.toLowerCase().endsWith(".pdf")
            ? "application/pdf"
            : "image/jpeg";
          fileData = {
            uri: result.data.challan,
            name: filename,
            type: fileType,
          };
        } else if (result.data.challan instanceof File) {
          const filename = result.data.challan.name;
          const fileType =
            result.data.challan.type ||
            (filename.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "image/jpeg");
          fileData = {
            ...result.data.challan,
            type: fileType,
          };
        }
        formData.append("challan", fileData);
      }

      if (!safeRmId) {
        throw new Error("Invalid order ID");
      }

      updateRawMaterialOrder.mutate(
        { id: safeRmId, data: formData },
        {
          onSuccess: (updated) => {
            showToast("success", "Raw material order updated successfully!");

            queryClient.setQueryData<RawMaterialOrderProps[]>(
              PENDING_KEY,
              (old = []) => old.filter((o) => o.id !== safeRmId)
            );
            queryClient.setQueryData<RawMaterialOrderProps[]>(
              ALL_KEY,
              (old = []) => {
                if (!updated?.id) return old;
                const idx = old.findIndex((o) => o.id === updated.id);
                if (idx === -1) return [updated, ...old];
                const copy = old.slice();
                copy[idx] = updated;
                return copy;
              }
            );
            queryClient.setQueryData(
              ["raw-material-order-by-id", safeRmId],
              updated
            );

            queryClient.invalidateQueries({ queryKey: PENDING_KEY });
            queryClient.invalidateQueries({ queryKey: ALL_KEY });
            queryClient.invalidateQueries({ queryKey: ["raw-material-orders", "completed"] });
            goTo("purchase");
            resetForm();
            setHasUnsavedChanges(false);
          },
          onError: (error: any) => {
            console.error("Update error:", error);
            showToast(
              "error",
              error?.message ||
                "Failed to update raw material order. Please try again!"
            );
          },
        }
      );
    } catch (err) {
      console.error("Submit error:", err);
      showToast("error", "An unexpected error occurred. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const shouldShowTruckDetails = useMemo(() => {
    return (
      values.truck_weight !== "" &&
      values.tare_weight !== "" &&
      parseWeight(values.truck_weight) > 0 &&
      parseWeight(values.tare_weight) >= 0 &&
      isWeightLogicValid &&
      netWeightKg > 0
    );
  }, [
    values.truck_weight,
    values.tare_weight,
    isWeightLogicValid,
    netWeightKg,
  ]);

  const isEditable = useMemo(() => {
    return !!orderData?.arrival_date;
  }, [orderData?.arrival_date]);

  const backRoute = resolveBackRoute(access, PURCHASE_BACK_ROUTES, resolveDefaultRoute(access));
  
  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.pageContainer}>
        <PageHeader page={"Raw Material"} />
        <View style={styles.wrapper}>
          <BackButton label="Raw material receive" backRoute={backRoute} />
          <View style={styles.errorContainer}>
            <B5 color={getColor("red", 600)}>
              Failed to load order details. Please try again.
            </B5>
            <Button variant="outline" onPress={() => goTo(backRoute)}> 
              Go Back
            </Button>
          </View>
        </View>
      </View>
    );
  }

  if (!orderData) {
    return (
      <View style={styles.pageContainer}>
        <PageHeader page={"Raw Material"} />
        <View style={styles.wrapper}>
          <BackButton label="Raw material receive" backRoute="purchase" />
          <View style={styles.errorContainer}>
            <B5 color={getColor("dark", 600)}>Order not found.</B5>
            <Button variant="outline" onPress={() => goTo("purchase")}>
              Go Back
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Raw Material"} />
      <View style={styles.wrapper}>
        <BackButton label="Raw material receive" backRoute={backRoute} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerWrapper}>
              {formattedOrder && (
                <SupervisorOrderDetailsCard order={formattedOrder} />
              )}

              {shouldShowTruckDetails && (
                <TruckWeightCard
                  title={`${netWeightKg.toFixed(2)}`}
                  description="Net weight (Kg)"
                />
              )}

              {!isWeightLogicValid &&
                values.truck_weight &&
                values.tare_weight && (
                  <View style={styles.warningContainer}>
                    <B5 color={getColor("light", 400)}>
                      ⚠️ Truck weight cannot be less than tare weight
                    </B5>
                  </View>
                )}

              <View style={styles.titleWithDataInputs}>
                {/* <FormField
                  name="quantity_received"
                  form={{ values, setField, errors }}
                >
                  {({ value, onChange, error }) => (
                    <Input
                      value={value}
                      onChangeText={(text: string) => {
                        setField("quantity_received", text);
                        setTouched((t) => ({ ...t, quantity_received: true }));
                      }}
                      onBlur={() =>
                        setTouched((t) => ({ ...t, quantity_received: true }))
                      }
                      placeholder="Enter received quantity"
                      error={touched.quantity_received ? error : undefined}
                      keyboardType="numeric"
                      disabled={!!isEditable}
                      addonText="kg"
                      mask="addon"
                      post
                    >
                      Quantity received
                    </Input>
                  )}
                </FormField> */}
                <FormField
  name="quantity_received"
  form={{ values, setField, errors }}
>
  {({ value, error }) => (
    <Input
      value={value}
      onChangeText={() => { /* no-op, controlled by bags/weights */ }}
      placeholder="Enter received quantity"
      error={touched.quantity_received ? error : undefined}
      keyboardType="numeric"
      disabled={true}          // ALWAYS disabled – auto calculated
      addonText="kg"
      mask="addon"
      post
    >
      Quantity received
    </Input>
  )}
</FormField>

<FormField
  name="bags"
  form={{ values, setField, errors }}
>
  {({ value, onChange, error }) => (
    <Input
      value={value}
      onChangeText={(text: string) => {
        // allow only numbers
        const cleaned = text.replace(/[^\d]/g, "");
        setField("bags", cleaned);
        setTouched((t) => ({ ...t, bags: true }));
      }}
      onBlur={() =>
        setTouched((t) => ({ ...t, bags: true }))
      }
      placeholder="Enter number of bags"
      error={touched.bags ? error : undefined}
      keyboardType="number-pad"
      disabled={!!isEditable}
      addonText="bags"
      mask="addon"
      post
    >
      Number of bags (optional)
    </Input>
  )}
</FormField>



                <FormField
                  name="arrival_date"
                  form={{ values, setField, errors }}
                >
                  {({ value, onChange, error }) => (
                    <Input
                      value={value}
                      onChangeText={(text: string) => {
                        setField("arrival_date", text);
                        setTouched((t) => ({ ...t, arrival_date: true }));
                      }}
                      onBlur={() =>
                        setTouched((t) => ({ ...t, arrival_date: true }))
                      }
                      placeholder="Select arrival date"
                      error={touched.arrival_date ? error : undefined}
                      disabled={!!isEditable}
                      mask="date"
                      post
                    >
                      Arrival date
                    </Input>
                  )}
                </FormField>

                <B5 color={getColor("yellow", 700)} style={styles.sectionTitle}>
                  TRUCK DETAILS
                </B5>

                <FormField
                  name="truck_weight"
                  form={{ values, setField, errors }}
                >
                  {({ value, onChange, error }) => (
                    <Input
                      value={value}
                      onChangeText={(text: string) => {
                        setField("truck_weight", text);
                        setTouched((t) => ({ ...t, truck_weight: true }));
                      }}
                      onBlur={() =>
                        setTouched((t) => ({ ...t, truck_weight: true }))
                      }
                      placeholder="Enter truck gross weight in kg"
                      error={touched.truck_weight ? error : undefined}
                      keyboardType="numeric"
                      disabled={!!isEditable}
                      addonText="kg"
                      mask="addon"
                      post
                    >
                      Gross weight
                    </Input>
                  )}
                </FormField>

                <FormField
                  name="tare_weight"
                  form={{ values, setField, errors }}
                >
                  {({ value, onChange, error }) => (
                    <Input
                      value={value}
                      onChangeText={(text: string) => {
                        setField("tare_weight", text);
                        setTouched((t) => ({ ...t, tare_weight: true }));
                      }}
                      onBlur={() =>
                        setTouched((t) => ({ ...t, tare_weight: true }))
                      }
                      error={touched.tare_weight ? error : undefined}
                      keyboardType="numeric"
                      disabled={!!isEditable}
                      addonText="kg"
                      mask="addon"
                      post
                      tooltipText={{
                        title: "Tare Weight",
                        description:
                          "Net Weight(empty truck) = Gross Weight - Tare Weight",
                      }}
                      showTooltip
                      placeholder="Enter empty truck weight in kg"
                    >
                      Tare weight
                    </Input>
                  )}
                </FormField>

                <FormField
                  name="truck_number"
                  form={{ values, setField, errors }}
                >
                  {({ value, onChange, error }) => (
                    <Input
                      value={value}
                      onChangeText={(text: string) => {
                        setField("truck_number", text);
                        setTouched((t) => ({ ...t, truck_number: true }));
                      }}
                      onBlur={() =>
                        setTouched((t) => ({ ...t, truck_number: true }))
                      }
                      error={touched.truck_number ? error : undefined}
                      disabled={!!isEditable}
                      post
                      placeholder="Enter truck number"
                    >
                      Truck number
                    </Input>
                  )}
                </FormField>

                <FormField
                  name="driver_name"
                  form={{ values, setField, errors }}
                >
                  {({ value, onChange, error }) => (
                    <Input
                      value={value}
                      onChangeText={(text: string) => {
                        setField("driver_name", text);
                        setTouched((t) => ({ ...t, driver_name: true }));
                      }}
                      onBlur={() =>
                        setTouched((t) => ({ ...t, driver_name: true }))
                      }
                      error={touched.driver_name ? error : undefined}
                      disabled={!!isEditable}
                      placeholder="Enter driver name"
                    >
                      Driver name
                    </Input>
                  )}
                </FormField>

                <FormField name="challan" form={{ values, setField, errors }}>
                  {({ value, onChange, error }) => (
                    <SimpleFileUpload
                      fileState={[value, onChange]}
                      error={error}
                      disabled={!!isEditable}
                      onlyPhoto
                      both
                    />
                  )}
                </FormField>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              variant="fill"
              disabled={
                !isValid ||
                loading ||
                updateRawMaterialOrder.isPending ||
                isEditable ||
                !isWeightLogicValid
              }
              onPress={() => onSubmit()}
            >
              {loading || updateRawMaterialOrder.isPending
                ? "Processing..."
                : "Confirm Arrival"}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </View>

      <DetailsToast
        type={toastType}
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <Modal
        showPopup={showDiscardModal}
        setShowPopup={setShowDiscardModal}
        modalData={{
          title: "Discard changes?",
          description:
            "Are you sure you want to discard all the changes? This action cannot be undone.",
          buttons: [
            {
              label: "Cancel",
              variant: "outline",
              action: () => setShowDiscardModal(false),
            },
            {
              label: "Discard",
              variant: "fill",
              action: () => {
                resetForm();
                setHasUnsavedChanges(false);
                goTo("purchase");
              },
            },
          ],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 16,
    gap: 16,
  },
  innerWrapper: {
    flexDirection: "column",
    gap: 24,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  buttonContainer: {
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    backgroundColor: getColor("light", 200),
  },
  titleWithDataInputs: {
    flexDirection: "column",
    gap: 16,
  },
  sectionTitle: {
    textTransform: "uppercase",
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: getColor("light", 200),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  warningContainer: {
    backgroundColor: getColor("red", 50),
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: getColor("red", 200),
  },
});

export default SupervisorRawMaterialDetailsScreen;
