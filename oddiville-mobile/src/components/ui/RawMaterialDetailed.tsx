import { StyleSheet, View, ScrollView } from 'react-native';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import SearchWithFilter from './Inputs/SearchWithFilter';
import Select from './Select';
import { RawMaterialProps, StockDataItem } from '@/src/types';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { getColor } from '@/src/constants/colors';
import Loader from './Loader';
import { useChamberStock } from '@/src/hooks/useChamberStock';
import { useChamber, useChamberByName } from '@/src/hooks/useChambers';
import ChamberCard from './ChamberCard';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';
import { selectChamber } from '@/src/redux/slices/chamber.slice';
import EmptyState from './EmptyState';
import { getEmptyStateData } from '@/src/utils/common';
import { runFilter } from '@/src/utils/bottomSheetUtils';

const RawMaterialDetailed = () => {
    const dispatch = useDispatch();
    const { data: stockData = [], isFetching: stockLoading } = useChamberStock();
    const { chamber: selectedChamber } = useSelector((state: RootState) => state.chamber);

    // const fallBackChamber = useSelector((state: RootState) => {
    //     const sections = state.bottomSheet.config?.sections || [];
    //     const sectionToCheck = sections[1] || sections[0];

    //     if (
    //         sectionToCheck?.type === "optionList" &&
    //         sectionToCheck?.data?.options?.length > 0
    //     ) {
    //         return sectionToCheck.data.options[0];
    //     }
    //     return undefined;
    // });

    // const isVisible = useSelector((state: RootState) => state.bottomSheet.isVisible);

    const { data: chambers = [] } = useChamber();

    const { data: chamberData, isFetching: chamberLoading } = useChamberByName(selectedChamber);
    const { validateAndSetData } = useValidateAndOpenBottomSheet();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!chambers || !chambers || !chambers[0]?.chamber_name) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        dispatch(selectChamber(chambers[0].chamber_name));
        setIsLoading(false);
    }, [dispatch]);

    // const prevIsVisible = useRef(isVisible);

    // useEffect(() => {
    //     if (
    //         prevIsVisible.current &&
    //         !isVisible &&
    //         !selectedChamber &&
    //         fallBackChamber
    //     ) {
    //         dispatch(selectChamber(fallBackChamber));
    //     }
    //     prevIsVisible.current = isVisible;
    // }, [isVisible, selectedChamber, fallBackChamber, dispatch]);

    const handleSearchFilter = () => {
        setIsLoading(true);
        runFilter({
            key:"raw-material:detailed", 
            validateAndSetData,
            mode: "select-main"
        })
        setIsLoading(false);
    };
    const handleChamberSearch = () => {
        setIsLoading(true);
        validateAndSetData("Chamber-123", "chamber-list");
        setIsLoading(false);
    };

    const parsedStock: RawMaterialProps[] = useMemo(() => {
        if (!chamberData?.id || !stockData?.length) return [];

        return stockData
            ?.filter((value: StockDataItem) => value.category === "material")
            ?.map(item => {
                const matchingChamberData = item.chamber?.filter(entry => entry.id === chamberData.id);
                if (!matchingChamberData || matchingChamberData?.length === 0) return null;

                const detailByRating = matchingChamberData.map(entry => ({
                    rating: entry.rating,
                    quantity: `${entry.quantity}${item.unit}`,
                }));

                const ratingStrings = matchingChamberData.map(entry => entry.rating).filter(Boolean);

                const ratingNumbers = ratingStrings
                    .map(r => parseFloat(r))
                    .filter(n => !isNaN(n));

                const minRating = ratingNumbers?.length ? Math.min(...ratingNumbers).toFixed(1) : "";
                const maxRating = ratingNumbers?.length ? Math.max(...ratingNumbers).toFixed(1) : "";

                const totalQuantity = matchingChamberData.reduce(
                    (sum, entry) => sum + parseFloat(entry.quantity || '0'),
                    0
                );

                const disabled = matchingChamberData.some(entry => parseFloat(entry.quantity ?? '0') === 0);

                const ratingDisplay = item.category === "other"
                    ? ratingStrings.join(", ")
                    : (minRating && maxRating ? `${minRating} - ${maxRating}` : "");

                return {
                  name: item.product_name,
                  description: `${totalQuantity}${item.unit}`,
                  rating: ratingDisplay,
                  disabled: disabled,
                  href:
                    item.category === "other"
                      ? "other-products-detail"
                      : "",
                //   href:
                //     item.category === "other"
                //       ? "other-products-detail"
                //       : "raw-material-detail",
                  quantity: detailByRating[0]?.quantity ?? "",
                  detailByRating,
                  category: item.category,
                  chambers: item.category === "other" ? item.chamber : null,
                  id: item.category === "other" ? item.id : null,
                };
            })
            .filter(Boolean) as RawMaterialProps[];
    }, [stockData, chamberData]);

    const emptyStateData = getEmptyStateData("no-chamber-stock");

    return (
        <>
            <View style={styles.flexGrow}>
                <View style={styles.searchinputWrapper}>
                    <SearchWithFilter
                        placeholder={"Search by material name"}
                        onFilterPress={handleSearchFilter}
                        value=''
                        onChangeText={() => { }}
                    />
                </View>

                <Select value={selectedChamber}
                    options={["Chamber 1", "Chamber 2", "Chamber 3"]} showOptions={false} onPress={handleChamberSearch}
                />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContainerV2}>
                    {(stockLoading || chamberLoading) ?
                        <View style={styles.loaderContainer}>
                            <Loader />
                        </View>
                        : parsedStock?.length === 0 ? <View style={{ alignItems: 'center' }}>
                            <EmptyState stateData={emptyStateData} />
                        </View> : parsedStock.map((chamberStock, index) => (
                            <React.Fragment key={index}>
                                <ChamberCard
                                    key={index}
                                    {...chamberStock}
                                />
                            </React.Fragment>
                        ))}
                </ScrollView>
                {isLoading && (
                    <View style={styles.overlay}>
                        <View style={styles.loaderContainer}>
                            <Loader />
                        </View>
                    </View>
                )}
            </View>

        </>
    );
};

export default RawMaterialDetailed;

const styles = StyleSheet.create({
    flexGrow: {
        flex: 1,
        gap: 16,
    },
    searchinputWrapper: {
        height: 44,
    },
    cardContainerV2: {
        flexDirection: 'column',
        gap: 12,
        paddingBottom: 20,
        flex: 1
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
});
