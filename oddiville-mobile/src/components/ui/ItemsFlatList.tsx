import React, { useState, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import Loader from './Loader';
import { ItemCardProps, ItemsFlatListProps } from "@/src/types";
import ItemCard from './ItemCard';
import { getRandomBackground } from '@/src/utils/arrayUtils';

const ItemsFlatList = ({ items: initialItems, isProduction = false, onActionPress, isProductionCompleted = false }: ItemsFlatListProps) => {
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const renderWarehouseItemCard = useCallback(({ item }: { item: ItemCardProps }) => {
    const randomBg = getRandomBackground();
    return <ItemCard {...item} isProduction={isProduction} onActionPress={onActionPress} backgroundIcon={randomBg} isProductionCompleted={isProductionCompleted} />;
  }, []);

  const loadMoreData = async () => {
    // if (!hasMoreData || isLoading) return; 

    // setIsLoading(true); 

    // try {
    //   await new Promise(resolve => setTimeout(resolve, 2000));

    //   if (warehouseItems?.length < 30) {
    //     setWarehouseItems(prevWarehouseItems => [...prevWarehouseItems, ...prevWarehouseItems]); 
    //   } else {
    //     setHasMoreData(false);
    //   }
    // } catch (error) {
    //   console.error("Error loading more data", error);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <FlatList
      data={items}
      renderItem={renderWarehouseItemCard}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text>No Item Found in warehouse 1</Text>
        </View>
      }
      ListFooterComponent={
        isLoading ? (
          <Loader style={{ marginTop: 8 }} />
        ) : (
          !hasMoreData ? <Text style={{ textAlign: 'center', marginVertical: 16 }}>No more activities</Text> : null
        )
      }
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ItemsFlatList;
