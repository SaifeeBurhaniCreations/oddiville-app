import React, { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native'
import { getColor } from '@/src/constants/colors'
import PageHeader from '@/src/components/ui/PageHeader'
import ProductionCard from '@/src/components/ui/ProductionCard'
import { useChunkedArray } from '@/src/hooks/useChunkedArray'
import { useLanes } from '@/src/hooks/useFetchData'
import { useProductionById } from '@/src/hooks/production'
import Loader from '@/src/components/ui/Loader'
import { getEmptyStateData, getStatusDescription } from '@/src/utils/common'
import EmptyState from '@/src/components/ui/EmptyState'
import noBatchImage from "@/src/assets/images/illustrations/no-batch.png"

function getLaneNumber(
  laneName: string | undefined,
  fallback: number | null
): number {
  if (typeof laneName !== "string") return fallback ?? 0;
  const trimmed = laneName.replace(/\s+/g, "");
  const match = trimmed.match(/\d+$/);
  return match ? Number(match[0]) : fallback ?? 0;
}

const LaneCard: React.FC<{ lane: any; laneNumber: number }> = React.memo(({ lane, laneNumber }) => {
  const { data: productionData, isLoading: isProductionLoading } = useProductionById(lane.production_id)

  const { isOccupied, productName, badgeText, description } = useMemo(() => {
    const occupied = !!lane.production_id && !!productionData
    const product = occupied ? productionData.product_name : 'Empty'
    const badge = occupied ? 'Occupied' : 'Vacant'
    const desc = getStatusDescription(occupied, lane.updatedAt)

    return {
      isOccupied: occupied,
      productName: product,
      badgeText: badge,
      description: desc
    }
  }, [lane.production_id, lane.updatedAt, productionData])

  if (lane.production_id && isProductionLoading) {
    return (
      <View style={styles.cardLoadingContainer}>
        <Loader />
      </View>
    )
  }

  return (
    <ProductionCard
      laneNumber={getLaneNumber(lane?.name, laneNumber)}
      laneName={lane?.name}
      productName={productName}
      badgeText={badgeText}
      description={description}
    />
  );
})

LaneCard.displayName = 'LaneCard'

const LaneScreen: React.FC = () => {
  const { data: lanes = [], isLoading, error, refetch  } = useLanes()
  
const sortedLanes = useMemo(() => {
  const laneNumbers = lanes
    .map((lane: { name: string }) => getLaneNumber(lane?.name, null))
    .filter((num: number): num is number => typeof num === "number");

  const maxLane: number = laneNumbers.length > 0 ? Math.max(...laneNumbers) : 0;

  return [...lanes].sort((a, b) => {
    const aNum: number = Number(getLaneNumber(a?.name, maxLane + 1));
    const bNum: number = Number(getLaneNumber(b?.name, maxLane + 1));
    return aNum - bNum;
  });
}, [lanes]);

const chunkedLanes = useChunkedArray(sortedLanes, 2);
  const emptyStateData = useMemo(() => getEmptyStateData("lanes"), [])

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch?.();
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.pageContainer}>
        <PageHeader page={'Production'} />
        <View style={styles.wrapper}>
          <View style={styles.centerContainer}>
            <Loader />
          </View>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.pageContainer}>
        <PageHeader page={'Production'} />
        <View style={styles.wrapper}>
          <View style={styles.centerContainer}>
            <EmptyState 
              image={noBatchImage} 
              stateData={{
                title: "Error Loading Lanes",
                description: "Please try again later"
              }} 
            />
          </View>
        </View>
      </View>
    )
  }

  if (chunkedLanes?.length === 0) {
    return (
      <View style={styles.pageContainer}>
        <PageHeader page={'Production'} />
        <View style={styles.wrapper}>
          <View style={styles.centerContainer}>
            <EmptyState image={noBatchImage} stateData={emptyStateData} />
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={'Production'} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[getColor("green")]} />
        }
      >
        <View style={styles.wrapper}>
          {chunkedLanes.map((chunk, rowIdx) => (
            <View key={`row-${rowIdx}`} style={styles.laneRow}>
              {chunk.map((lane: any, colIdx: number) => (
                <LaneCard 
                  key={lane.id || `lane-${rowIdx}-${colIdx}`} 
                  lane={lane} 
                  laneNumber={rowIdx * 2 + colIdx + 1} 
                />
              ))}
              {chunk?.length === 1 && <View style={styles.placeholder} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default LaneScreen

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor('green', 500),
  },
  wrapper: {
    backgroundColor: getColor('light', 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 16,
    minHeight: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  laneRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardLoadingContainer: {
    flex: 1,
    height: 120, 
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: getColor('light', 100),
    borderRadius: 8,
  },
  placeholder: {
    flex: 1,
  }
})