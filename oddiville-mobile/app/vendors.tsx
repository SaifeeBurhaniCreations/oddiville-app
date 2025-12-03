import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import Button from "@/src/components/ui/Buttons/Button";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import PageHeader from "@/src/components/ui/PageHeader";
import { getColor } from "@/src/constants/colors";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import UserFlatList from "@/src/components/ui/UserFlatList";
import PencilIcon from "@/src/components/icons/common/PencilIcon";
import { UserProps } from "@/src/types";
import { useVendors } from "@/src/hooks/vendor";
import Loader from "@/src/components/ui/Loader";
import { runFilter } from "@/src/utils/bottomSheetUtils";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

const VendorsScreen = () => {
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    vendors = [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isVendorLoading,
    refetch,
  } = useVendors(searchValue);

  const { goTo } = useAppNavigation();

  const handleSearchFilter = () => {
    runFilter({
      key: "vendor:overview",
      validateAndSetData,
      mode: "select-main",
    });
  };

  const handlePress = async (username: string) => {
    console.log("username", username);
    
    const VendorAction = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Vendor Actions",
          },
        },
        {
          type: "optionList",
          data: {
            isCheckEnable: false,
            options: ["Edit Vendor", "Delete Vendor"],
            key: "vendor-action",
          },
        },
      ],
    };

     setIsLoading(true);
    await validateAndSetData(
      username,
      "user-action",
      VendorAction
    );
    setIsLoading(false);
  };

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Vendors"} />
      <View style={styles.wrapper}>
        <View
          style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}
        >
          <BackButton
            label={`Vendors (${vendors?.length ?? 0})`}
            backRoute="vendor-orders"
          />
          <Button
            onPress={() => goTo("vendor-create")}
            variant="outline"
            size="md"
          >
            Add Vendor
          </Button>
        </View>

        <SearchWithFilter
          placeholder="Search by vendor name"
          value={searchValue}
          cross={true}
          onFilterPress={handleSearchFilter}
          onSubmitEditing={() => {}}
          onChangeText={(text) => setSearchValue(text)}
          onClear={() => setSearchValue("")}
        />

        <UserFlatList
          users={vendors.sort((a, b) => a.name.localeCompare(b.name))}
          fetchMore={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          hasMore={hasNextPage ?? false}
          isLoading={isFetchingNextPage}
          refetch={refetch}
          disabled={false}
          onActionPress={handlePress}
        />

        {(isVendorLoading || isLoading) && (
          <View style={styles.overlay}>
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default VendorsScreen;

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
    padding: 16,
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
