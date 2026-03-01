import { StyleSheet, View, RefreshControl, FlatList } from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import SearchWithFilter from "./Inputs/SearchWithFilter";
import Select from "./Select";
import { RootStackParamList } from "@/src/types";
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
import { usePackages } from "@/src/hooks/Packages";

const normalize = (str?: string): string =>
  (str || "").toLowerCase().replace(/\s+/g, " ").trim();

type PackageItem = {
  product_name?: string;
  image?: { url?: string };
  package_image?: { url?: string };
};

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
    refetch: refetchStock,
  } = useChamberStockPaginated(searchValue);

  const { data: rawMaterial = [] } = useRawMaterial();

  const { chamber: selectedChamber } = useSelector(
    (state: RootState) => state.chamber,
  );

  const { data: packages = [] } = usePackages("") as { data: PackageItem[] };

  const packageImageMap = useMemo(() => {
    const map: Record<string, string> = {};

    packages.forEach((pkg) => {
      const key = normalize(pkg.product_name);
      if (!key) return;

      map[key] = pkg?.image?.url || pkg?.package_image?.url || "";
    });

    return map;
  }, [packages]);

  const { data = [], refetch: refetchChambers } = useChamber();
  const chambers = data.filter((c) => c.tag !== "dry");

  const { data: chamberData } = useChamberByName(selectedChamber);

  const flatStockData =
    stockData?.pages.flatMap(
      (page: ChamberStockPage) => (page as ChamberStockPage).data,
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

        const isOtherCategory = item.category === "other";
        const isMaterialCategory = item.category === "material";
        const isPackedCategory = item.category === "packed";

        const chamberEntries = item.chamber.filter(
          (c) => c.id === chamberData.id,
        );

let totalKg = 0;
let totalBags = 0;

// PACKED CATEGORY
if (isPackedCategory && Array.isArray(item.packages)) {

  totalBags = item.packages.reduce((sum, pkg) => {
    return sum + Math.floor(
      Number(pkg.quantity) / Number(pkg.packets_per_bag)
    );
  }, 0);

  totalKg = item.packages.reduce((sum, pkg) => {
    const sizeKg =
      pkg.unit === "kg"
        ? Number(pkg.size)
        : Number(pkg.size) / 1000;

    return sum + Number(pkg.quantity) * sizeKg;
  }, 0);
}

// MATERIAL CATEGORY
else if (isMaterialCategory) {

  totalKg = chamberEntries.reduce(
    (sum, c) => sum + Number(c.quantity || 0),
    0
  );

let bagSize = 0;

if (
  item.packaging &&
  !Array.isArray(item.packaging) &&
  item.packaging.size?.unit === "kg"
) {
  bagSize = Number(item.packaging.size.value);
}
  totalBags = bagSize > 0 ? Math.floor(totalKg / bagSize) : 0;
}

else {
 const avgKgPerBag =
  Array.isArray(item.packages) && item.packages.length > 0
    ? item.packages.reduce((sum, pkg) => {
        const sizeKg =
          pkg.unit === "kg"
            ? Number(pkg.size)
            : pkg.unit === "gm"
            ? Number(pkg.size) / 1000
            : 0;

        return sum + sizeKg * pkg.packets_per_bag;
      }, 0)
    : 0;

totalKg = totalBags * avgKgPerBag;

  totalBags = 0;
}
        const disabled = totalKg <= 0;

        const matchedPackageImage =
          packageImageMap[normalize(item.product_name)] || "";

          const ratingValue = item.rating;

       const ratingDisplay =
          ratingValue != null
            ? `★ ${ratingValue}`
            : isOtherCategory
              ? "N/A"
              : "";

        const href: keyof RootStackParamList | undefined = isOtherCategory
          ? "other-products-detail"
          : isMaterialCategory
            ? "stock-detail"
            : undefined;

        const matchedMaterial = rawMaterial.find(
          (m) =>
            m?.name?.trim().toLowerCase() ===
            item.product_name?.trim().toLowerCase(),
        );

        const image =
          isPackedCategory && matchedPackageImage
            ? matchedPackageImage
            : matchedMaterial?.sample_image?.url
              ? matchedMaterial.sample_image.url
              : isOtherCategory
                ? require("@/src/assets/images/fallback/others-stock-fallback.png")
                : require("@/src/assets/images/fallback/chamber-stock-fallback.png");

            const formattedKg =
              totalKg % 1 === 0
                ? String(totalKg)
                : totalKg.toFixed(2).replace(/\.?0+$/, "");
                
                let description = "";

if (isPackedCategory) {
  description = `${totalBags} Bags | ${formattedKg} kg`;
} else if (isMaterialCategory) {
  description = `${formattedKg} kg (${totalBags} Bags)`;
} else {
  description = `${formattedKg} ${item.unit}`;
}
        return {
          id: item.id,
          name: item.product_name,
          description,
          rating: ratingDisplay,

          category: item.category,
          disabled,

          ...(href ? { href } : {}),

          chambers: isOtherCategory ? item.chamber : chamberEntries,

          detailByRating: chamberEntries.map((c) => ({
            rating: String(item.rating),
            quantity: `${c.quantity}${item.unit}`,
          })),

          image,
        };
      });
  }, [flatStockData, chamberData?.id, packageImageMap, rawMaterial]);

  const filters = useMemo(
    () => flattenFilters(nestedFilters) as Record<FilterEnum, string[]>,
    [nestedFilters],
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
      {isLoading && chamberLoading && stockLoading && <OverlayLoader />}
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
