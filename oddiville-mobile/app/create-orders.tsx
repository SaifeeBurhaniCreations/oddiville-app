// 1. React and React Native core
import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

// 2. Third-party dependencies
import { useDispatch, useSelector } from "react-redux";
import { parse, isValid as isDateValid, startOfDay } from "date-fns";

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import BackButton from "@/src/components/ui/Buttons/BackButton";

import CreateFromStorage from "@/src/components/ui/dispatch-order/CreateFromStorage";
import Button from "@/src/components/ui/Buttons/Button";

// 4. Project hooks
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { useMultiStepFormValidator } from "@/src/sbc/form";

import { useDispatchOrder } from "@/src/hooks/dispatchOrder";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";

// 6. Types
import { RootState } from "@/src/redux/store";
import { CountryProps } from "@/src/types";
import { clearProduct } from "@/src/redux/slices/product.slice";
import { useAuth } from '@/src/context/AuthContext';
import { resolveAccess } from '@/src/utils/policiesUtils';
import { SALES_BACK_ROUTES, resolveBackRoute, resolveDefaultRoute } from '@/src/utils/backRouteUtils';
import { DispatchUsedStockState } from "@/src/redux/slices/used-dispatch.slice";
import { DispatchUIProduct } from "@/src/types/domain/dispatch/dispatch.types";
import { usePackedItems } from "@/src/hooks/packing/getPackedItemsEvent";
import { clearLocations } from "@/src/redux/slices/bottomsheet/location.slice";
import { clearRawMaterials } from "@/src/redux/slices/bottomsheet/raw-material.slice";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/context/ToastContext";
import Require from "@/src/components/authentication/Require";

// 7. Schemas
// No items of this type

// 8. Assets
// No items of this type

// Redux slice actions

export type OrderStorageForm = {
  customer_name: string;
  est_delivered_date: string;
  address: string;
  country: CountryProps;
  state: string | { name: string; isoCode: string };
  city: string | { name: string; isoCode: string };
  products: DispatchUIProduct[];
  usedBagsByProduct: {
    [productId: string]: {
      [packageKey: string]: {
        totalBags: number;
        totalPackets: number;        
      packet: {                    
        size: number;
        unit: "gm" | "kg";
        packetsPerBag: number;
      };
        byChamber: {
          [chamberId: string]: number;
        };
      };
    };
  };
};

type UsedBagsByProduct = {
  [productId: string]: {
    [packageKey: string]: {
      totalBags: number;
      totalPackets: number;         
      packet: {                    
        size: number;
        unit: "gm" | "kg";
        packetsPerBag: number;
      };
      byChamber: {
        [chamberId: string]: number;
      };
    };
  };
};

function buildUsedBags(
  usedStock: DispatchUsedStockState,
  packetMetaIndex: Map<string, { size: number; unit: "gm" | "kg"; packetsPerBag: number }>
): UsedBagsByProduct {

  const result: UsedBagsByProduct = {};

  for (const productId in usedStock) {
    result[productId] = {};

    for (const packageKey in usedStock[productId]) {

      const metaKey = `${productId.split("::")[0]}::${packageKey}`;
      const packetMeta = packetMetaIndex.get(metaKey);

      if (!packetMeta) {
        console.warn("Missing packet meta for", metaKey);
        continue;
      }

      const { usedBagsByChamber } = usedStock[productId][packageKey];

      let totalBags = 0;
      const byChamber: Record<string, number> = {};

      for (const chamberId in usedBagsByChamber) {
        const bags = Number(usedBagsByChamber[chamberId] || 0);
        byChamber[chamberId] = bags;
        totalBags += bags;
      }

      const totalPackets = totalBags * packetMeta.packetsPerBag;

      result[productId][packageKey] = {
        totalBags,
        totalPackets,
        packet: packetMeta,
        byChamber,
      };
    }
  }

  return result;
}


const CreateOrder = () => {
  const { role, policies } = useAuth();
  const toast = useToast();
const queryClient = useQueryClient();
  const safeRole = role ?? "guest";
  const safePolicies = policies ?? [];
  const access = resolveAccess(safeRole, safePolicies);

  const dispatch = useDispatch();
  const [step, setStep] = useState<number>(1);

    const { data: packedItemsDataNew, isFetching: packedItemsLoadingNew } =
      usePackedItems();

const packetMetaIndex = useMemo(() => {
  const map = new Map<
    string,
    { size: number; unit: "gm" | "kg"; packetsPerBag: number }
  >();

  (packedItemsDataNew ?? []).forEach(item => {
    const key = `${item.product_name}::${item.skuId}-${item.rating}`;

    map.set(key, {
      size: item.packet.size,
      unit: item.packet.unit as "gm" | "kg",
      packetsPerBag: item.packet.packetsPerBag,
    });
  });

  return map;
}, [packedItemsDataNew]);

  const { goTo } = useAppNavigation();
  const {
    countries: selectedCountry,
    states: selectedState,
    cities: selectedCity,
  } = useSelector((state: RootState) => state.location);

  const selectedProducts = useSelector(
    (state: RootState) => state.multipleProduct.selectedProducts
  );
  const usedStock = useSelector(
    (state: RootState) => state.usedDispatchPkg
  );

  const dispatchOrder = useDispatchOrder();
 
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
      products: [],
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
          length: 3,
          message: "Address must be at least 3 characters!",
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

  useFocusEffect(
    React.useCallback(() => {
      dispatch(clearProduct());
    }, [])
  );

  useEffect(() => {
    if (!Array.isArray(values.products)) return;

    const selectedIds = new Set(
      (selectedProducts ?? []).map(p => p.id)
    );

    const syncedProducts = values.products.filter(p =>
      selectedIds.has(p.id)
    );

    const existingIds = new Set(syncedProducts.map(p => p.id));

    const newProducts: DispatchUIProduct[] = (selectedProducts ?? [])
      .filter(sp => !existingIds.has(sp.id))
      .map(sp => ({
        id: sp.id,
        product_name: sp.product_name,
        image: sp.image ?? "",
        rating: sp.rating ?? 5,
      }));

    if (
      syncedProducts.length !== values.products.length ||
      newProducts.length > 0
    ) {
      setField("products", [...syncedProducts, ...newProducts]);
    }
  }, [selectedProducts]);

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

  const onSubmit = () => {
    const updatedValues = {
      ...values,
      country: selectedCountry,
      state: selectedState?.name,
      city: selectedCity,
    };
    const result = validateCurrentStep(updatedValues);

    if (result.success) {
      toast.info("Move to step 2!");
      setStep(2);
    }
  };

  const onFinalSubmit = async () => {
    const result = validateForm();
    const sanitizedProducts = values.products.map(p => ({
      id: p.id,
      product_name: p.product_name,
      image: p.image,
      rating: p.rating,
    })) satisfies DispatchUIProduct[];

    if (result.success) {
const usedBagsByProduct = buildUsedBags(
  usedStock,
  packetMetaIndex
);

      const hasAnyBags = Object.values(usedBagsByProduct).some(product =>
        Object.values(product).some(pkg => pkg.totalBags > 0)
      );

      if (!hasAnyBags) {
        toast.error("Please enter at least one bag to dispatch");
        return;
      }

      const payload = {
        ...result.data,
        products: sanitizedProducts,
        usedBagsByProduct,
      };

      // console.log("✅ Final form data:", JSON.stringify(payload, null, 2));

      try {
        dispatchOrder.mutate(payload, {
          onSuccess: (result) => {
            queryClient.invalidateQueries({
              queryKey: ["chamber-stock"],
            });
            resetForm();
            dispatch(clearLocations());
            dispatch(clearRawMaterials());
            dispatch(clearProduct());
            goTo("sales");
          },
          onError: (error) => {
            toast.error("Failed to dispatch order");
          },
        });
      } catch (error) {
        console.log("✅ Final form data:", JSON.stringify(result.data));
      }
      toast.success("Dispatch Order created!");
    } else {
      toast.error(Object.values(result.errors).join("\n"));
    }
  };

  const backRoute = resolveBackRoute(
    access,
    SALES_BACK_ROUTES,
    resolveDefaultRoute(access)
  );

  return (
   <Require edit="sales">
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
      </View>
    </KeyboardAvoidingView>
   </Require>
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
