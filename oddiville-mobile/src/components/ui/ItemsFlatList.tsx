import React, { useState, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import Loader from './Loader';
import { ItemCardProps, ItemsFlatListProps } from "@/src/types";
import ItemCard from './ItemCard';
import { getRandomBackground } from '@/src/utils/arrayUtils';

const ItemsFlatList = ({
  items,
  refreshing,
  onRefresh,
  isProduction = false,
  isPacking = false,
  onActionPress,
  isProductionCompleted = false,
}: ItemsFlatListProps) => {

  const renderWarehouseItemCard = useCallback(
    ({ item }: { item: ItemCardProps }) => {
      const randomBg = getRandomBackground();
      return (
        <ItemCard
          {...item}
          isProduction={isProduction}
          isPacking={isPacking}
          onActionPress={onActionPress}
          backgroundIcon={randomBg}
          isProductionCompleted={isProductionCompleted}
        />
      );
    },
    [isProduction, isPacking, isProductionCompleted]
  );

  return (
    <FlatList
      data={items}   // ✅ DIRECTLY USE PROPS
      renderItem={renderWarehouseItemCard}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
};


export default ItemsFlatList;
