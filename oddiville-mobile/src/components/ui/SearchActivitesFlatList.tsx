import React, { useState, useCallback, useEffect, useRef } from "react";
import { FlatList, View, StyleSheet, RefreshControl } from "react-native";
import Loader from "./Loader";
import { getStableBackground } from "@/src/utils/arrayUtils";
import { B2 } from "../typography/Typography";
import noBatchImage from "@/src/assets/images/illustrations/no-batch.png";
import EmptyState from "./EmptyState";
import { getEmptyStateData } from "@/src/utils/common";
import { getColor } from "@/src/constants/colors";

import type { SearchActivityProps } from "@/src/types";
import SearchActivityCard from "./SearchActivityCard";

type SeparatorItem = { kind: "separator"; id: string; title: string; key: string };
type ActivityItem = { kind: "activity"; activity: SearchActivityProps; key: string };
export type SearchActivityItem = SeparatorItem | ActivityItem;

type RefetchFn<TData = unknown, TError = unknown> = () => Promise<any>;

interface SearchActivityFlatListProps {
  activities: SearchActivityItem[] | SearchActivityProps[];
  isVirtualised?: boolean;
  onPress?: (id: string, type: string) => void;
  fetchMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  refetch?: RefetchFn;
  listKey?: string;
  style?: any;
  extraData?: any;
}

const SeparatorRow = ({ title }: { title: string }) => (
  <View style={sepStyles.container}>
    <B2 style={sepStyles.title}>{title}</B2>
  </View>
);

const SearchActivitesFlatList = ({
  activities: inputActivities,
  isVirtualised = false,
  onPress,
  fetchMore,
  hasMore,
  isLoading: externalLoading,
  listKey,
  refetch,
  style,
  extraData,
  ...rest
}: SearchActivityFlatListProps) => {
  const normalizedItems: SearchActivityItem[] = (Array.isArray(inputActivities) && inputActivities.length > 0 && (inputActivities[0] as any).kind)
    ? (inputActivities as SearchActivityItem[])
    :
      (inputActivities as SearchActivityProps[]).map((a) => ({ kind: "activity" as const, activity: a, key: "flat" }));

  const [items, setItems] = useState<SearchActivityItem[]>(normalizedItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const bgMapRef = useRef<Map<string, ReturnType<typeof getStableBackground>>>(new Map());

  useEffect(() => {
    setItems(normalizedItems);
  }, [inputActivities]);

    const safeOnPress = useCallback((id: string, identifier: string) => {
      if (typeof onPress === "function") {
        onPress(id, identifier);
      }
    }, [onPress]);

    
  const render = useCallback(
    ({ item, index }: { item: ActivityItem; index: number }) => {
      const key = String(item.activity.id ?? index);

      let randomBg = bgMapRef.current.get(key);
      if (!randomBg) {
        randomBg = getStableBackground(key);
        bgMapRef.current.set(key, randomBg);
      }
      return (
        <SearchActivityCard
          onPress={safeOnPress}
          activity={item.activity}
          color="green"
          bgSvg={randomBg}
        />
      );
    },
    [onPress]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SearchActivityItem; index: number }) => {
      if (item.kind === "separator") {
        return <SeparatorRow title={item.title} />;
      }
      return (
        <View>
          {render({ item: item as ActivityItem, index })}
        </View>
      );
    },
    [render]
  );

  const keyExtractor = useCallback((item: SearchActivityItem, index: number) => {
    if (item.kind === "separator") return `sep-${item.id}`;
    return `act-${(item.activity && item.activity.id) ?? index}`;
  }, []);

  const loadMoreData = useCallback(async () => {
    if (fetchMore) {
      if (hasMore && !externalLoading) fetchMore();
    } else {
      if (!hasMoreData || isLoading) return;
      setIsLoading(true);
    }
  }, [fetchMore, hasMore, externalLoading, hasMoreData, isLoading]);

  const loading = externalLoading ?? isLoading;
  const noMore = fetchMore ? !hasMore : !hasMoreData;

  const emptyStateData = getEmptyStateData(listKey ?? "no activities");

  if (!isVirtualised) {
    return (
      <View style={[{ flex: 1 }, style]}>
        {items?.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <EmptyState image={noBatchImage} stateData={emptyStateData} />
          </View>
        ) : (
          <View style={{ paddingBottom: 100 }}>
            {items.map((item, index) => (
              <View key={keyExtractor(item as SearchActivityItem, index)}>
                {item.kind === "separator" ? (
                  <SeparatorRow title={item.title} />
                ) : (
                  <>
                    {render({ item: item as ActivityItem, index })}
                  </>
                )}
                {index < items?.length - 1 && <View style={{ height: 8 }} />}
              </View>
            ))}
            {loading ? (
              <Loader style={{ marginTop: 8 }} />
            ) : (
              noMore && (
                <B2 style={{ textAlign: "center", marginVertical: 16 }}>
                  No more activities
                </B2>
              )
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={{ flex: 1, ...(style ?? {}) }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <EmptyState image={noBatchImage} stateData={emptyStateData} />
        </View>
      }
      ListFooterComponent={loading ? <Loader style={{ marginTop: 8 }} /> : noMore ? <B2 style={{ textAlign: "center", marginVertical: 16 }}>No more activities</B2> : null}
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refetch} colors={[getColor("green")]} />
      }
      {...rest}
    />
  );
};

const sepStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    backgroundColor: "transparent",
    marginTop: 16
  },
  title: {
    textTransform: "uppercase",
  },
});

export default SearchActivitesFlatList;