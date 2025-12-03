// 1. React and React Native core
import { useState, useMemo, useCallback } from "react";

import { StyleSheet, View } from 'react-native';

// 2. Third-party dependencies
import { formatDate } from 'date-fns';

// 3. Project components
import PageHeader from '@/src/components/ui/PageHeader';
import Tabs from '@/src/components/ui/Tabs';
import BottomSheet from '@/src/components/ui/BottomSheet';
import SearchInput from '@/src/components/ui/SearchInput';
import SupervisorFlatlist from '@/src/components/ui/Supervisor/SupervisorFlatlist';
import Loader from '@/src/components/ui/Loader';
import DatabaseIcon from '@/src/components/icons/page/DatabaseIcon';

// 4. Project hooks
import { useAdmin } from '@/src/hooks/useAdmin';
import { useRawMaterialOrders } from '@/src/hooks/rawMaterialOrders';
import { CompletedOrdersPage, useCompletedRawMaterialOrders } from '@/src/hooks/useCompletedRawMaterialOrders';
import { useAllVendors } from '@/src/hooks/vendor';

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';

// 6. Types
import { OrderProps, RawMaterialOrderProps } from '@/src/types';

// 7. Schemas
import { BottomSheetSchemaKey } from '@/src/schemas/BottomSheetSchema';
import EmptyState from '@/src/components/ui/EmptyState';
import { getEmptyStateData } from '@/src/utils/common';
import { InfiniteData } from "@tanstack/query-core";

// 8. Assets 
// No items of this type

const SupervisorRawMaterialScreen = () => {
const [pendingSearch, setPendingSearch] = useState("");
const [completedSearch, setCompletedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useAdmin();

  const { data: pendingData = [], isFetching: pendingLoading } = useRawMaterialOrders();
  const { data: vendorData = [], isFetching: vendorLoading } = useAllVendors();

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
              ? formatDate(new Date(order.order_date as string), "MMM d, yyyy")
              : "--",
          icon: null,
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
          icon: null,
        },
      ],
      address: vendor?.address ?? "N/A",
      helperDetails: [
        {
          name: "Order quantity",
          value: `${order.quantity_ordered ?? "--"} ${order.unit ?? ""}`,
          icon: <DatabaseIcon size={16} color={getColor("green", 700)} />,
        },
      ],
      href: "supervisor-rm-details",
      identifier: "order-ready",
    };
  },
  [vendorData]
);

const {
    data: completedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: completedFetching,
    isLoading: completedInitialLoading,
  } = useCompletedRawMaterialOrders();

const completedItems: RawMaterialOrderProps[] =
  (
    completedData as InfiniteData<CompletedOrdersPage> | undefined
  )?.pages.flatMap((p) => p.data) ?? [];

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


  // const pendingOrders = useMemo(() => pendingData?.map(formatOrder), [pendingData, vendorData]);
  //   const completedOrders = useMemo(
  // // @ts-ignore
  //     () => completedData?.pages?.flat().map(formatOrder) ?? [],
  //     [completedData, vendorData]
  //   );

  const emptyStateData = getEmptyStateData("no-order-pending");


  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Raw Material"} />
      <View style={styles.wrapper}>
        <Tabs
          tabTitles={["Pending", "Completed"]}
          color="green"
          style={styles.flexGrow}
        >
          <View style={styles.flexGrow}>
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
                <EmptyState stateData={emptyStateData} />
              </View>
            )}
            <SupervisorFlatlist data={pendingOrders} />
          </View>
          <View style={styles.flexGrow}>
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
                <EmptyState stateData={emptyStateData} />
              </View>
            )}
            <SupervisorFlatlist
              data={completedOrders}
              isEdit
              fetchNext={fetchNextPage}
              hasNext={hasNextPage}
              isFetchingNext={isFetchingNextPage}
            />
          </View>
        </Tabs>
      </View>

      <BottomSheet color="green" />

      {(isLoading ||
        pendingLoading ||
        vendorLoading ||
        completedInitialLoading) && (
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
    backgroundColor: getColor('green', 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor('light', 200),
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
    backgroundColor: getColor('green', 500, 0.05),
    zIndex: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SupervisorRawMaterialScreen;