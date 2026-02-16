import { StyleSheet, View } from "react-native";
import React, { useMemo, useState } from "react";
import { B3 } from "@/src/components/typography/Typography";
import { useGetPackingSummary } from "@/src/hooks/packing/useGetPackedItemsToday";
import EmptyState from "../EmptyState";
import RefreshableContent from "../RefreshableContent";
import { getColor } from "@/src/constants/colors";
import SearchWithFilter from "../Inputs/SearchWithFilter";
import noPackageImage from "@/src/assets/images/illustrations/no-packaging.png";
import { mapPackingRows } from "@/src/utils/mappers/mappers.utils";
import { runFilter } from "@/src/utils/bottomSheetUtils";
import { filterItems, flattenFilters } from "@/src/utils/filterUtils";
import { filterHandlers } from "@/src/lookups/filters";
import { FilterEnum } from "@/src/schemas/BottomSheetSchema";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { splitFilters } from "@/src/utils/filters/split.filters";
import ItemCardSectionList from "../ItemCardSectionList";
import OverlayLoader from "../OverlayLoader";

type PackingSummarySection = {
  product: string;
  rows: any[];
};

const PackingSummarySection = () => {
  // selectors
  const nestedFilters = useSelector((state: RootState) => state.filter.filters);

  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  // memo
  const filters = useMemo(
    () => flattenFilters(nestedFilters) as Record<FilterEnum, string[]>,
    [nestedFilters],
  );

  const { projectionFilters, booleanFilters } = useMemo(
    () => splitFilters(filters),
    [filters],
  );

  const mode = useMemo(() => {
    if (projectionFilters?.mode?.[0] === "SKU") return "sku";
    if (projectionFilters?.mode?.[0] === "Product") return "product";
    return "event";
  }, [projectionFilters]);

  // custom hooks
  const {
    data: packingSummary = [],
    isLoading: packingLoading,
    refetch,
  } = useGetPackingSummary({
    mode,
  });

  const sections = useMemo(() => {
    if (!packingSummary?.length) return [];
    return (packingSummary as PackingSummarySection[])
      .map((section) => ({
        title: mode !== "product" ? section.product : "",
        data: filterItems(
          mapPackingRows(section.rows, section.product, mode),
          booleanFilters,
          filterHandlers,
        ),
      }))
      .filter((section) => section.data.length > 0);
  }, [packingSummary, booleanFilters, mode]);

  // states
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // functions
  const handleSearchFilter = () => {
    setIsLoading(true);
    runFilter({
      key: "packing:summary",
      validateAndSetData,
      mode: "select-main",
    });
    setIsLoading(false);
  };

  if (packingLoading) return <OverlayLoader />;

  return (
    <View style={styles.flexGrow}>
      <View style={styles.searchinputWrapper}>
        <SearchWithFilter
          value={searchText}
          onChangeText={(text: string) => setSearchText(text)}
          placeholder={"Search by product name"}
          onFilterPress={handleSearchFilter}
        />
      </View>
      <RefreshableContent
        isEmpty={!packingLoading && sections.length === 0}
        refreshing={packingLoading}
        onRefresh={refetch}
        emptyComponent={
          <View style={styles.emptyStateWrapper}>
            <EmptyState
              image={noPackageImage}
              stateData={{
                title: "No summary",
                description: "Packages summary will appear here.",
              }}
            />
          </View>
        }
      >
        <ItemCardSectionList
          sections={sections}
          refreshing={packingLoading}
          onRefresh={refetch}
        />
      </RefreshableContent>
    </View>
  );
};

export default PackingSummarySection;

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
    paddingBottom: 32,
  },
  flexGrow: {
    flex: 1,
  },
  searchinputWrapper: {
    height: 44,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  packagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
  content: {
    flexDirection: "column",
    gap: 16,
    height: "100%",
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  storageColumn: {
    flexDirection: "column",
    gap: 16,
    paddingVertical: 24,
    flex: 1,
  },
  rawMaterialColumn: {
    flexDirection: "column",
    flex: 1,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 16,
  },
  Vstack: {
    flexDirection: "column",
  },
  Hstack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  justifyCenter: {
    justifyContent: "center",
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: getColor("green", 100, 0.3),
  },

  chamberCard: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    flex: 1,
    paddingTop: 16,
  },
  card: {
    backgroundColor: getColor("green"),
    borderRadius: 16,
  },
  firstCard: {
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
  },
  cardHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardBody: {
    backgroundColor: getColor("light"),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingHorizontal: 8,
    flexDirection: "column",
    gap: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityCard: {
    boxShadow: "0px 6px 6px -3px rgba(0, 0, 0, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: getColor("green", 100),
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: getColor("light", 400),
    flex: 1,
    gap: 16,
  },
  packageWrapper: {
    paddingHorizontal: 12,
    gap: 8,
  },
  sizeQtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  packageRow: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
  },
  separator: {
    height: 1,
    backgroundColor: getColor("green", 100),
  },
  inlineEmptyState: {
    height: 200,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});
