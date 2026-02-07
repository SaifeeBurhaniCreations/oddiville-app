import React, { useCallback } from 'react';
import { FlatList, View } from 'react-native';
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
      contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      {...listProps}
    />
  );
};



export default ItemCardList;
