import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import BottomSheet from "@/src/components/ui/BottomSheet";
import PageHeader from "@/src/components/ui/PageHeader";
import Tabs from "@/src/components/ui/Tabs";
import EmptyState from "@/src/components/ui/EmptyState";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import Loader from "@/src/components/ui/Loader";

import { useProduction } from "@/src/hooks/production";
import { getColor } from "@/src/constants/colors";
import { ItemCardData } from "@/src/types";

import noBatchImage from "@/src/assets/images/illustrations/no-batch.png";
import noBatchImageProduction from "@/src/assets/images/illustrations/no-production-batch.png";
import ProductionLane from "@/src/components/icons/common/ProductionLane";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";

import RefreshableContent from "@/src/components/ui/RefreshableContent";
import { mapProductionToItemCards } from "@/src/utils/mappers/mappers.utils";
import ItemCardList from "@/src/components/ui/ItemCardList";
import { useLanes } from "@/src/hooks/useFetchData";

const ProductionScreen = () => {
  const { goTo } = useAppNavigation();

  const { data: productionData, isFetching, refetch } = useProduction();
const { data: lanes } = useLanes();

const productionCards: ItemCardData[] = useMemo(() => {
  if (!productionData || !lanes) return [];
  return mapProductionToItemCards(productionData, lanes);
}, [productionData, lanes]);

  const pendingAndQueue = productionCards.filter(
    (c) => c.mode === "default" || c.isActive
  );

  const inProgressCards = productionCards.filter(
    (c) => c.mode === "production"
  );

  const completedCards = productionCards.filter(
    (c) => c.mode === "production-completed"
  );

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
              isEmpty={pendingAndQueue.length === 0}
              refreshing={isFetching}
              onRefresh={refetch}
              emptyComponent={
                <View style={styles.emptyStateWrapper}>
                  <EmptyState
                    image={noBatchImage}
                    stateData={{
                      title: "No active batches",
                      description: "No active batches right now. Enjoy the calm!",
                    }}
                  />
                </View>
              }
            >
              <ItemCardList items={pendingAndQueue} />
            </RefreshableContent>
          </View>


          {/* ---------------- PRODUCTION TAB ---------------- */}
          <View style={styles.flexGrow}>
            {renderSearch()}
            <RefreshableContent
              isEmpty={inProgressCards.length === 0}
              refreshing={isFetching}
              onRefresh={refetch}
              emptyComponent={
                <View style={styles.emptyStateWrapper}>
                  <EmptyState
                    image={noBatchImageProduction}
                    stateData={{
                      title: "No production running",
                      description: "Start a batch to see live production here.",
                    }}
                  />
                </View>
              }
            >
              <ItemCardList items={inProgressCards} />
            </RefreshableContent>
          </View>

          {/* ---------------- COMPLETED TAB ---------------- */}
          <View style={styles.flexGrow}>
            {renderSearch()}
            <RefreshableContent
              isEmpty={completedCards.length === 0}
              refreshing={isFetching}
              onRefresh={refetch}
              emptyComponent={
                <View style={styles.emptyStateWrapper}>
                  <EmptyState
                    image={noBatchImageProduction}
                    stateData={{
                      title: "No completed batches",
                      description: "Completed batches will appear here.",
                    }}
                  />
                </View>
              }
            >
              <ItemCardList items={completedCards} />
            </RefreshableContent>
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