import ActivityCard from '@/src/components/ui/ActivityCard';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList, View } from 'react-native';
import Loader from './Loader';
import { ActivityProps } from "@/src/types"
import { getRandomBackground } from '@/src/utils/arrayUtils';
import { B2 } from '../typography/Typography';
import { fetchActivities } from '@/src/services/activities.service';
import { BottomSheetSchemaKey } from '@/src/schemas/BottomSheetSchema';

import noBatchImage from "@/src/assets/images/illustrations/no-batch.png"

import EmptyState from './EmptyState';
import { getEmptyStateData } from '@/src/utils/common';
import { QueryObserverResult } from '@tanstack/query-core';
import { getColor } from '@/src/constants/colors';
import { RefreshControl } from 'react-native-gesture-handler';

type RefetchFn<TData = unknown, TError = unknown> = () => Promise<
  QueryObserverResult<TData, TError>
>;

export interface ActivityFlatList {
  activities: ActivityProps[];
  extraData?: ActivityProps[];
  isVirtualised?: boolean;
  onPress?: (id: string, type: BottomSheetSchemaKey) => void;
  fetchMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  refetch?: RefetchFn;
  listKey?: string;
  style?: any;
}

const ActivitesFlatList = ({
  activities: initialActivities,
  extraData = [],
  isVirtualised = false,
  onPress,
  fetchMore,
  hasMore,
  isLoading: externalLoading,
  listKey,
  refetch,
  style,
  ...rest
}: ActivityFlatList) => {
  const [activities, setActivities] = useState(initialActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [page, setPage] = useState<number>(1);
  const bgMapRef = useRef<Map<string, ReturnType<typeof getRandomBackground>>>(new Map());

  const renderActivityCard = useCallback(
    ({ item, index }: { item: ActivityProps; index: number }) => {
      const key = String(item.id ?? index);

      let randomBg = bgMapRef.current.get(key);
      if (!randomBg) {
        randomBg = getRandomBackground();
        bgMapRef.current.set(key, randomBg);
      }
      return (
        <React.Fragment>
          <ActivityCard
            onPress={onPress!}
            activity={item}
            color="green"
            bgSvg={randomBg}
          />
        </React.Fragment>
      );
    },
    [onPress]
  );

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  const loadMoreData = useCallback(async () => {
    if (fetchMore) {
      if (hasMore && !externalLoading) fetchMore();
    } else {
      if (!hasMoreData || isLoading) return;

      setIsLoading(true);

      try {
        const newActivities = await fetchActivities(page);

        if (!newActivities?.length) {
          setHasMoreData(false);
        } else {
          setActivities((prev) => [...prev, ...newActivities]);
          setPage((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error loading more data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [fetchMore, hasMore, externalLoading, page, isLoading, hasMoreData]);

  const loading = externalLoading ?? isLoading;
  const noMore = fetchMore ? !hasMore : !hasMoreData;

  const renderFooter = () => {
    return null;
    if (loading) return <Loader style={{ marginTop: 8 }} />;
    if (noMore)
      return (
        <B2 style={{ textAlign: "center", marginVertical: 16 }}>
          No more activities
        </B2>
      );
  };

  const emptyStateData = getEmptyStateData(listKey ? listKey : "no activities");

  if (!isVirtualised) {
    return (
      <View style={[{ flex: 1 }, style]}>
        {activities?.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <EmptyState image={noBatchImage} stateData={emptyStateData} />
          </View>
        ) : (
          <View style={{ paddingTop: 16, paddingBottom: 100 }}>
            {activities.map((item, index) => (
              <View key={`${item.title}-${index}`}>
                {renderActivityCard({ item, index })}
                {index < activities?.length - 1 && (
                  <View style={{ height: 16 }} />
                )}
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
      data={activities}
      renderItem={renderActivityCard}
      keyExtractor={(item) => `${item.id}-${item.id}`}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <EmptyState image={noBatchImage} stateData={emptyStateData} />
        </View>
      }
      ListFooterComponent={renderFooter}
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={refetch}
          colors={[getColor("green")]}
        />
      }
      {...rest}
    />
  );
};


export default ActivitesFlatList;
