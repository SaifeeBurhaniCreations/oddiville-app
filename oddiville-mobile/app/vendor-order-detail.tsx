import { StyleSheet, View, Text } from 'react-native';
import React, { useMemo } from 'react';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import PageHeader from '@/src/components/ui/PageHeader';
import { getColor } from '@/src/constants/colors';
import DatabaseIcon from '@/src/components/icons/page/DatabaseIcon';
import SupervisorOrderDetailsCard from '@/src/components/ui/Supervisor/SupervisorOrderDetailsCard';
import { OrderProps, Vendor } from '@/src/types';
import TruckWeightCard from '@/src/components/ui/TruckWeightCard';
import { useParams } from '@/src/hooks/useParams';
import { format } from 'date-fns';
import { useVendors } from '@/src/hooks/vendor';
import { useRawMaterialOrdersAll } from '@/src/hooks/rawMaterialOrders';
import { formatDateForDisplay } from '@/src/utils/dateUtils';
import { formatWeight } from '@/src/utils/common';

const getOrderDetails = (
    vendors: Vendor[],
    rawOrders: any[],
    orderId: string | null
): { orderDetails: OrderProps | null; truckDetails: any | null } => {
    if (!orderId) return { orderDetails: null, truckDetails: null };

    const order = rawOrders?.find((o: any) => o.id === orderId);
    if (!order) return { orderDetails: null, truckDetails: null };

    const vendor = vendors?.find((v: any) => v.orders?.includes(orderId));

    const orderDetails: OrderProps = {
        id: order.id,
        title: order.raw_material_name,
        name: vendor?.name ?? order.vendor ?? 'Unknown Vendor',
        address: vendor?.address ?? 'N/A',
        description: [
            {
                name: 'Order quantity',
                value: `${formatWeight(order.quantity_ordered) ?? "--"}`,
                icon: <DatabaseIcon size={16} color={getColor('green', 700)} />,
            },
        ],
        helperDetails: [
            {
                name: 'Order',
                value: order.order_date ? formatDateForDisplay(order?.order_date) : "---",
                icon: null,
            },
            {
                name: 'Arrival',
                value: order.arrival_date ? formatDateForDisplay(order?.arrival_date) : "---",
                icon: null,
            },
        ],
        href: 'supervisor-rm-details',
        identifier: 'order-ready',
    };

    let truckDetails = null;

    if (order.truck_details) {
        const { truck_weight, tare_weight } = order.truck_details;
        truckDetails = {
            title: (truck_weight && tare_weight)
                ? `${(Number(truck_weight) - Number(tare_weight)).toFixed(1)}`
                : 'N/A',
            description: 'Product weight',
            truckWeight: tare_weight ? `${formatWeight(tare_weight)}` : 'N/A',
            otherDescription: 'Truck weight',
        };
    }

    return { orderDetails, truckDetails };
};

const VendorOrderDetailsScreen = () => {
    const { orderId } = useParams('vendor-order-detail', 'orderId');
    const { _raw: vendorData } = useVendors('');
    const { data: rawOrders } = useRawMaterialOrdersAll();

    const parsedVendors: Vendor[] = useMemo(
        () => vendorData?.pages?.flatMap((page: any) => page?.data) ?? [],
        [vendorData]
    );

    const { orderDetails, truckDetails } = useMemo(
        () => getOrderDetails(parsedVendors, rawOrders ?? [], orderId ?? null),
        [parsedVendors, rawOrders, orderId]
    );

    if (!orderDetails) {
        return (
            <View style={styles.pageContainer}>
                <PageHeader page="Vendors" />
                <View style={styles.wrapper}>
                    <BackButton label="Back" backRoute="vendor-orders" />
                    <Text style={{ color: getColor('green', 700), fontSize: 16 }}>Order not found.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.pageContainer}>
            <PageHeader page="Vendors" />
            <View style={styles.wrapper}>
                <View style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}>
                    <BackButton label="Vendor details" backRoute="vendor-orders" />
                </View>
                <SupervisorOrderDetailsCard order={orderDetails} />
                {truckDetails && <TruckWeightCard {...truckDetails} />}
            </View>
        </View>
    );
};

export default VendorOrderDetailsScreen;

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
        position: 'relative',
    },
    wrapper: {
        flex: 1,
        flexDirection: 'column',
        gap: 24,
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
});
