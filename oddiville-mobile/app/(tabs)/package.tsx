// 1. React and React Native core
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";

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
import { usePackingForm } from "@/src/hooks/usePackingForm";
import Button from "@/src/components/ui/Buttons/Button";
import { useCreatePackedItem } from "@/src/hooks/packedItem";

// 6. Project types

const PackageScreen = () => {
  // custom hooks
  const toast = useToast();
  const form =
    usePackingForm({validateOnChange: true});
  const { mutate: createPacked, isPending, error } = useCreatePackedItem();

  // states
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // selectors

  // functions
  const onSubmit = async () => {
    const result = form.validateForm();
    if (!result.success) {
      console.log(result.errors);
      return;
    }

    console.log("FINAL PACKING EVENT", result.data);
  };

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
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 4 }}
              >
                <View style={styles.storageColumn}>
                  <ProductContextSection setIsLoading={setIsLoading} form={form} />
                  <RawMaterialConsumptionSection setIsLoading={setIsLoading} />
                </View>
              </ScrollView>
              <View style={{ paddingHorizontal: 16 }}>
                <Button onPress={onSubmit} disabled={!form.canSubmit || isPending} variant="fill">
                  {isPending ? "Packing product..." : "Pack product"}
                </Button>
              </View>
            </View>
            <PackingListingSection
              searchText={searchText}
              setSearchText={setSearchText}
              setIsLoading={setIsLoading}
            />
            <View></View>
          </Tabs>
        </View>
        <BottomSheet color="green" />
        {isLoading && <OverlayLoader />}
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
    paddingBottom: 24,
  },
  flexGrow: {
    flex: 1,
  },
  storageColumn: {
    flexDirection: "column",
    gap: 16,
    paddingVertical: 24,
    flex: 1,
  },
});

export default PackageScreen;
