import { StyleSheet, View, RefreshControl, FlatList } from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import SearchWithFilter from "./Inputs/SearchWithFilter";
import Select from "./Select";
import { RawMaterialProps, RootStackParamList } from "@/src/types";
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
import OverlayLoader from "./OverlayLoader";

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

  const parsedStock = useMemo(() => {
    if (!chamberData?.id) return [];

    return flatStockData
      .filter((item) => item.chamber?.some((c) => c.id === chamberData.id))
      .map((item) => {
        const chamberEntries = item.chamber.filter(
          (c) => c.id === chamberData.id
        );

        const totalQuantity = chamberEntries.reduce(
          (sum, c) => sum + Number(c.quantity || 0),
          0
        );

        const disabled = totalQuantity <= 0;

        const ratingStrings = chamberEntries
          .map((c) => c.rating)
          .filter(Boolean);

        const isOtherCategory = item.category === "other";
        const isMaterialCategory = item.category === "material";

        const ratingDisplay =
          isOtherCategory
            ? ratingStrings[0] ?? "N/A"
            : ratingStrings.length
              ? `★ ${ratingStrings.length > 1
                ? `${Math.min(...ratingStrings.map(Number))} - ${Math.max(
                  ...ratingStrings.map(Number)
                )}`
                : ratingStrings[0]
              }`
              : "";

        const href: keyof RootStackParamList | undefined =
          isOtherCategory

            ? "other-products-detail"
            : isMaterialCategory
            ? "stock-detail"
            : undefined;

        const matchedMaterial = rawMaterial.find(
          (m) =>
            m?.name?.trim().toLowerCase() ===
            item.product_name?.trim().toLowerCase()
        );

        const image = matchedMaterial?.sample_image?.url
          ? matchedMaterial.sample_image.url
          : isOtherCategory
          ? require("@/src/assets/images/fallback/others-stock-fallback.png")
          : require("@/src/assets/images/fallback/chamber-stock-fallback.png");

        return {
          id: item.id,
          name: item.product_name,
          description: `${totalQuantity} ${item.unit}`,
          quantity: `${totalQuantity}${item.unit}`,
          rating: ratingDisplay,

          category: item.category,
          disabled,

          ...(href ? { href } : {}),

          chambers: isOtherCategory ? item.chamber : chamberEntries,

          detailByRating: chamberEntries.map((c) => ({
            rating: c.rating,
            quantity: `${c.quantity}${item.unit}`,
          })),

          image,
        };
      });
  }, [flatStockData, chamberData?.id]);

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
          legacy
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
      {(isLoading && chamberLoading && stockLoading) && <OverlayLoader />}
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
