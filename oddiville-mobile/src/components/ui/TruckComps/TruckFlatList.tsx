import { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { TruckProps } from "@/src/types";
import Loader from '../Loader';
import TruckCard from './TruckCard';
import { getRandomBackground } from '@/src/utils/arrayUtils';

const TruckFlatList = ({
  trucks,
  fetchMore,
  hasMore,
  isLoading
}: {
  trucks: TruckProps[];
  fetchMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}) => {

  const renderItem = useCallback(({ item }: { item: TruckProps }) => {
    const randomBg = getRandomBackground();
    return <TruckCard {...item} color="green" bgSvg={randomBg} />;
  }, []);

  return (
    <FlatList
      data={trucks}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text>No Vendors Found</Text>
        </View>
      }
      ListFooterComponent={
        isLoading
          ? <Loader />
          : !hasMore
          ? <Text style={{ textAlign: 'center', marginVertical: 16 }}>No more vendors</Text>
          : null
      }
      onEndReached={hasMore ? fetchMore : undefined}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
    />
  );
};


export default TruckFlatList;
