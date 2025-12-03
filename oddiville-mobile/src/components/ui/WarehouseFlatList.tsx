import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Loader from './Loader';
import { WarehouseCardProps, WarehouseFlatListProps } from "@/src/types";
import WarehouseCard from './WarehouseCard';
import { getColor } from '@/src/constants/colors';

const WarehouseFlatList = ({ warehouses: initialWarehouses, isVirtualised = true }: WarehouseFlatListProps) => {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const renderWarehouseCard = useCallback(({ item }: { item: WarehouseCardProps }) => {
    return <WarehouseCard {...item} />
  }, []);

  // Load more activities
  const loadMoreData = async () => {
    if (!hasMoreData || isLoading) return; 

    setIsLoading(true); 

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (warehouses?.length < 30) {
        setWarehouses(prevWarehouses => [...prevWarehouses, ...prevWarehouses]); 
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error("Error loading more data", error);
    } finally {
      setIsLoading(false);
    }
  };
 
  if (!isVirtualised) {
    return (
      <View style={{ flex: 1 }}>
        {warehouses?.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text>No Warehouse found</Text>
          </View>
        ) : (
          warehouses.map((item, index) => (
            <React.Fragment key={`${item.name}-${index}`}>
              <WarehouseCard {...item} />
              {index < warehouses?.length - 1 && (
                <View style={styles.seprator}></View>
              )}
            </React.Fragment>
          ))
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={warehouses}
      renderItem={renderWarehouseCard}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={styles.seprator}></View>}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text>No Warehouse found</Text>
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

export default WarehouseFlatList;

const styles = StyleSheet.create({
  seprator: {
    height: 1,
    width: "100%",
    backgroundColor: getColor("green", 100),
    marginVertical: 12
  }
})
