// 1. React and React Native core
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

// 2. Third-party dependencies
import { ScrollView } from "react-native-gesture-handler";

// 3. Project components
import Button from "@/src/components/ui/Buttons/Button";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import PageHeader from "@/src/components/ui/PageHeader";
import Input from "@/src/components/ui/Inputs/Input";
import BottomSheet from "@/src/components/ui/BottomSheet";
import Loader from "@/src/components/ui/Loader";
import FormField from "@/src/sbc/form/FormField";
import SimpleFileUpload from "@/src/components/ui/SimpleFileUpload";

// 4. Project hooks
import { useParams } from "@/src/hooks/useParams";
import {
  useCreateTruck,
  useTruckById,
  useUpdateTruck,
} from "@/src/hooks/truck";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import { useFormValidator } from "@/src/sbc/form";
import CustomSwitch from "@/src/components/ui/Switch";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { useToast } from "@/src/context/ToastContext";
import Require from "@/src/components/authentication/Require";

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
  size: string;
  type: string;
  number: string;
  challan: File | string;
  isMyTruck: boolean;
};

const TruckCreateScreen = () => {
  const { id } = useParams("truck-detail", "id");
  const { data: truckData, isLoading: truckLoading } = useTruckById(id!);
  const updateTruck = useUpdateTruck();
  const createTruck = useCreateTruck();
  const toast = useToast();
  const [isMyTruck, setIsMyTruck] = useState<boolean>(false);

  const { goTo } = useAppNavigation();

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
      agency_name: "",
      driver_name: "",
      phone: "",
      type: "",
      size: "",
      number: "",
      challan: "",
      isMyTruck: false,
    },
    {
      agency_name: [{ type: "required", message: "Agency name is required!" }],
      type: [{ type: "required", message: "Type is required!" }],
      size: [{ type: "required", message: "Size is required!" }],
      driver_name: [{ type: "required", message: "Driver name is required!" }],
      number: [{ type: "required", message: "Vehicle number is required!" }],
      phone: [
        { type: "required", message: "Phone number required" },
        { type: "maxLength", length: 10, message: "Max 10 digits" },
      ],
      challan: [],
    },
    {
      validateOnChange: true,
      debounce: 300,
    }
  );

  useEffect(() => {
    setField("isMyTruck", isMyTruck)
  }, [isMyTruck])

  useEffect(() => {
    if (id && truckData) {
      resetForm();
      setFields({
        agency_name: truckData?.agency_name,
        driver_name: truckData?.driver_name,
        phone: truckData?.phone,
        type: truckData?.type,
        number: truckData?.number,
        size: truckData?.size,
        challan: truckData?.challan || "",
      });
    }
  }, [id, truckData]);

  const onSubmit = async () => {
    const result = validateForm(values);
    if (!result.success) return;

    const formData = new FormData();

    formData.append("agency_name", result.data.agency_name);
    formData.append("driver_name", result.data.driver_name);
    formData.append("phone", result.data.phone);
    formData.append("type", result.data.type);
    formData.append("size", result.data.size);
    formData.append("number", result.data.number);
    formData.append("arrival_date", JSON.stringify(new Date()));
    formData.append("isMyTruck", String(isMyTruck));

    const existingChallan = truckData?.challan;
    const inputChallan = result.data.challan;

    if (existingChallan) {
      formData.append("challan", existingChallan);
    } else if (inputChallan) {
      let fileData: any = inputChallan;
      let filename = "challan.jpg";
      let fileType = "image/jpeg";

      if (typeof inputChallan === "string") {
        filename = inputChallan.split("/").pop() || "challan.jpg";
        fileType = filename.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
        fileData = {
          uri: inputChallan,
          name: filename,
          type: fileType,
        };
      } else if (inputChallan instanceof File) {
        filename = inputChallan.name;
        fileType =
          inputChallan.type ||
          (filename.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
        fileData = inputChallan;
      }

      formData.append("challan", fileData);
    }

    createTruck.mutate(formData, {
      onSuccess: (result) => {
        toast.success("Shipping details updated successfully!");
        resetForm();
        goTo("trucks");
      },
      onError: (error) => {
        toast.error("Failed to create truck");
      },
    });
  };

  return (
        <Require edit="trucks">
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.pageContainer}>
        <PageHeader page="Trucks" />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
        <View style={styles.wrapper}>
          <View
            style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}
          >
            <BackButton label="Add Truck" backRoute="trucks" />
          </View>

          <FormField name="agency_name" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                value={value || ""}
                onChangeText={onChange}
                placeholder="Enter transport agency"
                error={error}
              >
                Transport agency
              </Input>
            )}
          </FormField>

          <FormField name="driver_name" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                value={value || ""}
                onChangeText={onChange}
                placeholder="Enter driver name"
                error={error}
              >
                Driver name
              </Input>
            )}
          </FormField>

          <FormField name="phone" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                value={value.slice(0, 9) || ""}
                onChangeText={onChange}
                placeholder="Enter phone number"
                error={error}
                addonText="+91"
                keyboardType="phone-pad"
              >
                Phone number
              </Input>
            )}
          </FormField>

          <FormField name="type" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                placeholder="Truck type"
                value={value || ""}
                onChangeText={onChange}
                error={error}
              >
                Truck type
              </Input>
            )}
          </FormField>

          <FormField name="size" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                placeholder="Truck Size"
                value={String(value ?? "")}
                onChangeText={(text: string) => {
                  const digitsOnly = text.replace(/\D+/g, ""); // remove everything except numbers
                  onChange(digitsOnly === "" ? 0 : Number(digitsOnly));
                }}
                error={error}
                addonText="Kg"
                post
                keyboardType="number-pad"
              >
                Truck Size
              </Input>
            )}
          </FormField>

          <FormField name="number" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                placeholder="Truck number"
                value={value || ""}
                onChangeText={onChange}
                error={error}
              >
                Truck number
              </Input>
            )}
          </FormField>

          <FormField name="challan" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <SimpleFileUpload fileState={[value, onChange]} error={error} both />
            )}
          </FormField>

          <CustomSwitch setIsChecked={setIsMyTruck} isChecked={isMyTruck}>
            Is my truck
          </CustomSwitch>

          <Button
            onPress={onSubmit}
            disabled={
              !isValid || updateTruck.isPending || createTruck.isPending
            }
          >
            {updateTruck.isPending || createTruck.isPending
              ? "Proceeding..."
              : "Proceed"}
          </Button>
        </View>
      </ScrollView>

      <BottomSheet color="green" />
      {(updateTruck.isPending || createTruck.isPending) && (
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        </View>
      )}
    </View>
    </KeyboardAvoidingView>
    </Require>
  );
};

export default TruckCreateScreen;

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
});
