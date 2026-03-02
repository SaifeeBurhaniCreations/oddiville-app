// 1. React and React Native core
import { useState, useMemo, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";

// 2. Third-party dependencies
import { formatDate } from "date-fns";

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import Tabs from "@/src/components/ui/Tabs";
import BottomSheet from "@/src/components/ui/BottomSheet";
import SearchInput from "@/src/components/ui/SearchInput";
import SupervisorFlatlist from "@/src/components/ui/Supervisor/SupervisorFlatlist";
import Loader from "@/src/components/ui/Loader";
import DatabaseIcon from "@/src/components/icons/page/DatabaseIcon";

// 4. Project hooks
import { useAdmin } from "@/src/hooks/useAdmin";
import { CompletedOrdersPage, useRawMaterialOrders } from "@/src/hooks/useRawMaterialOrders";
import { useAllVendors } from "@/src/hooks/vendor";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";

// 6. Types
import { OrderProps, RawMaterialOrderProps } from "@/src/types";

// 7. Schemas
import { BottomSheetSchemaKey } from "@/src/schemas/BottomSheetSchema";
import EmptyState, { EmptyStateStyles } from "@/src/components/ui/EmptyState";
import { getEmptyStateData } from "@/src/utils/common";
import { InfiniteData } from "@tanstack/query-core";
import Button from "@/src/components/ui/Buttons/Button";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { H3 } from "@/src/components/typography/Typography";
import { RefreshControl } from "react-native-gesture-handler";
import OverlayLoader from "@/src/components/ui/OverlayLoader";

// 8. Assets
// No items of this type

const PurchaseScreen = () => {
  const { goTo } = useAppNavigation();
  const { height: screenHeight } = useWindowDimensions()

  const [pendingSearch, setPendingSearch] = useState("");
  const [completedSearch, setCompletedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useAdmin();

  const {
    data: pendingData = [],
    isFetching: pendingLoading,
    refetch: refetchRM,
  } = useRawMaterialOrders("pending");

  const { data: vendorData = [], isFetching: vendorLoading, refetch: refetchVendor } = useAllVendors();

  const formatOrder = useCallback(
    (order: RawMaterialOrderProps): OrderProps => {
      const vendor = vendorData?.find((v) => v.name === order.vendor);
      return {
        id: order.id,
        title: order.raw_material_name,
        name: `${order.vendor} (${vendor?.alias ?? ""})`,
        details: [
          {
            name: "Order date",
            value:
              order.order_date &&
                !isNaN(new Date(order.order_date as string).getTime())
                ? formatDate(
                  new Date(order.order_date as string),
                  "MMM d, yyyy"
                )
                : "--",
          },
          {
            name: order.arrival_date ? "Arrival date" : "Est. Arrival date",
            value:
              (order.arrival_date &&
                !isNaN(new Date(order.arrival_date as string).getTime())
                ? formatDate(
                  new Date(order.arrival_date as string),
                  "MMM d, yyyy"
                )
                : undefined) ??
              (order.est_arrival_date &&
                !isNaN(new Date(order.est_arrival_date as string).getTime())
                ? formatDate(
                  new Date(order.est_arrival_date as string),
                  "MMM d, yyyy"
                )
                : "--"),
          },
        ],
        address: vendor?.address ?? "N/A",
        helperDetails: [
          {
            name: "Order quantity",
            value: `${order.quantity_ordered ?? "--"} ${order.unit ?? ""}`,
            iconKey: 'database',
          },
        ],
        href: "raw-material-receive",
        identifier: "order-ready",
      };
    },
    [vendorData]
  );

  const completedQuery = useRawMaterialOrders("completed");

  const {
    data: completedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: completedFetching,
    isLoading: completedInitialLoading,
    refetch: refetchCompleted,
  } = completedQuery;


  const completedItems: RawMaterialOrderProps[] =
    (
      completedData as InfiniteData<CompletedOrdersPage> | undefined
    )?.pages?.flatMap((p) => p.data ?? []) ?? [];

  const completedUnique = useMemo(
    () => Array.from(new Map(completedItems.map((i) => [i.id, i])).values()),
    [completedItems]
  );

  const pendingOrders: OrderProps[] = useMemo(
    () => pendingData.map(formatOrder),
    [pendingData, formatOrder]
  );

  const completedOrders: OrderProps[] = useMemo(
    () => completedUnique.map(formatOrder),
    [completedUnique, formatOrder]
  );

  useFocusEffect(
    useCallback(() => {
      refetchRM();
      refetchCompleted();
      refetchVendor();
    }, [])
  );


  const emptyStateData = getEmptyStateData("no-order-pending");

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Purchase"} />
      <View style={styles.wrapper}>
        <Tabs
          tabTitles={["Ordered", "Received"]}
          color="green"
          style={styles.flexGrow}
        >
          <View style={styles.flexGrow}>
            <View
              style={[
                styles.HStack,
                styles.justifyBetween,
                styles.alignCenter,
                { paddingTop: 16 },
              ]}
            >
              <H3>Order raw material</H3>
              <Button
                variant="outline"
                size="md"
                onPress={() => goTo("raw-material-order")}
              >
                Add material
              </Button>
            </View>
            <View style={styles.searchinputWrapper}>
              <SearchInput
                style={{ borderWidth: 1 }}
                value={pendingSearch}
                onChangeText={setPendingSearch}
                returnKeyType="search"
                placeholder="Search by raw material & vendor name"
              />
            </View>
            {pendingOrders?.length === 0 && (
              <View style={{ alignItems: "center" }}>
                <ScrollView contentContainerStyle={{ alignItems: "center", flex: 1 }} refreshControl={<RefreshControl refreshing={pendingLoading} onRefresh={() => {
                  refetchRM()
                  refetchVendor()
                }} />}>
                  <View style={EmptyStateStyles.center}>
                    <EmptyState stateData={emptyStateData} compact />
                  </View>
                </ScrollView>
              </View>
            )}
            <SupervisorFlatlist data={pendingOrders} reFetchers={[refetchRM, refetchVendor]} />
          </View>
          <View style={styles.flexGrow}>
            <View
              style={[
                styles.HStack,
                styles.justifyBetween,
                styles.alignCenter,
                { paddingTop: 16 },
              ]}
            >
              <H3>Order raw material</H3>
              <Button
                variant="outline"
                size="md"
                onPress={() => goTo("raw-material-order")}
              >
                Add material
              </Button>
            </View>
            <View style={styles.searchinputWrapper}>
              <SearchInput
                style={{ borderWidth: 1 }}
                value={completedSearch}
                onChangeText={setCompletedSearch}
                returnKeyType="search"
                placeholder="Search by raw material & vendor name"
              />
            </View>
            {completedOrders?.length === 0 && (
              <View style={{ alignItems: "center" }}>
                <ScrollView contentContainerStyle={{ alignItems: "center", flex: 1 }} refreshControl={<RefreshControl refreshing={completedFetching} onRefresh={() => {
                  refetchCompleted()
                  refetchRM()
                }} />}>
                  <View style={EmptyStateStyles.center}>
                    <EmptyState stateData={emptyStateData} compact />
                  </View>

                </ScrollView>
              </View>
            )}
            <SupervisorFlatlist
              data={completedOrders}
              isEdit
              fetchNext={fetchNextPage}
              hasNext={hasNextPage}
              isFetchingNext={isFetchingNextPage}
              reFetchers={[refetchCompleted, refetchRM]}
            />
          </View>
        </Tabs>
      </View>

      <BottomSheet color="green" />
      {(isLoading ||
        pendingLoading ||
        vendorLoading ||
        completedInitialLoading) && <OverlayLoader />}
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
  searchinputWrapper: {
    height: 44,
    marginTop: 24,
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
});

export default PurchaseScreen;