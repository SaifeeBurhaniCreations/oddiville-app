import { StyleSheet, View, ScrollView, RefreshControl, FlatList } from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import SearchWithFilter from "./Inputs/SearchWithFilter";
import Select from "./Select";
import { RawMaterialProps } from "@/src/types";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { getColor } from "@/src/constants/colors";
import {
  ChamberStockPage,
  useChamberStockPaginated,
} from "@/src/hooks/useChamberStock";
import { useChamber, useChamberByName } from "@/src/hooks/useChambers";
import ChamberCard from "./ChamberCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { selectChamber } from "@/src/redux/slices/chamber.slice";
import EmptyState from "./EmptyState";
import { getEmptyStateData } from "@/src/utils/common";
import { runFilter } from "@/src/utils/bottomSheetUtils";
import { filterItems, flattenFilters } from "@/src/utils/filterUtils";
import { filterHandlers } from "@/src/lookups/filters";
import { FilterEnum } from "@/src/schemas/BottomSheetSchema";
import { useRawMaterial } from "@/src/hooks/rawMaterial";

const ChamberDetailed = ({
  chamberLoading,
  stockLoading,
}: {
  chamberLoading: boolean;
  stockLoading: boolean;
}) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const nestedFilters = useSelector((state: RootState) => state.filter.filters);
  const {
    data: stockData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: stockInfinityLoading,
    refetch: refetchStock,
  } = useChamberStockPaginated(searchValue);

  const { data: rawMaterial = [] } = useRawMaterial();

  const { chamber: selectedChamber } = useSelector(
    (state: RootState) => state.chamber
  );

  const { data = [], refetch: refetchChambers } = useChamber();
  const chambers = data.filter((c) => c.tag !== "dry");

  const { data: chamberData } = useChamberByName(selectedChamber);

  const flatStockData =
    stockData?.pages.flatMap(
      (page: ChamberStockPage) => (page as ChamberStockPage).data
    ) || [];

  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chambers || !chambers || !chambers[0]?.chamber_name) {
      setIsLoading(false);
      return;
    }
    if (!selectedChamber && chambers?.length) {
      dispatch(selectChamber(chambers[0].chamber_name));
    }
  }, [selectedChamber, chambers, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStock?.(), refetchChambers?.()]);
    } catch (e) {}
    setRefreshing(false);
  };

  const handleSearchFilter = () => {
    setIsLoading(true);
    runFilter({
      key: "chamber:detailed",
      validateAndSetData,
      mode: "select-main",
    });
    setIsLoading(false);
  };
  const handleChamberSearch = () => {
    setIsLoading(true);
    validateAndSetData("Chamber-123", "chamber-list");
    setIsLoading(false);
  };

  // const parsedStock: RawMaterialProps[] = useMemo(() => {
  //   if (!chamberData?.id || flatStockData?.length === 0) return [];

  //   return flatStockData
  //     .map((item) => {
  //       const matchingChamberData = item.chamber?.filter(
  //         (entry) => entry.id === chamberData.id
  //       );
  //       if (!matchingChamberData || matchingChamberData.length === 0)
  //         return null;

  //       const detailByRating = matchingChamberData.map((entry) => ({
  //         rating: item.category === "packed" ? "packed" : entry.rating,
  //         quantity: `${entry.quantity}${item.unit}`,
  //       }));


  //       const ratingStrings =
  //         item.category === "packed"
  //           ? []
  //           : matchingChamberData.map((entry) => entry.rating).filter(Boolean);

  //       const ratingNumbers = ratingStrings
  //         .map((r) => parseFloat(r))
  //         .filter((n) => !isNaN(n));

  //       const minRating = ratingNumbers.length
  //         ? Math.min(...ratingNumbers).toFixed(1)
  //         : "";
  //       const maxRating = ratingNumbers.length
  //         ? Math.max(...ratingNumbers).toFixed(1)
  //         : "";

  //       const totalQuantity = matchingChamberData.reduce(
  //         (sum, entry) => sum + parseFloat(entry.quantity || "0"),
  //         0
  //       );

  //       const disabled = totalQuantity <= 0;

  //       const ratingDisplay =
  //         item.category === "packed"
  //           ? "packed"
  //           : item.category === "other"
  //           ? ratingStrings.join(", ")
  //           : minRating && maxRating
  //           ? `${minRating} - ${maxRating}`
  //           : "";

  //       const matchedMaterial = rawMaterial.find(
  //         (m) =>
  //           m?.name?.trim().toLowerCase() ===
  //           item.product_name?.trim().toLowerCase()
  //       );

  //       const image = matchedMaterial?.sample_image?.url
  //         ? matchedMaterial.sample_image.url
  //         : item.category === "other"
  //         ? require("@/src/assets/images/fallback/others-stock-fallback.png")
  //         : require("@/src/assets/images/fallback/chamber-stock-fallback.png");

  //       return {
  //         name: item.product_name,
  //         description: `${totalQuantity} ${item.unit}`,
  //         rating: ratingDisplay,
  //         disabled,
  //         href: item.category === "other" ? "other-products-detail" : "",
  //         quantity: detailByRating[0]?.quantity ?? "",
  //         detailByRating,
  //         category: item.category,
  //         chambers: item.category === "other" ? item.chamber : null,
  //         id: item.category === "other" ? item.id : null,
  //         image,
  //       };
  //     })
  //     .filter(Boolean) as RawMaterialProps[];
  // }, [flatStockData, chamberData, rawMaterial]);

  const parsedStock: RawMaterialProps[] = useMemo(() => {
  if (!chamberData?.id || flatStockData?.length === 0) return [];

  return flatStockData
    .map((item) => {
      const matchingChamberData = item.chamber?.filter(
        (entry) => entry.id === chamberData.id
      );
      if (!matchingChamberData || matchingChamberData.length === 0) {
        return null;
      }

      const detailByRating = matchingChamberData.map((entry) => ({
        rating: item.category === "packed" ? "packed" : entry.rating,
        quantity: `${entry.quantity}${item.unit}`,
      }));

      const ratingStrings =
        matchingChamberData.map((entry) => entry.rating).filter(Boolean);

      const ratingNumbers = ratingStrings
        .map((r) => parseFloat(r))
        .filter((n) => !isNaN(n));

      const minRating = ratingNumbers.length
        ? Math.min(...ratingNumbers).toFixed(1)
        : "";
      const maxRating = ratingNumbers.length
        ? Math.max(...ratingNumbers).toFixed(1)
        : "";

      const totalQuantity = matchingChamberData.reduce(
        (sum, entry) => sum + parseFloat(entry.quantity || "0"),
        0
      );

      const disabled = totalQuantity <= 0;

      let ratingDisplay = "";
      if (minRating && maxRating) {
        ratingDisplay =
          minRating === maxRating
            ? minRating
            : `${minRating} - ${maxRating}`; 
      } else if (item.category === "other") {
        ratingDisplay = ratingStrings.join(", ") || "other";
      } else {
        ratingDisplay = ratingStrings.join(", ") || "N/A";
      }

      const matchedMaterial = rawMaterial.find(
        (m) =>
          m?.name?.trim().toLowerCase() ===
          item.product_name?.trim().toLowerCase()
      );

      const image = matchedMaterial?.sample_image?.url
        ? matchedMaterial.sample_image.url
        : item.category === "other"
        ? require("@/src/assets/images/fallback/others-stock-fallback.png")
        : require("@/src/assets/images/fallback/chamber-stock-fallback.png");
  
      return {
        name: item.product_name,
        description: `${totalQuantity} ${item.unit}`,
        rating: ratingDisplay, // always set
        disabled,
        href: item.category === "other" ? "other-products-detail" : item.category === "material" ? "stock-detail" : "",
        quantity: detailByRating[0]?.quantity ?? "",
        detailByRating,
        category: item.category,
        chambers: item.category === "other" ? item.chamber : null,
        id: item.category === "other" ? item.id : item.category === "material" ? item.id : null,
        image,
      };
    })
    .filter(Boolean) as RawMaterialProps[];
}, [flatStockData, chamberData, rawMaterial]);

  const filters = useMemo(
    () => flattenFilters(nestedFilters) as Record<FilterEnum, string[]>,
    [nestedFilters]
  );

  const filteredItems = useMemo(() => {
    if (!parsedStock) return [];
    return filterItems(parsedStock, filters, filterHandlers);
  }, [parsedStock, filters]);

  const emptyStateData = getEmptyStateData("no-chamber-stock");

  return (
    <>
      <View style={styles.flexGrow}>
        <View style={styles.searchinputWrapper}>
          <SearchWithFilter
            placeholder={"Search by material name"}
            value={searchValue}
            cross={true}
            onFilterPress={handleSearchFilter}
            onSubmitEditing={() => {}}
            onChangeText={(text) => setSearchValue(text)}
            onClear={() => setSearchValue("")}
          />
        </View>

        <Select
          value={selectedChamber}
          options={["Chamber 1", "Chamber 2", "Chamber 3"]}
          showOptions={false}
          onPress={handleChamberSearch}
        />

        <FlatList
          data={filteredItems}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : `${item.name}-${index}`
          }
          renderItem={({ item }) => <ChamberCard {...item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardContainerV2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[getColor("green")]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center" }}>
              <EmptyState stateData={emptyStateData} />
            </View>
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.6}
        />
      </View>
    </>
  );
};

export default ChamberDetailed;

const styles = StyleSheet.create({
  flexGrow: {
    flex: 1,
    gap: 16,
  },
  searchinputWrapper: {
    height: 44,
  },
  cardContainerV2: {
    gap: 12,
    paddingBottom: 20,
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
