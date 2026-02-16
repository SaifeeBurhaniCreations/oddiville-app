// 1. React and React Native core
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useEffect, useMemo, useState } from "react";

// 2. Third-party dependencies

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import BottomSheet from "@/src/components/ui/BottomSheet";
import Tabs from "@/src/components/ui/Tabs";
import OverlayLoader from "@/src/components/ui/OverlayLoader";
import ProductContextSection from "@/src/components/ui/package/ProductContextSection";
import PackingListingSection from "@/src/components/ui/package/PackingListingSection";
// 4. Project hooks
import { useToast } from "@/src/context/ToastContext";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import RawMaterialConsumptionSection from "@/src/components/ui/package/RawMaterialConsumptionSection";
import { usePackingForm } from "@/src/hooks/packing/usePackingForm";
import Button from "@/src/components/ui/Buttons/Button";
import PackingSKUSection from "@/src/components/ui/package/PackingSKUSection";
import EmptyState, { EmptyStateStyles } from "@/src/components/ui/EmptyState";
import { getEmptyStateData } from "@/src/utils/common";
import { useRawMaterialConsumption } from "@/src/hooks/packing/useRawMaterialConsumption";
import { setFinalDraft } from "@/src/redux/slices/packingDraft.slice";
import { useDispatch, useSelector } from "react-redux";
import { Packaging, useChamberStockByName } from "@/src/hooks/useChamberStock";
import { RootState } from "@/src/redux/store";
import { B4 } from "@/src/components/typography/Typography";
import {
  clearProduct,
  setRawMaterials,
} from "@/src/redux/slices/product.slice";
import { resetPackageSizes } from "@/src/redux/slices/bottomsheet/package-size.slice";
import { clearChambers } from "@/src/redux/slices/bottomsheet/raw-material.slice";
import { clearRatings } from "@/src/redux/slices/bottomsheet/storage.slice";
import PackingSummarySection from "@/src/components/ui/package/PackingSummarySection";
import { useCreatePacking } from "@/src/hooks/packing/useGetPackedItemsToday";
import { useQueryClient } from "@tanstack/react-query";

// 6. Project types

const PackageScreen = () => {
  // selectors
  const selectedRawMaterials = useSelector(
    (state: RootState) => state.product.rawMaterials,
  );

  // custom hooks
  const toast = useToast();
  const dispatch = useDispatch();
  const form = usePackingForm({ validateOnChange: true });

  const { chamberStock } = useChamberStockByName(selectedRawMaterials);

  const rmUsed = useMemo(() => chamberStock ?? [], [chamberStock]);

  const rm = useRawMaterialConsumption(rmUsed);

  const { mutate: createPacked, isPending, error } = useCreatePacking();

  // tanstack query
  const queryClient = useQueryClient();

  // states
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCurrentProduct, setIsCurrentProduct] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [overPackMap, setOverPackMap] = useState<Record<string, boolean>>({});

  // derived variable
  const disableButton = Object.values(overPackMap).some(Boolean);

  //  memo
  const submitDisabledReason = useMemo(() => {
    if (isPending) return "Packing in progress";

    const errors = form.getErrors?.();
    if (!errors || Object.keys(errors).length === 0) return null;

    if (errors["product.productName"]) return "Please select a product";

    if (errors["rm"]) return "Raw material consumption is required";

    if (errors["cross"]) return errors["cross"];

    if (errors["packaging"]) return "Packaging quantity is required";

    return "Please fix the highlighted fields";
  }, [form.getErrors, isPending]);

  // effect
  useEffect(() => {
    if (!showTooltip) return;
    const t = setTimeout(() => setShowTooltip(false), 2000);
    return () => clearTimeout(t);
  }, [showTooltip]);

  // functions
  const onSubmit = async (data: any) => {
    dispatch(setFinalDraft(data));
    setIsLoading(true);

    createPacked(data, {
      onSuccess: () => {
        form.resetForm();
        dispatch(clearProduct());
        dispatch(setRawMaterials([]));
        dispatch(resetPackageSizes());
        dispatch(clearChambers());
        dispatch(clearRatings());

        queryClient.invalidateQueries({
          queryKey: ["packageName", data.product.productName],
        });

        toast.success("Packed item created!");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Packing failed");
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };

  const handleOverPackChange = (key: string, value: boolean) => {
    setOverPackMap((prev) => ({ ...prev, [key]: value }));
  };

  const emptyStateData = getEmptyStateData("products");

  function getRmKgPerBag(
    packaging: Packaging | Packaging[] | null | undefined,
  ): number {
    if (!packaging) return 0;

    const pkg = Array.isArray(packaging) ? packaging[0] : packaging;

    if (pkg.size.unit !== "kg") return 0;

    return Number(pkg.size.value);
  }

  const isFormStructurallyValid = useMemo(() => {
    if (!form.values.product.productName) return false;

    /* ---------------- RM KG USED ---------------- */
    const rmKgUsed = rmUsed.reduce((sum, rm) => {
      const kgPerBag = getRmKgPerBag(rm.packaging);

      const usedBags = Object.values(
        form.values.rmInputs?.[rm.product_name] || {},
      ).reduce((s, v) => s + Number(v || 0), 0);

      return sum + usedBags * kgPerBag;
    }, 0);

    /* ---------------- PACKED KG ---------------- */
    const packedKg = form.values.packagingPlan.reduce((sum, p) => {
      const packetKg =
        p.packet.unit === "gm" ? p.packet.size / 1000 : p.packet.size;

      const kgPerBag = packetKg * p.packet.packetsPerBag;

      return sum + kgPerBag * p.bagsProduced;
    }, 0);

    if (rmKgUsed === 0) return false;
    if (packedKg === 0) return false;

    if (Math.abs(rmKgUsed - packedKg) > 0.001) return false;

    for (const plan of form.values.packagingPlan) {
      if (!plan.storage || plan.storage.length === 0) return false;
    }

    return true;
  }, [
    form.values.product.productName,
    form.values.rmInputs,
    form.values.packagingPlan,
    rmUsed,
  ]);

  const isSubmitDisabled =
    isPending || disableButton || !isFormStructurallyValid;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.pageContainer}>
        <PageHeader page={"Packing"} />
        <View style={styles.wrapper}>
          <Tabs
            tabTitles={["Stock", "Packing material", "Daily packing"]}
            color="green"
            style={styles.flexGrow}
          >
            <View style={{ flex: 1 }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 56 }}
              >
                <View style={styles.storageColumn}>
                  <ProductContextSection
                    setIsLoading={setIsLoading}
                    form={form}
                    setIsCurrentProduct={setIsCurrentProduct}
                  />
                  <RawMaterialConsumptionSection
                    setIsLoading={setIsLoading}
                    isCurrentProduct={isCurrentProduct}
                    form={form}
                    rm={rm}
                    rmUsed={rmUsed}
                  />
                  <PackingSKUSection
                    setIsLoading={setIsLoading}
                    isCurrentProduct={isCurrentProduct}
                    form={form}
                    onOverPackChange={handleOverPackChange}
                    rmUsed={rmUsed}
                  />

                  {!isCurrentProduct && (
                    <View style={EmptyStateStyles.center}>
                      <EmptyState stateData={emptyStateData} />
                    </View>
                  )}
                </View>
              </ScrollView>
              <View style={{ paddingHorizontal: 16 }}>
                <View>
                  <Pressable
                    disabled={isSubmitDisabled || isPending}
                    onPress={() => {
                      if (disableButton) {
                        setShowTooltip(true);
                        toast.error("Not enough packets in stock");
                        return;
                      }
                      if (isSubmitDisabled) {
                        setShowTooltip(true);
                        toast.error(submitDisabledReason || "Form is invalid");
                        return;
                      }

                      const result = form.validateForm();

                      if (!result.success) {
                        setShowTooltip(true);
                        const firstError = Object.values(result.errors)[0];
                        toast.error(firstError);
                        return;
                      }

                      onSubmit(result.data);
                    }}
                  >
                    <Button
                      variant="fill"
                      interactive={false}
                      disableUi={isSubmitDisabled}
                      disabled={isPending || disableButton}
                    >
                      Pack product
                    </Button>
                  </Pressable>

                  {showTooltip && submitDisabledReason && (
                    <View style={styles.tooltip}>
                      <B4 style={styles.tooltipText}>{submitDisabledReason}</B4>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <PackingListingSection
              searchText={searchText}
              setSearchText={setSearchText}
              setIsLoading={setIsLoading}
            />
            <PackingSummarySection />
          </Tabs>
        </View>
        <BottomSheet color="green" />
        {isLoading && isPending && <OverlayLoader />}
      </View>
    </KeyboardAvoidingView>
  );
};

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
  flexGrow: {
    flex: 1,
  },
  storageColumn: {
    flexDirection: "column",
    gap: 16,
    paddingTop: 20,
    flex: 1,
  },

  tooltip: {
    position: "absolute",
    bottom: 56,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default PackageScreen;
