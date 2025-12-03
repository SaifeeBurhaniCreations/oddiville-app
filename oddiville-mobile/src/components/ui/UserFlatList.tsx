import { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import Loader from './Loader';
import { UserProps } from "@/src/types";
import UserCard from './UserCard';
import { RefreshControl } from 'react-native-gesture-handler';
import { getColor } from '@/src/constants/colors';
import { QueryObserverResult } from '@tanstack/query-core';

type RefetchFn<TData = unknown, TError = unknown> = () => Promise<
  QueryObserverResult<TData, TError>
>;

const UserFlatList = ({
  users,
  fetchMore,
  hasMore,
  isLoading,
  disabled,
  refetch,
  onPress,
  onActionPress,
}: {
  users: UserProps[];
  fetchMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  disabled?: boolean;
  refetch: RefetchFn<any, Error>;
  onPress?: () => void;
  onActionPress?: (username: string) => void;
}) => {
  const renderItem = useCallback(({ item }: { item: UserProps }) => {
    return <UserCard {...item} color="green" tempDisabled={disabled} onPress={onPress} onActionPress={onActionPress} />;
  }, []);

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={refetch}
          colors={[getColor("green")]}
        />
      }
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text>No Users Found</Text>
        </View>
      }
      ListFooterComponent={
        isLoading ? (
          <Loader />
        ) : !hasMore ? (
          <Text style={{ textAlign: "center", marginVertical: 16 }}>
            No more users
          </Text>
        ) : null
      }
      onEndReached={hasMore ? fetchMore : undefined}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
    />
  );
};


export default UserFlatList;
