// 1. React and React Native core
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

// 2. Third-party dependencies
// No items of this type

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import SearchInput from "@/src/components/ui/SearchInput";
import PackageCard from "@/src/components/ui/PackageCard";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import Loader from "@/src/components/ui/Loader";
import Button from "@/src/components/ui/Buttons/Button";
import BottomSheet from "@/src/components/ui/BottomSheet";
import EmptyState from "@/src/components/ui/EmptyState";

// 4. Project hooks
import { usePackages } from "@/src/hooks/Packages";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import { PACKET_ITEMS } from "@/src/constants/Packets";
import { getEmptyStateData } from "@/src/utils/common";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { sortBy } from "@/src/utils/numberUtils";
import { FlatList } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { Chamber, useDryChambers } from "@/src/hooks/useChambers";
import { useGlobalFormValidator } from "@/src/sbc/form/globalFormInstance";
import { AddProductPackageForm } from "@/src/components/ui/bottom-sheet/InputWithSelectComponent";

// 6. Types
// No items of this type

// 7. Schemas
// No items of this type

// 8. Assets
// No items of this type

const PackagingScreen = () => {
  const { role } = useAuth();
  const [searchText, setSearchText] = useState("");
  const {
    data: packageData,
    isLoading: packageLoading,
    fromCache,
  } = usePackages(searchText);
  const { data: DryChambersRaw } = useDryChambers();
  const DryChambers = DryChambersRaw || [];
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const isProductLoading = useSelector(
    (state: RootState) => state.product.isProductLoading
  );

  const productPackageForm = useGlobalFormValidator<AddProductPackageForm>(
    "add-product-package"
  );

  const [isLoading, setIsLoading] = useState(false);
  const formattedData = useMemo(() => {
    return !packageLoading
      ? sortBy(PACKET_ITEMS(packageData), "name", true)
      : [];
  }, [packageData]);

  const handleOpenAddNewPackage = async () => {

    const addProductPackage = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Add new Package",
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
          },
        },
        {
          type: "input-with-select",
          data: {
            placeholder: "Enter title",
            label: "Package title",
            key: "package-weight",
            formField_1: "size",
            label_second: "Unit",
            source: "add-product-package",
          },
        },
        {
          type: "input",
          data: {
            placeholder: "Enter counts",
            label: "Add package",
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
              DryChambers && DryChambers.length === 0
                ? []
                : DryChambers.map((dch: Chamber) => dch.chamber_name),
            key: "product-package",
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
      addProductPackage
    );
    setIsLoading(false);
  };

  const emptyStateData = getEmptyStateData("products");

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Packaging"} />
      <View style={styles.wrapper}>
        <View
          style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}
        >
          <BackButton
            label="Package"
            backRoute={"package"}
          />

          <Button variant="outline" size="md" onPress={handleOpenAddNewPackage}>
            Add package
          </Button>
        </View>

        <View style={styles.searchinputWrapper}>
          <SearchInput
            border
            value={searchText}
            cross={true}
            onChangeText={(text: string) => setSearchText(text)}
            onClear={() => setSearchText("")}
            returnKeyType="search"
            placeholder={"Search by product name"}
          />
        </View>
        <View style={styles.packagesRow}>
          <FlatList
            data={formattedData}
            keyExtractor={(item, index) =>
              item.id?.toString() ?? index.toString()
            }
            renderItem={({ item }) => (
              <PackageCard
                name={item.name}
                id={item.id}
                href={item.href}
                bundle={item.bundle}
                img={item.img}
              />
            )}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between", gap: 8 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View
                style={{
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "center",
                  marginBottom: 148,
                }}
              >
                <EmptyState stateData={emptyStateData} />
              </View>
            }
          />
          {/* {
              formattedData?.length === 0 ?
              <View style={{ alignItems: "center", flex: 1, justifyContent: "center", marginBottom: 148 }}>
                <EmptyState stateData={emptyStateData} />
              </View>
              :
              sortBy([...formattedData], "name", true)?.map((packet, index) => (
                <PackageCard key={index} name={packet.name} id={packet.id} href={packet.href} bundle={packet.bundle} img={packet.img} />
              ))
          } */}
        </View>
      </View>
      <BottomSheet color="green" />
      {(isLoading || packageLoading || !fromCache || isProductLoading) && (
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        </View>
      )}
    </View>
  );
};

export default PackagingScreen;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    flexDirection: "column",
    gap: 24,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 24,
  },
  searchinputWrapper: {
    height: 44,
  },
  packagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.1),
    zIndex: 2,
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
});
