import React, { useState, useCallback, useMemo } from "react";
import { FlatList, Text, View, RefreshControl } from "react-native";
import Loader from "../Loader";
import { OrderProps } from "@/src/types";
import SupervisorCard from "./SupervisorCard";
import { getStableBackground } from "@/src/utils/arrayUtils";

type SupervisorFlatlistProps = {
  data?: OrderProps[]; 
  pages?: OrderProps[][]; 
  fetchNext?: () => void;
  hasNext?: boolean;
  isFetchingNext?: boolean;
  isEdit?: boolean;
  reFetchers?: Array<() => Promise<any> | void>;
};

const SupervisorFlatlist = ({
  data,
  pages,
  fetchNext,
  hasNext,
  isFetchingNext,
  isEdit,
  reFetchers = [],
}: SupervisorFlatlistProps) => {
  const orders = useMemo(
    () => [...(pages ? pages.flat() : data ?? [])],
    [pages, data]
  );

  const [refreshing, setRefreshing] = useState(false);

  const renderActivityCard = useCallback(
    ({ item }: { item: OrderProps }) => {
      const randomBg = getStableBackground(item.id!);
      return <SupervisorCard order={item} color="green" bgSvg={randomBg} isEdit={isEdit} />;
    },
    [isEdit]
  );

  const handleEndReached = useCallback(() => {
    if (refreshing) return;
    if (fetchNext && hasNext && !isFetchingNext) {
      fetchNext();
    }
  }, [fetchNext, hasNext, isFetchingNext, refreshing]);

  const onRefresh = useCallback(async () => {
    if (!reFetchers || reFetchers.length === 0) return;

    try {
      setRefreshing(true);

      const promises = reFetchers.map((fn) => {
        try {
          return Promise.resolve(fn());
        } catch (e) {
          return Promise.reject(e);
        }
      });

      await Promise.all(promises);
    } catch (err) {
      console.warn("Refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  }, [reFetchers]);

  return (
    <FlatList
      data={orders}
      extraData={orders.length}
      renderItem={renderActivityCard}
      keyExtractor={(item) => String(item.id)}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text>No Activity Found</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNext ? (
          <Loader style={{ marginTop: 8 }} />
        ) : !hasNext ? (
          <Text style={{ textAlign: "center", marginVertical: 16 }}>No more orders</Text>
        ) : null
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    />
  );
};

export default SupervisorFlatlist;