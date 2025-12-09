import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";

import Button from "@/src/components/ui/Buttons/Button";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import PageHeader from "@/src/components/ui/PageHeader";
import { getColor } from "@/src/constants/colors";
import Input from "@/src/components/ui/Inputs/Input";
import Select from "@/src/components/ui/Select";
import CustomSwitch from "@/src/components/ui/Switch";

import { useParams } from "@/src/hooks/useParams";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { ScrollView } from "react-native-gesture-handler";
import ChipGroup from "@/src/components/ui/ChipGroup";
import Modal from "@/src/components/ui/modals/Modal";
import { Vendor, VendorOrder } from "@/src/types";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import BottomSheet from "@/src/components/ui/BottomSheet";
import Loader from "@/src/components/ui/Loader";
import {
  clearRawMaterials,
  setRawMaterials,
  setSource,
  toggleRawMaterial,
} from "@/src/redux/slices/bottomsheet/raw-material.slice";
import { useFormValidator } from "@/src/sbc/form";
import FormField from "@/src/sbc/form/FormField";
import DetailsToast from "@/src/components/ui/DetailsToast";
import {
  clearCity,
  clearLocations,
  setCity,
  setCitySearched,
  setState,
  setStateSearched,
} from "@/src/redux/slices/bottomsheet/location.slice";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { getLimitedMaterialNames } from "@/src/utils/arrayUtils";
import {
  updateAllVendorLists,
  useAddVendor,
  useUpdateVendor,
  useVendorById,
} from "@/src/hooks/vendor";
import { queryClient } from "@/src/lib/react-query";

interface buttonProps {
  variant: "fill" | "outline";
  label: string;
}
type VendorCreation = {
  name: string;
  phone: string;
  alias: string;
  state: string;
  city: string;
  address: string;
  materials: string[];
};

const VendorCreateScreen = () => {
  const dispatch = useDispatch();
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const updateVendor = useUpdateVendor();
  const selected = useSelector(
    (state: RootState) => state.rawMaterial.selectedRawMaterials
  );
  const { states: selectedState, cities: selectedCity } = useSelector(
    (state: RootState) => state.location
  );

  const { userId } = useParams("vendor-create", "userId");
  const { data: fetchedVendor, isLoading: isFetchingVendor } = useVendorById(
    userId ?? null
  );

  const addVendorMutation = useAddVendor();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const [toastMessage, setToastMessage] = useState("");

  const { goTo } = useAppNavigation();

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const [deactivate, setDeactivate] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    type?: "danger" | "success" | "info" | "warning" | "plain";
    description: string;
    buttons: buttonProps[];
  }>();
  const [vendorData, setVendorData] = useState<Vendor>();

  const {
    values,
    setField,
    setFields,
    errors,
    resetForm,
    validateForm,
    isValid,
  } = useFormValidator<VendorCreation>(
    {
      name: "",
      phone: "",
      alias: "",
      state: "",
      city: "",
      address: "",
      materials: [],
    },
    {
      name: [{ type: "required", message: "name is required!" }],
      address: [{ type: "required", message: "address is required!" }],
      alias: [],
      phone: [
        { type: "required", message: "phone number required" },
        {
          type: "maxLength",
          length: 10,
          message: "phone number must be 10 digit",
        },
      ],
      materials: [
        {
          type: "custom",
          validate: (val) => Array.isArray(val) && val?.length > 0,
          message: "Select at least one raw material",
        },
      ],
      state: [
        {
          type: "custom",
          validate: (val) => val !== "",
          message: "Select a State !",
        },
      ],
      city: [
        {
          type: "custom",
          validate: (val) => val !== "",
          message: "Select a City !",
        },
      ],
    },
    {
      validateOnChange: true,
      debounce: 300,
    }
  );

  useEffect(() => {
    const current = values?.materials ?? [];
    const next = selected?.map((v) => (typeof v === "string" ? v : v?.name));

    const isDifferent =
      current?.length !== next?.length ||
      current.some((val, i) => val !== next[i]);

    if (isDifferent) {
      setField("materials", next);
    }
  }, [selected, values.materials]);

  useEffect(() => {
    if (selectedState) {
      setField("state", selectedState);
    }
  }, [selectedState]);
  useEffect(() => {
    if (selectedCity) {
      setField("city", selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (deactivate) {
      handleDeactivateToggle();
    } else {
      setModalContent({
        title: "",
        description: "",
        buttons: [],
      });
    }
  }, [deactivate]);

  useEffect(() => {
    if (userId && fetchedVendor) {
      resetForm();

      setVendorData({
        ...fetchedVendor,
        orders: fetchedVendor.orders?.map((order: VendorOrder) => ({
          ...order,
          order_date: new Date(order.order_date),
          arrival_date: new Date(order.arrival_date),
          est_arrival_date: new Date(order.est_arrival_date),
        })),
        state: fetchedVendor.state.name || "",
        city: fetchedVendor.city || "",
        zipcode: fetchedVendor.zipcode || "",
        alias: fetchedVendor.alias || "",
        address: fetchedVendor.address || "",
        materials: fetchedVendor.materials || [],
      });

      setFields({
        name: fetchedVendor.name,
        phone: fetchedVendor.phone,
        alias: fetchedVendor.alias || "",
        state: fetchedVendor.state.name,
        city: fetchedVendor.city,
        address: fetchedVendor.address,
        materials: fetchedVendor.materials || [],
      });

      dispatch(
        setRawMaterials(
          (fetchedVendor.materials || []).map((m: string, idx: number) => ({
            id: `mat-${idx}-${m}`,
            name: m,
            detailByRating: [],
            rating: "",
            category: "material",
            chambers: [],
          }))
        )
      );

      dispatch(setState(fetchedVendor.state));
      dispatch(setCity(fetchedVendor.city));
    }
  }, [userId, fetchedVendor]);


const onSubmit = async (userId: string | null) => {
  const updatedValues = {
    ...values,
    state: selectedState.name,
    city: selectedCity,
  };
  const result = validateForm(updatedValues);

  if (!result.success) return;

  setIsSubmitting(true);
  try {
    if (userId) {
      // UPDATE vendor
      await updateVendor.mutateAsync({
        id: userId,
        data: {
          ...result.data,
          state: {
            name: selectedState.name,
            isoCode: selectedState.isoCode,
          },
        },
      });

      showToast("info", "Vendor Updated");
      resetForm();
      dispatch(clearRawMaterials());
      dispatch(clearLocations());
      goTo("vendors");
    } else {
      // CREATE vendor
      const createdVendor = await addVendorMutation.mutateAsync({
        data: {
          ...result.data,
          state: {
            name: selectedState.name,
            isoCode: selectedState.isoCode,
          },
        },
      });

      // if mutateAsync didn't throw, it succeeded
      if (createdVendor) {
        showToast("info", "New Vendor Added");
        resetForm();
        dispatch(clearRawMaterials());
        dispatch(clearLocations());
        goTo("vendors");
      } else {
        showToast("error", "Failed to add vendor");
      }
    }
  } catch (err) {
    console.error("vendor create/update failed", err);
    showToast("error", "Failed to update vendor");
  } finally {
    setIsSubmitting(false);
  }
};


  const handleDeactivateToggle = () => {
    const hasPendingOrders = vendorData?.orders?.some((order) => {
      const arrival = order?.arrival_date.toISOString();
      return !arrival || isNaN(Date.parse(arrival));
    });

    if (hasPendingOrders) {
      setModalContent({
        title: "Deactivation Failed",
        description:
          "You can't deactivate this user because their order is still pending or in progress.",
        type: "warning",
        buttons: [
          {
            variant: "fill",
            label: "Got it",
          },
        ],
      });
    } else {
      setModalContent({
        title: "Confirmation",
        description: "Are you sure you want to deactivate vendor?",
        buttons: [
          {
            variant: "outline",
            label: "Cancel",
          },
          {
            variant: "fill",
            label: "Deactivate",
          },
        ],
      });
    }
  };

  const handleToggleCityBottomSheet = async () => {
    setIsLoading(true);
    await validateAndSetData(`${selectedState.isoCode}:IN`, "city");
    setIsLoading(false);
  };

  const handleToggleStateBottomSheet = async () => {
    dispatch(clearCity());
    setIsLoading(true);
    await validateAndSetData("IN", "state");
    setIsLoading(false);
  };

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Vendors"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView>
          <View style={styles.wrapper}>
            <View
              style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}
            >
              <BackButton
                label={`${userId ? "Update" : "Add"} Vendors`}
                backRoute="vendors"
              />
              {userId && (
                <CustomSwitch
                  setIsChecked={setDeactivate}
                  isChecked={deactivate}
                >
                  Deactivate vendor
                </CustomSwitch>
              )}
            </View>

            <FormField name="name" form={{ values, setField, errors }}>
              {({ value, onChange, error }) => (
                <Input
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="Enter full name"
                  error={error}
                  disabled={!!userId}
                >
                  Full name
                </Input>
              )}
            </FormField>

            <FormField name="phone" form={{ values, setField, errors }}>
              {({ value, onChange, error }) => (
                <Input
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="Enter phone number"
                  error={error}
                  addonText="+91"
                  maxLength={10}
                  keyboardType="phone-pad"
                >
                  Phone number
                </Input>
              )}
            </FormField>

            <FormField name="alias" form={{ values, setField, errors }}>
              {({ value, onChange, error }) => (
                <Input
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="Enter Alias"
                  error={error}
                >
                  Alias (Optional)
                </Input>
              )}
            </FormField>

            <View style={[styles.HStack, { width: "100%" }]}>
              <FormField name="state" form={{ values, setField, errors }}>
                {({ value, onChange, error }) => (
                  <Select
                    value={selectedState.name || "select state"}
                    style={{ flex: 1 }}
                    options={[]}
                    onPress={() => {
                      handleToggleStateBottomSheet();
                      onChange(selectedState);
                    }}
                    showOptions={false}
                    error={error}
                  >
                    State
                  </Select>
                )}
              </FormField>

              <FormField name="city" form={{ values, setField, errors }}>
                {({ value, onChange, error }) => (
                  <Select
                    style={{ flex: 1 }}
                    value={selectedCity || "select city"}
                    options={[]}
                    onPress={() => {
                      handleToggleCityBottomSheet();
                      onChange(selectedCity);
                    }}
                    showOptions={false}
                    error={error}
                  >
                    City
                  </Select>
                )}
              </FormField>
            </View>

            <FormField name="address" form={{ values, setField, errors }}>
              {({ value, onChange, error }) => (
                <Input
                  placeholder="Enter address"
                  value={value || ""}
                  onChangeText={onChange}
                  error={error}
                >
                  Address
                </Input>
              )}
            </FormField>

            <FormField name="materials" form={{ values, setField, errors }}>
              {({ value, onChange, error }) => (
                <Select
                  value={
                    getLimitedMaterialNames(selected, 16) ||
                    "Select raw material"
                  }
                  onPress={async () => {
                    setIsLoading(true);
                    dispatch(setSource("vendor"));
                    await validateAndSetData("Abc123", "add-raw-material");
                    setIsLoading(false);

                    onChange(selected);
                  }}
                  showOptions={false}
                  error={error}
                >
                  Materials
                </Select>
              )}
            </FormField>

            <ChipGroup
              dismisible
              data={selected || []}
              onDismiss={(index) => {
                const updatedData = selected?.find((_, i) => i === index);
                dispatch(toggleRawMaterial(updatedData!));
                if (userId) {
                  if (!vendorData) return;

                  const newMaterials = vendorData.materials.filter(
                    (_, i) => i !== index
                  );

                  setVendorData((prev) =>
                    prev
                      ? {
                          ...prev,
                          materials: newMaterials,
                        }
                      : prev
                  );

                  setField("materials", newMaterials);
                }
              }}
            />

            <Button
              variant={userId ? "outline" : "fill"}
              onPress={() => onSubmit(userId ?? null)}
              disabled={!isValid || isSubmitting}
            >
              {userId
                ? !isSubmitting
                  ? "Saved changes"
                  : "Saving changes..."
                : !isSubmitting
                ? "Add Vendor"
                : "Adding Vendor..."}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Deactivation Confirmation Modal */}
      {modalContent && (
        <Modal
          showPopup={deactivate}
          setShowPopup={setDeactivate}
          modalData={modalContent}
        />
      )}
      <BottomSheet color="green" />
      {(isLoading || isFetchingVendor) && (
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

export default VendorCreateScreen;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    gap: 24,
    flexDirection: "column",
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 16,
  },
  HStack: {
    flexDirection: "row",
    gap: 8,
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});
