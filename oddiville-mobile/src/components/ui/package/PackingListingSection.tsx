// 1. React and React Native core
import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { FlatList, RefreshControl } from "react-native-gesture-handler";

// 2. Third-party dependencies
// (none)

// 3. Project UI components
import { H3 } from "../../typography/Typography";
import Button from "../Buttons/Button";
import SearchWithFilter from "../Inputs/SearchWithFilter";
import PackageCard from "../PackageCard";
import EmptyState from "../EmptyState";

// 4. Bottom sheets / forms
import { AddProductPackageForm } from "../bottom-sheet/InputWithSelectComponent";

// 5. Project hooks
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { usePackages } from "@/src/hooks/Packages";
import {
  Chamber as DryChambersTypes,
  useDryChambers,
} from "@/src/hooks/useChambers";
import { useGlobalFormValidator } from "@/src/sbc/form/globalFormInstance";

// 6. Project constants
import { PACKET_ITEMS } from "@/src/constants/Packets";

// 7. Project utilities
import { getEmptyStateData } from "@/src/utils/common";
import { sortBy } from "@/src/utils/numberUtils";
import OverlayLoader from "../OverlayLoader";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { useAppCapabilities } from "@/src/hooks/useAppCapabilities";

const PackageSectionHeader = ({
  canEdit,
  onAdd,
}: {
  canEdit: boolean;
  onAdd: () => void;
}) => (
  <View
    style={[
      styles.HStack,
      styles.justifyBetween,
      styles.alignCenter,
      { paddingTop: 16, paddingHorizontal: 16 },
    ]}
  >
    <H3>Package</H3>
    {canEdit && (
      <Button variant="outline" size="md" onPress={onAdd}>
        Add package
      </Button>
    )}
  </View>
);

const PackingListingSection = ({
  searchText,
  setSearchText,
  setIsLoading,
}: {
  searchText: string;
  setSearchText: (text: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}) => {
  // custom hooks start
  const caps = useAppCapabilities();
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const { isProductLoading } = useSelector((state: RootState) => state.product);
  const productPackageForm = useGlobalFormValidator<AddProductPackageForm>(
    "add-product-package",
  );

  const { data: DryChambersRaw } = useDryChambers();
  const DryChambers = DryChambersRaw || [];

  const {
    data: packageData,
    isLoading: packageLoading,
    refetch: packageRefetch,
    isFetching: packageFetching,
  } = usePackages(searchText);

  const formattedData = useMemo(() => {
    return !packageLoading
      ? sortBy(PACKET_ITEMS(packageData), "name", true)
      : [];
  }, [packageData, packageLoading]);
  // custom hooks end

  // Effects
  useEffect(() => {
    setIsLoading(packageLoading);
  }, [packageLoading]);

  //   variables start
  const emptyStateData = getEmptyStateData("products");
  // variables end

  // functions start
  const handleOpenAddNewPackage = async () => {
    const addProductPackage = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Add Packing Material",
          },
        },
        {
          type: "input-with-select",
          data: {
            placeholder: "Enter Product",
            label: "Product name",
            placeholder_second: "Enter RM",
            label_second: "Raw Material",
            alignment: "half",
            key: "add-raw-material",
            formField_1: "product_name",
            source: "add-product-package",
            source2: "product-package",
            keyboardType: "default",
          },
        },
        {
          type: "input-with-select",
          data: {
            placeholder: "Enter SKU",
            label: "Packing Size",
            key: "package-weight",
            formField_1: "size",
            label_second: "Unit",
            keyboardType: "number-pad",
            source: "add-product-package",
          },
        },
        {
          type: "input",
          data: {
            placeholder: "Enter counts",
            label: "No. of Pouches",
            keyboardType: "number-pad",
            formField: "quantity",
          },
        },
        {
          type: "select",
          data: {
            placeholder:
              productPackageForm.values.chamber_name || "Select Chamber",
            label: "Select Chamber",
            options:
              DryChambers.length === 0
                ? []
                : DryChambers.map((dch: DryChambersTypes) => dch.chamber_name),
            key: "product-package",
          },
        },
        {
          type: "file-upload",
          data: {
            label: "Upload pouch image",
            uploadedTitle: "Uploaded pouch image",
            title: "Upload pouch image",
            key: "package-image",
          },
        },
        {
          type: "file-upload",
          data: {
            label: "Upload packed image",
            uploadedTitle: "Uploaded packed image",
            title: "Upload packed image",
            key: "image",
          },
        },
      ],
      buttons: [
        {
          text: "Add package",
          variant: "fill",
          color: "green",
          alignment: "full",
          disabled: false,
          actionKey: "add-product-package",
        },
      ],
    };

    setIsLoading(true);
    await validateAndSetData(
      "temp123",
      "add-product-package",
      addProductPackage,
    );
    setIsLoading(false);
  };
  // functions end

  return (
    <View style={styles.flexGrow}>
      <PackageSectionHeader
        canEdit={caps.package.edit}
        onAdd={handleOpenAddNewPackage}
      />
      <View style={styles.searchinputWrapper}>
        <SearchWithFilter
          value={searchText}
          onChangeText={(text: string) => setSearchText(text)}
          placeholder={"Search by product name"}
          onFilterPress={() => {}}
        />
      </View>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={formattedData}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 20 }}>
            <PackageCard
              name={item.name}
              id={item.id}
              href={item.href}
              bundle={item.bundle}
              img={item.img}
            />
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          gap: 8,
        }}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={packageFetching}
            onRefresh={packageRefetch}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 80 }}>
            <EmptyState stateData={emptyStateData} />
          </View>
        }
      />
      {isProductLoading && <OverlayLoader />}
    </View>
  );
};

export default PackingListingSection;

const styles = StyleSheet.create({
  HStack: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  flexGrow: {
    flex: 1,
  },
  searchinputWrapper: {
    height: 44,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
});
