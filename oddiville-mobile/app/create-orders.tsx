// 1. React and React Native core
import React, { useEffect, useState, useRef, useMemo } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

// 2. Third-party dependencies
import { useDispatch, useSelector } from "react-redux";
import { parse, isValid as isDateValid, startOfDay } from "date-fns";

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import BackButton from "@/src/components/ui/Buttons/BackButton";

import CreateFromStorage from "@/src/components/ui/dispatch-order/CreateFromStorage";
import Button from "@/src/components/ui/Buttons/Button";
import DetailsToast from "@/src/components/ui/DetailsToast";

// 4. Project hooks
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { useMultiStepFormValidator } from "@/src/sbc/form";

import { useDispatchOrder } from "@/src/hooks/dispatchOrder";
import { usePackedItems } from "@/src/hooks/packedItem";
import { useChamber } from "@/src/hooks/useChambers";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";

// 6. Types
import { RootState } from "@/src/redux/store";
import { CountryProps } from "@/src/types";
import { clearLocations } from "@/src/redux/slices/bottomsheet/location.slice";
import { clearRawMaterials } from "@/src/redux/slices/bottomsheet/raw-material.slice";
import { clearProduct } from "@/src/redux/slices/product.slice";
import { useAuth } from '@/src/context/AuthContext';
import { resolveAccess } from '@/src/utils/policiesUtils';
import { SALES_BACK_ROUTES, resolveBackRoute, resolveDefaultRoute } from '@/src/utils/backRouteUtils';

// 7. Schemas
// No items of this type

// 8. Assets
// No items of this type

// Redux slice actions

interface Chamber {
  id: string;
  name: string;
  stored_quantity: number;
  quantity: number;
}

interface Product {
  name: string;
  chambers: Chamber[];
}

type RMChamberQuantityMap = {
  [rmName: string]: {
    [chamberId: string]: number;
  };
};

export type OrderStorageForm = {
  customer_name: string;
  est_delivered_date: string;
  address: string;
  country: CountryProps;
  state: string | { name: string; isoCode: string };
  city: string | { name: string; isoCode: string };
  products: Product[];
  rmChamberQuantities: RMChamberQuantityMap;
};

const validateProductChambers = (products: Product[]): boolean => {
  if (!Array.isArray(products) || products?.length === 0) return false;

  return products.every((product: Product) => {
    if (
      !product.name ||
      !Array.isArray(product.chambers) ||
      product.chambers?.length === 0
    ) {
      return false;
    }

    const hasValidQuantity = product.chambers.some((chamber: Chamber) => {
      const quantity = Number(chamber.quantity);
      const storedQuantity = Number(chamber.stored_quantity);

      if (
        !chamber.id ||
        !chamber.name ||
        isNaN(quantity) ||
        isNaN(storedQuantity)
      ) {
        return false;
      }

      return quantity > 0 && quantity <= storedQuantity;
    });

    return hasValidQuantity;
  });
};

const CreateOrder = () => {
    const { role, policies } = useAuth();
    
    const safeRole = role ?? "guest";
    const safePolicies = policies ?? [];
    const access = resolveAccess(safeRole, safePolicies);

  const dispatch = useDispatch();
  const [step, setStep] = useState<number>(1);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");
  const { goTo } = useAppNavigation();
  const {
    countries: selectedCountry,
    states: selectedState,
    cities: selectedCity,
  } = useSelector((state: RootState) => state.location);
  const { product: selectedProduct } = useSelector(
    (state: RootState) => state.product
  );
  const dispatchOrder = useDispatchOrder();
  const { data: packedItemsData, isFetching: packedItemsLoading } =
    usePackedItems();

  const filteredPackedItemsData = useMemo(() => {
    return packedItemsData?.map((item) => ({
      ...item,
      chamber: item.chamber.filter(
        (chamber) => !chamber.id.toLowerCase().includes("dry")
      ),
    }));
  }, [packedItemsData]);

  const { data: chambersData, isFetching: chambersLoading } = useChamber();
  const canSeeAmount = access.isFullAccess; 

  const {
    values,
    setField,
    errors,
    validateCurrentStep,
    validateForm,
    isValid,
    isCurrentStepValid,
    resetForm,
  } = useMultiStepFormValidator<OrderStorageForm>(
    {
      customer_name: "",
      est_delivered_date: "",
      address: "",
      country: selectedCountry ?? { label: "India", icon: "", isoCode: "IN" },
      products: [],
      state: "",
      city: "",
    },
    {
      customer_name: [
        { type: "required" as const, message: "Customer name is required!" },
        {
          type: "minLength" as const,
          length: 2,
          message: "Customer name must be at least 2 characters!",
        },
      ],
      products: [
        {
          type: "custom" as const,
          validate: (products: Product[]) => {
            if (!Array.isArray(products) || products?.length === 0) {
              return false;
            }
            return validateProductChambers(products);
          },
          message:
            "Each product must have a valid name and at least one chamber with quantity > 0 (not exceeding stored quantity).",
        },
      ],
      est_delivered_date: [
        {
          type: "custom" as const,
          validate: (val: string) => {
            if (!val) return true;

            const parsedDate = parse(val, "MMM dd, yyyy", new Date());
            if (!isDateValid(parsedDate)) return false;

            const today = startOfDay(new Date());
            const selected = startOfDay(parsedDate);

            return selected >= today;
          },
          message: "Delivery date cannot be in the past!",
        },
      ],
      address: [
        { type: "required" as const, message: "Address is required!" },
        {
          type: "minLength" as const,
          length: 10,
          message: "Address must be at least 10 characters!",
        },
      ],
      country: [
        {
          type: "custom" as const,
          validate: (val: CountryProps) => !!val?.label && !!val?.isoCode,
          message: "Please select a country!",
        },
      ],
      state: [
        // {
        //     type: 'custom' as const,
        //     validate: (val: string) => !!val && val?.length > 0,
        //     message: 'Please select a state!',
        // }
      ],
      city: [
        {
          type: "custom" as const,
          validate: (val: string) => !!val && val?.length > 0,
          message: "Please select a city!",
        },
      ],
    },
    {
      1: [
        "customer_name",
        "address",
        "country",
        "state",
        "city",
        "est_delivered_date",
      ],
      2: ["products"],
    } as Record<number, (keyof OrderStorageForm)[]>,
    {
      validateOnChange: true,
      debounce: 300,
    }
  );

  useEffect(() => {
    if (!selectedProduct || !filteredPackedItemsData?.length) return;

    const packed = filteredPackedItemsData.find(
      (p) => p.product_name === selectedProduct
    );
    if (!packed) return;

    const currentProducts = Array.isArray(values.products)
      ? values.products
      : [];

    const alreadyExists = currentProducts.some(
      (p) => p.name === packed.product_name
    );
    if (alreadyExists) return;

    const mappedChambers =
      (packed.chamber || []).map((c) => {
        const chamberInfo = chambersData?.find(
          (ch) => String(ch.id) === String(c.id)
        );

        return {
          id: c.id,
          name: chamberInfo?.chamber_name ?? String(c.id),
          stored_quantity: c.quantity,
          quantity: "",
        };
      }) ?? [];

    const newProduct = {
      name: packed.product_name,
      chambers: mappedChambers,
    };

    setField("products", [...currentProducts, newProduct]);
  }, [selectedProduct, filteredPackedItemsData, values.products, chambersData]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  useEffect(() => {
    if (selectedCountry?.label && selectedCountry?.icon) {
      setField("country", selectedCountry);
    }
  }, [selectedCountry]);

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

  // useEffect(() => {
  //   if (!selectedProduct || !selectedProduct?.length) return;
  //   setField("product_name", selectedProduct);
  // }, [selectedProduct]);

  const onSubmit = () => {
    const updatedValues = {
      ...values,
      country: selectedCountry,
      state: selectedState?.name,
      city: selectedCity,
    };
    const result = validateCurrentStep(updatedValues);

    if (result.success) {
      showToast("info", "Move to step 2!");
      setStep(2);
    }
  };

  const onFinalSubmit = async () => {
    const result = validateForm();

    if (result.success) {
      console.log("✅ Final form data:", JSON.stringify(result.data));

      try {
        dispatchOrder.mutate(result.data, {
          onSuccess: (result) => {
            resetForm();
            dispatch(clearLocations());
            dispatch(clearRawMaterials());
            dispatch(clearProduct());
            goTo("sales");
          },
          onError: (error) => {
            showToast("error", "Failed to dispatch order");
          },
        });
      } catch (error) {
        console.log("✅ Final form data:", JSON.stringify(result.data));
      }
      showToast("info", "Dispatch Order created!");
    } else {
      setToastVisible(true);
      setToastType("error");
      setToastMessage(Object.values(result.errors).join("\n"));
    }
  };

  const backRoute = resolveBackRoute(
  access,
  SALES_BACK_ROUTES,
  resolveDefaultRoute(access)
);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.pageContainer}>
        <PageHeader page={"Sales"} />
        <View style={styles.wrapper}>
          <View style={[styles.HStack, { paddingHorizontal: 16 }]}>
            <View style={{ paddingBottom: 8 }}>
              <BackButton
                label="Create Dispatch Order"
                onPress={() => {
                  if (step === 2) {
                    setStep(1);
                  } else {
                    goTo(backRoute);
                  }
                }}
              />
            </View>
          </View>
          {/* <Tabs
                    color="green"
                    variant="ghost"
                    renderTabHeader={({ activeTab, setActiveTab }) => (
                        <RadioGroup
                            style={{paddingHorizontal: 16, paddingVertical: 16}}
                            options={options}
                            selected={activeTab}
                            onSelect={(selected) =>
                            setActiveTab(options.findIndex((opt) => opt.text === selected))
                            }
                        />
                        )
                    }
                >
                </Tabs> */}
          <CreateFromStorage
            handleGetStep={step}
            controlledForm={{ values, setField, errors }}
          />
          <View style={{ paddingHorizontal: 16 }}>
            {step === 1 ? (
              <Button
                onPress={onSubmit}
                variant="fill"
                disabled={!isCurrentStepValid}
              >
                Next
              </Button>
            ) : (
              <Button
                onPress={onFinalSubmit}
                disabled={dispatchOrder.isPending}
                variant="fill"
              >
                {dispatchOrder.isPending
                  ? "Creating Dispatch..."
                  : "Create Dispatch"}
              </Button>
            )}
          </View>
        </View>
        <DetailsToast
          type={toastType}
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateOrder;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingVertical: 16,
  },
  HStack: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  gap8: {
    gap: 8,
  },
});
