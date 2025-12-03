import React, { useState, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import Loader from './Loader';
import { WarehouseItemCardProps, WarehouseItemFlatListProps } from "@/src/types";
import WarehouseItemCard from './WarehouseItemCard';

const WarehouseItemFlatList = ({ warehouseItems: initialWarehouseItems }: WarehouseItemFlatListProps) => {
  const [warehouseItems, setWarehouseItems] = useState(initialWarehouseItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const renderWarehouseItemCard = useCallback(({ item }: { item: WarehouseItemCardProps }) => {
    return <WarehouseItemCard {...item} />;
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
      data={warehouseItems}
      renderItem={renderWarehouseItemCard}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 20 }}>
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

export default WarehouseItemFlatList;
