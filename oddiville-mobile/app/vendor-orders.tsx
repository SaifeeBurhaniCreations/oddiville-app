import { StyleSheet, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/src/components/ui/Buttons/Button';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import PageHeader from '@/src/components/ui/PageHeader';
import { getColor } from '@/src/constants/colors';
import SearchWithFilter from '@/src/components/ui/Inputs/SearchWithFilter';
import { ActivityProps, Vendor } from '@/src/types';
import ActivitesFlatList from '@/src/components/ui/ActivitesFlatList';
import DatabaseIcon from '@/src/components/icons/page/DatabaseIcon';
import CashIcon from '@/src/components/icons/page/CashIcon';
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { useParams } from '@/src/hooks/useParams';
import { useVendors } from '@/src/hooks/vendor';
import { useRawMaterialOrdersAll } from '@/src/hooks/useRawMaterialOrders';
import Loader from '@/src/components/ui/Loader';
import { formatAmount } from '@/src/utils/common';
import { runFilter } from '@/src/utils/bottomSheetUtils';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';

function extractOrdersFormatted(vendors: Vendor[], rawOrders: any[]): ActivityProps[] {
    if (!Array.isArray(vendors) || !Array.isArray(rawOrders)) return [];

    return vendors.flatMap((vendor) => {
        const vendorOrders = rawOrders.filter(order => vendor?.orders?.includes(order?.id));

        return vendorOrders.map(order => {
            const orderDate = new Date(order?.order_date);
            const createdAt = !isNaN(orderDate.getTime()) ? orderDate : undefined;

            const diffInDays = createdAt
                ? Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
                : null;

            const badgeText =
                diffInDays !== null
                    ? diffInDays <= 3
                        ? 'New'
                        : diffInDays <= 14
                            ? 'Recent'
                            : ''
                    : '';

            return {
                id: order?.id,
                itemId: order?.id,
                identifier: null,
                title: order?.raw_material_name || 'Unknown Material',
                type: vendor?.name || 'Vendor',
                badgeText,
                createdAt,
                dateDescription: 'Order date:',
                href: 'vendor-order-detail',
                extra_details: [vendor?.address || 'No address'],
                bottomDetails: [
                    {
                        name: 'Quantity',
                        value: `${order?.quantity_ordered ?? "--"}${order?.unit || ''}`,
                        icon: <DatabaseIcon />,
                    },
                    {
                        name: 'Amount',
                        value: formatAmount(order?.price),
                        icon: <CashIcon />,
                    },
                ],
                params: { orderId: order?.id },
            };
        });
    });
}

const VendorOrdersScreen = () => {
    const { validateAndSetData } = useValidateAndOpenBottomSheet();
    const [searchValue, setSearchValue] = useState('');
    const [orders, setOrders] = useState<ActivityProps[]>([]);

    const { _raw: vendorData } = useVendors(searchValue);
    const { data: rawOrders, isLoading: rawOrderLoading } = useRawMaterialOrdersAll();
    const { goTo } = useAppNavigation();
    const { userId } = useParams('vendor-orders', 'userId');

    const parsedVendors: Vendor[] = useMemo(
        () => vendorData?.pages?.flatMap((page: any) => page?.data) ?? [],
        [vendorData]
    );

    const filteredVendors = useMemo(() => {
        if (!userId) return parsedVendors;
        return parsedVendors.filter(vendor => vendor?.id === userId);
    }, [parsedVendors, userId]);

    useEffect(() => {
        const formattedOrders = extractOrdersFormatted(filteredVendors, rawOrders ?? []);

        setOrders(formattedOrders);
    }, [filteredVendors, rawOrders]);

    const truncatedName = filteredVendors[0]?.name.slice(0, 8);

    const handleSearchFilter = () => {
        runFilter({
            key: "vendor:order",
            validateAndSetData,
            mode: "select-main"
        });
    }
    return (
        <View style={styles.pageContainer}>
            <PageHeader page="Vendors" />
            <View style={styles.wrapper}>
                <View style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}>
                    <BackButton label={`${!userId ? "Vendors" : filteredVendors[0]?.alias ? filteredVendors[0]?.alias : truncatedName} orders (${orders?.length})`} backRoute={!userId ? "home" : "vendors"} />
                    <Button onPress={() => goTo('vendors')} variant="outline" size="md">
                        View Vendors
                    </Button>
                </View>

                <SearchWithFilter
                    placeholder="Search by vendor name"
                    value={searchValue}
                    cross
                    onFilterPress={handleSearchFilter}
                    onChangeText={setSearchValue}
                    onClear={() => setSearchValue('')}
                />

                {rawOrderLoading ?
                    <View style={styles.overlay}>
                        <View style={styles.loaderContainer}>
                            <Loader />
                        </View>
                    </View>
                    : (
                        <ActivitesFlatList isVirtualised activities={orders} listKey={"vendor-order"} />
                    )}
            </View>
        </View>
    );
};

export default VendorOrdersScreen;

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
    },
    wrapper: {
        flex: 1,
        gap: 16,
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        padding: 16,
    },
    HStack: {
        flexDirection: 'row',
    },
    justifyBetween: {
        justifyContent: 'space-between',
    },
    alignCenter: {
        alignItems: 'center',
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
