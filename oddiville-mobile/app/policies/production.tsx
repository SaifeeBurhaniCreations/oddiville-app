// 1. React and React Native core
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

// 2. Third-party dependencies
// No items of this type

// 3. Project components
import BottomSheet from "@/src/components/ui/BottomSheet";
import PageHeader from "@/src/components/ui/PageHeader";
import Tabs from "@/src/components/ui/Tabs";
import ItemsFlatList from "@/src/components/ui/ItemCardList";
import EmptyState from "@/src/components/ui/EmptyState";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import SearchInput from "@/src/components/ui/SearchInput";
import Loader from "@/src/components/ui/Loader";

// 4. Project hooks
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useProduction } from "@/src/hooks/production";
import { useLanes } from "@/src/hooks/useFetchData";

// 5. Project constants/utilities
import { getEmptyStateData } from "@/src/utils/common";
import { getColor } from "@/src/constants/colors";

// 6. Types
import { ItemCardData } from "@/src/types";

// 7. Schemas
// No items of this type

// 8. Assets
import noBatchImage from "@/src/assets/images/illustrations/no-batch.png";
import noBatchImageProduction from "@/src/assets/images/illustrations/no-production-batch.png";
import ProductionLane from "@/src/components/icons/common/ProductionLane";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { RefreshControl } from "react-native-gesture-handler";
import { mapProductionToItemCards } from "@/src/utils/mappers/mappers.utils";
import RefreshableContent from "@/src/components/ui/RefreshableContent";
import ItemCardList from "@/src/components/ui/ItemCardList";

const ProductionScreen = () => {
  const { goTo } = useAppNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const {
    data: productionData,
    isFetching: productionLoading,
    refetch: productionRefetch,
  } = useProduction();

  const { data: lanes, isFetching: laneLoading } = useLanes();
  function getLaneNameById(id: string) {
    if (!laneLoading) {
      return lanes?.find((lane: any) => lane.id === id)?.name;
    }
  }
  const productionCards: ItemCardData[] = useMemo(() => {
    return productionData ? mapProductionToItemCards(productionData) : [];
  }, [productionData]);

  const pendingCards = productionCards.filter((c) => c.mode === "default");

  const inQueueCards = productionCards.filter((c) => c.isActive);

  const inProgressCards = productionCards.filter(
    (c) => c.mode === "production",
  );

  const completedCards = productionCards.filter(
    (c) => c.mode === "production-completed",
  );

  const handleLanePress = () => {
    goTo("lane");
  };
  const emptyStateData = getEmptyStateData("production");

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Production"} />
      <View style={styles.wrapper}>
        <Tabs
          tabTitles={["Pending", "Production"]}
          color="green"
          style={styles.flexGrow}
        >
          <RefreshableContent
            isEmpty={pendingCards.length === 0 && inQueueCards.length === 0}
            refreshing={productionLoading}
            onRefresh={productionRefetch}
            emptyComponent={
              <View
                style={[
                  styles.flexGrow,
                  { justifyContent: "center", alignItems: "center", flex: 1 },
                ]}
              >
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
            <View style={styles.flexGrow}>
              <View style={styles.searchinputWrapper}>
                <SearchWithFilter
                  value=""
                  onChangeText={() => { }}
                  placeholder={"Search by material name"}
                  onFilterPress={handleLanePress}
                  icon={ProductionLane}
                />
              </View>
              <ItemCardList items={[...pendingCards, ...inQueueCards]} />
            </View>
          </RefreshableContent>

          <RefreshableContent
            isEmpty={inProgressCards.length === 0}
            refreshing={productionLoading}
            onRefresh={productionRefetch}
            emptyComponent={
              <View
                style={[
                  styles.flexGrow,
                  {
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <EmptyState
                  image={noBatchImageProduction}
                  stateData={emptyStateData}
                />
              </View>
            }
          >
            <View style={styles.flexGrow}>
              <View style={styles.searchinputWrapper}>
                <SearchWithFilter
                  value=""
                  onChangeText={() => { }}
                  placeholder={"Search by material name"}
                  onFilterPress={handleLanePress}
                  icon={ProductionLane}
                />
              </View>
              <ItemCardList items={inProgressCards} />
            </View>
          </RefreshableContent>


          {/* {inProgress?.length === 0 ? (
            <View style={[styles.flexGrow, { flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
              <EmptyState image={noBatchImageProduction} stateData={emptyStateData} />
            </View>
          ) : (
            <View style={styles.flexGrow}>
              <View style={styles.searchinputWrapper}>
                <SearchWithFilter
                  value=''
                  onChangeText={() => { }}
                  placeholder={"Search by material name"}
                  onFilterPress={handleLanePress}
                  icon={ProductionLane}
                />
              </View>
              <ItemsFlatList isProduction={true} items={inProgress} />
            </View>

          )} */}
        </Tabs>
      </View>
      <BottomSheet color="green" />
      {(isLoading || productionLoading || laneLoading) && (
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
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
});

export default ProductionScreen;
