import React, { useState, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import Loader from '../Loader';
import { OrderProps } from "@/src/types";
import SupervisorCard from './SupervisorCard';
import { getRandomBackground } from '@/src/utils/arrayUtils';

type SupervisorFlatlistProps = {
  data?: OrderProps[]; // pending
  pages?: OrderProps[][]; // completed
  fetchNext?: () => void;
  hasNext?: boolean;
  isFetchingNext?: boolean;
  isEdit?: boolean;
};

const SupervisorFlatlist = ({
  data,
  pages,
  fetchNext,
  hasNext,
  isFetchingNext,
  isEdit
}: SupervisorFlatlistProps) => {
  const orders = pages ? pages.flat() : data || [];
  
  const renderActivityCard = useCallback(({ item }: { item: OrderProps }) => {
    const randomBg = getRandomBackground();
    return (
      <SupervisorCard
        order={item}
        color="green"
        bgSvg={randomBg}
        isEdit={isEdit}
      />
    );
  }, []);

  const handleEndReached = () => {
    if (fetchNext && hasNext && !isFetchingNext) {
      fetchNext();
    }
  };

  return (
    <FlatList
      data={orders}
      renderItem={renderActivityCard}
      keyExtractor={(item, index) => `${item.title}-${index}`}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text>No Activity Found</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNext ? (
          <Loader style={{ marginTop: 8 }} />
        ) : !hasNext ? (
          <Text style={{ textAlign: 'center', marginVertical: 16 }}>No more orders</Text>
        ) : null
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
    />
  );
};


export default SupervisorFlatlist;
