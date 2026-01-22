import React, { useState, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import Loader from './Loader';
import { ItemCardData, ItemCardListProps } from "@/src/types";
import ItemCard from './ItemCard';
import { getStableBackground } from '@/src/utils/arrayUtils';

const ItemCardList = ({
  items,
  onActionPress,
  ...listProps
}: ItemCardListProps) => {

  const renderItem = useCallback(
    ({ item }: { item: ItemCardData }) => (
      <ItemCard
        {...item}
        backgroundIcon={getStableBackground(item.id ?? item.name)}
        onActionPress={onActionPress}
      />
    ),
    [onActionPress]
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.id)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
      {...listProps}
    />
  );
};



export default ItemCardList;
