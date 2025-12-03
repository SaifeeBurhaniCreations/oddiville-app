// 1. React and React Native core
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// 2. Third-party dependencies
import { useDispatch, useSelector } from 'react-redux';

// 3. Project components
import BackButton from '@/src/components/ui/Buttons/BackButton';
import PageHeader from '@/src/components/ui/PageHeader';
import Button from '@/src/components/ui/Buttons/Button';
import PackagingSizeCard from "@/src/components/ui/Packaging/PackgingSizeCard";
import BottomSheet from '@/src/components/ui/BottomSheet';
import Loader from '@/src/components/ui/Loader';
import EmptyState from '@/src/components/ui/EmptyState';

// 4. Project hooks
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { useParams } from '@/src/hooks/useParams';
import { usePackageById } from '@/src/hooks/Packages';

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';
import { chunkCards } from '@/src/utils/arrayUtils';
import { formatPackageParams } from '@/src/constants/Packets';
import { getEmptyStateData } from '@/src/utils/common';
import { setPackageSize } from '@/src/redux/slices/package-size.slice';
import { setCurrentProductId } from '@/src/redux/slices/current-product.slice';
import { sortBy } from '@/src/utils/numberUtils';

// 6. Types
import { RootState } from '@/src/redux/store';
import BagIcon from '@/src/components/icons/packaging/BagIcon';

// 7. Schemas
// No items of this type

// 8. Assets 
// No items of this type

const PackagingDetailsScreen = () => {
    const { id: packageId, name: packageName } = useParams('packaging-details', 'id', "name")
    const { data: packageData, isFetching: packageLoading } = usePackageById(packageId!)
    const isLoadingPackage = useSelector((state: RootState) => state.fillPackage.isLoading);
    const isLoadingPackageSize = useSelector((state: RootState) => state.packageSizePackaging.isLoadingPackageSize);

    const packages = useMemo(() => {
        return formatPackageParams({ types: packageData?.types });
    }, [packageData]);
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch();
    const { validateAndSetData } = useValidateAndOpenBottomSheet();

    const handleOpen = (id: string) => {
        const match = packages?.find(pkg => pkg.weight === id);
        if (!match) return;

        const { icon, ...selectedPackage } = match;
        dispatch(setPackageSize({ ...selectedPackage, id: packageId }));

        const fillPackage = {
            sections: [
                {
                    type: 'title-with-details-cross',
                    data: {
                        title: 'Add package count',
                        description: `${selectedPackage.weight} • ${selectedPackage.quantity} count`,
                        details: { icon: "pencil" }
                    },
                },
                {
                    type: 'input',
                    data: {
                        placeholder: 'Enter counts',
                        label: 'Add package',
                        keyboardType: 'number-pad',
                        formField: "quantity"
                    },
                },
            ],
            buttons: [
                { text: 'Add', variant: 'fill', color: 'green', alignment: "full", disabled: false, actionKey: "add-package-quantity" },
                // { text: "Update", variant: 'fill', color: 'green', alignment: "full", disabled: false, actionKey: "update-package-quantity", isVisible: false },
            ],
        };

        setIsLoading(true);
        validateAndSetData(id, "fill-package", fillPackage);
        setIsLoading(false);
    };

    const handleOpenAddNewSize = () => {
        dispatch(setCurrentProductId(packageId))
        setIsLoading(true)
        validateAndSetData(packageId!, "add-package");
        setIsLoading(false)
    }

    const emptyStateData = getEmptyStateData("packaging-details");

    // console.log(JSON.stringify(formatPackageParams));

    return (
        <View style={styles.pageContainer}>
            <PageHeader page={'SKU'} />
            <View style={styles.wrapper}>
                <View style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}>

                    <BackButton label={packageName ? packageName : "UnTitled"} backRoute="packaging" />

                    <Button variant='outline' size='md' onPress={handleOpenAddNewSize}>Add new size</Button>
                </View>
                <View style={styles.cardList}>
                    {!packages ? (
                        <View style={styles.overlay}>
                            <View style={styles.loaderContainer}>
                                <Loader />
                            </View>
                        </View>
                    ) : packages?.length > 0 ? (
                        chunkCards(sortBy([...packages], "weight"), 2).map((pair, index) => (
                            <View key={index} style={styles.cardRow}>
                                {pair.map((item, i) => (
                                    <View key={i} style={styles.cardWrapper}>
                                        <PackagingSizeCard
                                            icon={item.icon ? item.icon : BagIcon}
                                            weight={item.weight || ""}
                                            quantity={item.quantity || ""}
                                            disabled={item.disabled || false}
                                            onPress={() => handleOpen(item?.weight)}
                                        />

                                    </View>
                                ))}
                                {pair?.length === 1 && <View style={styles.cardWrapper} />}
                            </View>
                        ))
                    ) : (
                        <EmptyState stateData={emptyStateData} />
                    )}
                </View>
                <BottomSheet color='green' />
                {(isLoadingPackageSize || isLoadingPackage || packageLoading) &&
                    <View style={styles.overlay}>
                        <View style={styles.loaderContainer}>
                            <Loader />
                        </View>
                    </View>
                }
            </View>
        </View>
    )
}

export default PackagingDetailsScreen

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
        position: "relative",
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        gap: 24,
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        padding: 16,
    },
    flexGrow: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.1),
        zIndex: 2,
    },
    content: {
        flexDirection: "column",
        gap: 16,
        height: "100%"
    },

    HStack: {
        flexDirection: "row"
    },
    justifyBetween: {
        justifyContent: "space-between",
    },
    alignCenter: {
        alignItems: "center"
    },
    gap8: {
        gap: 8,
    },
    cardList: {
        flexDirection: "column",
        gap: 16,
    },
    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardWrapper: {
        flex: 1,
    },

})