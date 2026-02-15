import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import PageHeader from "@/src/components/ui/PageHeader";
import { getColor } from "@/src/constants/colors";
import Tabs from "@/src/components/ui/Tabs";
import { useChamber } from "@/src/hooks/useChambers";
import { ChamberStock, useChamberStock } from "@/src/hooks/useChamberStock";
import { ChamberEntry } from "@/src/types";
import ChamberDetailed from "@/src/components/ui/ChamberDetailed";
import Loader from "@/src/components/ui/Loader";
import { getEmptyStateData } from "@/src/utils/common";
import EmptyState from "@/src/components/ui/EmptyState";
import ChamberCard from "@/src/components/ui/ChamberCardComp";
import { useDryChamberSummary } from "@/src/hooks/dryChamber";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import { useAuth } from "@/src/context/AuthContext";
import { resolveAccess } from "@/src/utils/policiesUtils";
import {
  CHAMBERS_BACK_ROUTES,
  resolveBackRoute,
  resolveDefaultRoute,
} from "@/src/utils/backRouteUtils";
import { useAppCapabilities } from "@/src/hooks/useAppCapabilities";
import NoAccess from "@/src/components/ui/NoAccess";
import Require from "@/src/components/authentication/Require";
import OverlayLoader from "@/src/components/ui/OverlayLoader";

const screenWidth = Dimensions.get("window").width;
const chamberSize = screenWidth / 2 - 30;

const ChamberScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const caps = useAppCapabilities();

  const {
    data: chambersData = [],
    isFetching: chambersLoading,
    refetch: refetchChambers,
  } = useChamber();
  const {
    data,
    isFetching: stockLoading,
    refetch: refetchStocks,
  } = useChamberStock();
  const { summaries = [] } = useDryChamberSummary();

  const stockData: ChamberStock[] = data ?? [];

  const parsedChambers = useMemo(() => {
    if (!chambersData || !stockData) return [];

    const summaryMap = new Map<string, { totalQuantity: number }>(
      (summaries ?? []).map((s) => [
        String(s.chamberId),
        { totalQuantity: s.totalQuantity },
      ])
    );

    return chambersData.map(
      (chamber: {
        id: string;
        chamber_name: string;
        capacity: number;
        tag?: string;
      }) => {
        const chamberId = chamber.id;

        const relatedStocks = stockData?.filter(
          (stockItem: { chamber: { id: string }[] }) =>
            stockItem.chamber?.some((c) => c.id === chamberId)
        );

        const filledFromStocks = (relatedStocks ?? []).reduce((sum: number, stockItem: ChamberStock) => {

            const chamberSum = (stockItem.chamber ?? [])
              .filter((c: ChamberEntry) => c.id === chamberId)
              .reduce(
                (acc, c) => acc + Number(parseFloat(c.quantity || "0") || 0),
                0
              );
            return sum + chamberSum;
          },
          0
        );

        const summary = summaryMap.get(String(chamberId));
        const filledFromSummary = summary
          ? Number(summary.totalQuantity || 0)
          : null;

        const useSummary = chamber.tag === "dry" && filledFromSummary !== null;
        const filled = useSummary ? filledFromSummary : filledFromStocks;

        return {
          id: chamberId,
          name: chamber.chamber_name,
          capacity: chamber.capacity,
          filled,
          _filledFromStocks: filledFromStocks,
          _filledFromSummary: filledFromSummary,
          tag: chamber.tag,
        };
      }
    );
  }, [chambersData, stockData, summaries]);

  const emptyStateData = getEmptyStateData("no-chamber-stock");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchChambers?.(), refetchStocks?.()]);
    } catch (e) {}
    setRefreshing(false);
  }, [refetchChambers, refetchStocks]);

  const canAccessChambers =
  caps.production.view ||
  caps.package.view ||
  caps.sales.view ||
  caps.isAdmin;

if (!canAccessChambers) return <NoAccess />;

const backRoute = resolveBackRoute(
  caps.access,
  CHAMBERS_BACK_ROUTES,
  resolveDefaultRoute(caps.access)
);

  return (
  <Require anyOf={["production", "package", "sales"]}>
      <View style={styles.rootContainer}>
      <PageHeader page={"Chamber"} />
      <View style={styles.wrapper}>
        <View style={[styles.paddingTLR16]}>
          <BackButton label="Chambers" backRoute={backRoute} />
        </View>
        <Tabs
          tabTitles={["Overview", "Detail"]}
          color="green"
          style={[
            styles.flexGrow,
            { paddingTop: 16, flexDirection: "column", gap: 24 },
          ]}
        >
          <View style={styles.flexGrow}>
            <View style={[styles.flexGrow, styles.VStack]}>
              {parsedChambers?.length === 0 && (
                <View style={{ alignItems: "center" }}>
                  <EmptyState stateData={emptyStateData} />
                </View>
              )}
              <FlatList
                data={parsedChambers}
                renderItem={({ item }) => (
                  <ChamberCard
                    filled={item.filled}
                    capacity={item.capacity}
                    name={item.name}
                  />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[getColor("green")]}
                  />
                }
              />
            </View>
          </View>
          <View style={styles.flexGrow}>
            <View style={[styles.flexGrow, styles.VStack]}>
              <ChamberDetailed
                chamberLoading={chambersLoading}
                stockLoading={stockLoading}
              />
            </View>
          </View>
        </Tabs>
      </View>
            {(chambersLoading || stockLoading) && <OverlayLoader />}
    </View>
</Require>
  );
};

export default ChamberScreen;

const styles = StyleSheet.create({
  grid: {
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  chamberContainer: {
    width: chamberSize,
    height: chamberSize * 1.2,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  chamber: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  chamberOverlay: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingHorizontal: 16,
  },
  flexGrow: {
    flex: 1,
  },
  VStack: {
    flexDirection: "column",
    gap: 12,
  },
  paddingTLR16: {
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
});
