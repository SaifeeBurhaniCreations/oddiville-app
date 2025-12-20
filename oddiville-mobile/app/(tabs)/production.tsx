// 1. React and React Native core
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

// 2. Third-party dependencies
// No items of this type

// 3. Project components
import BottomSheet from "@/src/components/ui/BottomSheet";
import PageHeader from "@/src/components/ui/PageHeader";
import Tabs from "@/src/components/ui/Tabs";
import ItemsFlatList from "@/src/components/ui/ItemsFlatList";
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
import { ItemCardProps } from "@/src/types";

// 7. Schemas
// No items of this type

// 8. Assets
import noBatchImage from "@/src/assets/images/illustrations/no-batch.png";
import noBatchImageProduction from "@/src/assets/images/illustrations/no-production-batch.png";
import ProductionLane from "@/src/components/icons/common/ProductionLane";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { RefreshControl } from "react-native-gesture-handler";

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

  const { inQueue, inPending, inProgress, inCompleted } = useMemo(() => {
    const inQueue: ItemCardProps[] = [];
    const inPending: ItemCardProps[] = [];
    const inProgress: ItemCardProps[] = [];
    const inCompleted: ItemCardProps[] = [];

    if (!isLoading) {
      console.log("productionData", JSON.stringify(productionData));
      productionData?.forEach((item: any) => {
        const ratio =
          item.quantity > 0
            ? (item.recovery / item.quantity).toFixed(2)
            : "0.00";

        const formattedItem: ItemCardProps = {
          id: item.id,
          name: item.product_name,
          weight: `${item.status === "completed" ? item.recovery : item.quantity} ${item.unit || "kg" } ${item.status === "completed" ? `(${ratio}%)` : ""}`,
          rating: item.rating || "0",
          isActive: false,
          lane: item.status === "completed" ? null : (item?.lane ? getLaneNameById(item?.lane) : null),
        };

        if (item.status === "in-queue") {
          formattedItem.isActive = true;
          formattedItem.actionLabel = "Start production";
          inQueue.push(formattedItem);
        } else if (item.status === "pending") {
          inPending.push(formattedItem);
        } else if (item.status === "in-progress") {
          inProgress.push(formattedItem);
        }else if (item.status === "completed") {
          inCompleted.push(formattedItem);
        }
      });
    }

    return { inQueue, inPending, inProgress, inCompleted };
  }, [productionData]);

  const handleLanePress = () => {
    goTo("lane");
  };
  const emptyStateData = getEmptyStateData("production");

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Production"} />
      <View style={styles.wrapper}>
        <Tabs
          tabTitles={["Pending", "Production", "Completed"]}
          color="green"
          style={styles.flexGrow}
        >
          <FlatList
            data={inPending?.concat(inQueue) ?? []}
            contentContainerStyle={{ flexGrow: 1 }}
            renderItem={({ item }) => (
              <View style={styles.flexGrow}>
                <View style={styles.searchinputWrapper}>
                  <SearchWithFilter
                    value=""
                    onChangeText={() => {}}
                    placeholder="Search product"
                    onFilterPress={handleLanePress}
                    icon={ProductionLane}
                  />
                </View>

                <ItemsFlatList items={inPending?.concat(inQueue) ?? []} />
              </View>
            )}
            ListEmptyComponent={
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
            keyExtractor={(_, index) => index.toString()}
            refreshControl={
              <RefreshControl
                refreshing={productionLoading}
                onRefresh={productionRefetch}
              />
            }
          />
          <FlatList
            data={inProgress ?? []}
            contentContainerStyle={{ flexGrow: 1 }}
            renderItem={({ item }) => (
              <View style={styles.flexGrow}>
                <View style={styles.searchinputWrapper}>
                  <SearchWithFilter
                    value=""
                    onChangeText={() => {}}
                    placeholder={"Search product"}
                    onFilterPress={handleLanePress}
                    icon={ProductionLane}
                  />
                </View>
                <ItemsFlatList isProduction={true} items={inProgress} />
              </View>
            )}
            ListEmptyComponent={
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
            keyExtractor={(_, index) => index.toString()}
            refreshControl={
              <RefreshControl
                refreshing={productionLoading}
                onRefresh={productionRefetch}
              />
            }
          />
          <FlatList
            data={inCompleted ?? []}
            contentContainerStyle={{ flexGrow: 1 }}
            renderItem={({ item }) => (
              <View style={styles.flexGrow}>
                <View style={styles.searchinputWrapper}>
                  <SearchWithFilter
                    value=""
                    onChangeText={() => {}}
                    placeholder={"Search product"}
                    onFilterPress={handleLanePress}
                    icon={ProductionLane}
                  />
                </View>
                <ItemsFlatList items={inCompleted} isProductionCompleted={true} />
              </View>
            )}
            ListEmptyComponent={
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
            keyExtractor={(_, index) => index.toString()}
            refreshControl={
              <RefreshControl
                refreshing={productionLoading}
                onRefresh={productionRefetch}
              />
            }
          />

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
                  placeholder={"Search product"}
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