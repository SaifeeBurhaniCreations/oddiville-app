import React, { useMemo, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";

import BottomSheet from "@/src/components/ui/BottomSheet";
import PageHeader from "@/src/components/ui/PageHeader";
import Tabs from "@/src/components/ui/Tabs";
import ItemsFlatList from "@/src/components/ui/ItemsFlatList";
import EmptyState from "@/src/components/ui/EmptyState";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import Loader from "@/src/components/ui/Loader";

import { useProduction } from "@/src/hooks/production";
import { useLanes } from "@/src/hooks/useFetchData";
import { getColor } from "@/src/constants/colors";
import { ItemCardProps } from "@/src/types";

import noBatchImage from "@/src/assets/images/illustrations/no-batch.png";
import noBatchImageProduction from "@/src/assets/images/illustrations/no-production-batch.png";
import ProductionLane from "@/src/components/icons/common/ProductionLane";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";

import RefreshableContent from "@/src/components/ui/RefreshableContent";

const ProductionScreen = () => {
  const { goTo } = useAppNavigation();
  const { height: screenHeight } = useWindowDimensions();

  const { data: productionData, isFetching, refetch } = useProduction();
  const { data: lanes } = useLanes();

  const getLaneNameById = (id: string) =>
    lanes?.find((l: any) => l.id === id)?.name;

  const { inQueue, inPending, inProgress, inCompleted } = useMemo(() => {
    const buckets = {
      inQueue: [] as ItemCardProps[],
      inPending: [] as ItemCardProps[],
      inProgress: [] as ItemCardProps[],
      inCompleted: [] as ItemCardProps[],
    };

    productionData?.forEach((item: any) => {
      const ratio =
        item.quantity > 0
          ? ((item.recovery / item.quantity) * 100).toFixed(2)
          : "0.00";

      const formatted: ItemCardProps = {
        id: item.id,
        name: item.product_name,
        weight: `${item.status === "completed" ? item.recovery : item.quantity} ${
          item.unit || "kg"
        } ${item.status === "completed" ? `(${ratio}%)` : ""}`,
        rating: item.rating || "0",
        isActive: item.status === "in-queue",
        lane:
          item.status === "completed"
            ? null
            : item.lane
            ? getLaneNameById(item.lane)
            : null,
        actionLabel:
          item.status === "in-queue" ? "Start production" : undefined,
      };

      if (item.status === "in-queue") buckets.inQueue.push(formatted);
      else if (item.status === "pending") buckets.inPending.push(formatted);
      else if (item.status === "in-progress")
        buckets.inProgress.push(formatted);
      else if (item.status === "completed")
        buckets.inCompleted.push(formatted);
    });

    return buckets;
  }, [productionData, lanes]);

  const renderSearch = () => (
    <View style={styles.searchinputWrapper}>
      <SearchWithFilter
        value=""
        onChangeText={() => {}}
        placeholder="Search product"
        onFilterPress={() => goTo("lane")}
        icon={ProductionLane}
      />
    </View>
  );

  return (
    <View style={styles.pageContainer}>
      <PageHeader page="Production" />

      <View style={styles.wrapper}>
        <Tabs tabTitles={["Pending", "Production", "Completed"]} color="green">
          {/* ---------------- PENDING TAB ---------------- */}
          <View style={styles.flexGrow}>
            {renderSearch()}
            <RefreshableContent
              isEmpty={inPending.length === 0 && inQueue.length === 0}
              refreshing={isFetching}
              onRefresh={refetch}
              emptyComponent={
                  <View style={styles.emptyStateWrapper}>
                <EmptyState
                style={{marginTop: -(screenHeight/ 7)}}
                  image={noBatchImage}
                  stateData={{
                    title: "No active batches",
                    description: "No active batches right now. Enjoy the calm!",
                  }}
                />
                </View>
              }
              listComponent={
                <ItemsFlatList items={[...inPending, ...inQueue]} />
              }
            />
          </View>

          {/* ---------------- PRODUCTION TAB ---------------- */}
          <View style={styles.flexGrow}>
            {renderSearch()}
            <RefreshableContent
              isEmpty={inProgress.length === 0}
              refreshing={isFetching}
              onRefresh={refetch}
              emptyComponent={
                  <View style={styles.emptyStateWrapper}>
                <EmptyState
                style={{marginTop: -(screenHeight/ 7)}}
                  image={noBatchImageProduction}
                  stateData={{
                    title: "No production running",
                    description: "Start a batch to see live production here.",
                  }}
                />
                </View>
              }
              listComponent={
                <ItemsFlatList isProduction items={inProgress} /> }
            />
          </View>

          {/* ---------------- COMPLETED TAB ---------------- */}
          <View style={styles.flexGrow}>
            {renderSearch()}
            <RefreshableContent
              isEmpty={inCompleted.length === 0}
              refreshing={isFetching}
              onRefresh={refetch}
              emptyComponent={
                  <View style={styles.emptyStateWrapper}>
                <EmptyState
                style={{marginTop: -(screenHeight/ 7)}}
                  image={noBatchImageProduction}
                  stateData={{
                    title: "No completed batches",
                    description: "Completed batches will appear here.",
                  }}
                />
                </View>
              }
              listComponent={
                <ItemsFlatList
                  isProductionCompleted
                  items={inCompleted}
                />
              }
            />
          </View>
        </Tabs>
      </View>

      <BottomSheet color="green" />

      {isFetching && (
        <View style={styles.overlay}>
          <Loader />
        </View>
      )}
    </View>
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
    padding: 16,
  },
  flexGrow: {
    flex: 1,
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
  searchinputWrapper: {
    height: 44,
    marginTop: 24,
    marginBottom: 24,
  },
  emptyStateWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});

export default ProductionScreen;