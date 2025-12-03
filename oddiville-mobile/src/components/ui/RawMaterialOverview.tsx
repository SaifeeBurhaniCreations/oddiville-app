import { Dimensions, StyleSheet, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { useChamberStock } from '@/src/hooks/useChamberStock';
import { RawMaterialStockCardProps, StockDataItem } from '@/src/types';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { ScrollView } from 'react-native-gesture-handler';
import RawMaterialStockCard from './RawMaterialStockCard';
import SearchWithFilter from './Inputs/SearchWithFilter';
import Loader from './Loader';
import { getColor } from '@/src/constants/colors';
import { getEmptyStateData } from '@/src/utils/common';
import EmptyState from './EmptyState';
import { randomItem } from '@/src/sbc/utils/randomItem/randomItem';
import { randInt } from '@/src/sbc/utils/randInt/randInt';
import { useRawMaterial } from '@/src/hooks/rawMaterial';
import { runFilter } from '@/src/utils/bottomSheetUtils';
import { filterItems, flattenFilters } from '../../utils/filterUtils';
import { useSelector } from 'react-redux';
import { filterHandlers } from '../../lookups/filters';
import { RootState } from '@/src/redux/store';
import { FilterEnum } from '@/src/schemas/BottomSheetSchema';

const deviceHeight = Dimensions.get("window").height;
const RawMaterialOverview = () => {
    const nestedFilters = useSelector((state: RootState) => state.filter.filters);

    const { data: stockData = [], isFetching: stockLoading } = useChamberStock();

    const { data: rawMaterial = [] } = useRawMaterial();
    const { goTo } = useAppNavigation();
    const [isLoading, setIsLoading] = useState(false);

    const rawMaterialStock: (RawMaterialStockCardProps & { totalQuantity?: number, remainingQuantity?: number })[] = useMemo(() => {
        if (!stockData) return [];

        return stockData
            .filter((value: StockDataItem) => value.category === "material")
            .map((value: StockDataItem, idx: number) => {
                const totalQuantity = randInt(500, 15000);
                const randomTotal = [20000, 50000, 30000, 27000, 15500];
                const total = randomItem(randomTotal)

                const percentage = Math.floor((totalQuantity * 100) / total!);

                let status: "success" | "warning" | "danger" = "success";
                if (percentage < 15) status = "danger";
                else if (percentage > 15 && percentage < 50) status = "warning";

                const matchedMaterial = rawMaterial.find(m =>
                    m?.name?.trim().toLowerCase() === value.product_name?.trim().toLowerCase()
                );
                return {
                    id: idx + 1,
                    name: value.product_name!,
                    status,
                    image: matchedMaterial?.sample_image?.url || value.image || "",
                    totalItem: stockData.length,
                    totalQuantity: total,
                    remainingQuantity: totalQuantity,
                    weightSentence: `${totalQuantity}kg out of ${total}kg`,
                    disabled: false,
                };
            });
    }, [stockData, rawMaterial]);

    const { validateAndSetData } = useValidateAndOpenBottomSheet();

    const filters = useMemo(
        () => flattenFilters(nestedFilters) as Record<FilterEnum, string[]>,
        [nestedFilters]
    );

    const filteredItems = useMemo(() => {
        if (!rawMaterialStock) return [];
        return filterItems(rawMaterialStock, filters, filterHandlers);
    }, [rawMaterialStock, filters]);

    const handleSearchFilter = () => {
        setIsLoading(true)

        runFilter({
            key: "raw-material:overview",
            validateAndSetData,
            mode: "select-main",
        });

        setIsLoading(false)
    }

    const emptyStateData = getEmptyStateData("raw-material-overview");

    return (
        <React.Fragment>
            <View style={styles.flexGrow}>
                <View style={styles.searchinputWrapper}>
                    <SearchWithFilter
                        value=''
                        onChangeText={() => { }}
                        placeholder={"Search by material name"}
                        onFilterPress={handleSearchFilter}
                    />
                </View>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContainer}>
                    {stockLoading ?
                        <View style={styles.loaderContainer}>
                            <Loader />
                        </View>
                        : filteredItems?.length === 0 ? (
                            <View style={styles.emptyStateWrapper}>
                                <EmptyState stateData={emptyStateData} />
                            </View>
                        ) : filteredItems.map((Rmstock, index) => (
                            <RawMaterialStockCard
                                key={index}
                                {...Rmstock}
                                totalItem={Rmstock.totalItem}
                                onPress={() => goTo("raw-material-order")}
                            />
                        ))}
                </ScrollView>
            </View>
            {isLoading && (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            )}
        </React.Fragment>
    )
}

export default RawMaterialOverview

const styles = StyleSheet.create({
    flexGrow: {
        flex: 1,
        gap: 16
    },
    searchinputWrapper: {
        height: 44,
    },
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingBottom: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.05),
        zIndex: 2,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: deviceHeight / 2,
    }
})