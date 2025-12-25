// 1. React and React Native core
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";

// 2. Third-party dependencies
import { formatDate } from "date-fns";

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import Tabs from "@/src/components/ui/Tabs";
import Loader from "@/src/components/ui/Loader";
import SupervisorOrderDetailsCard from "@/src/components/ui/Supervisor/SupervisorOrderDetailsCard";
import CashIcon from "@/src/components/icons/page/CashIcon";
import DatabaseIcon from "@/src/components/icons/page/DatabaseIcon";
import BoxIcon from "@/src/components/icons/common/BoxIcon";
import PhoneIcon from "@/src/components/icons/common/PhoneIcon";
import WarehouseIcon from "@/src/components/icons/page/WarehouseIcon";
import StoreIcon from "@/src/components/icons/common/StoreIcon";
import FileIcon from "@/src/components/icons/common/FileIcon";
import { B2, B5 } from "@/src/components/typography/Typography";
import DispatchProductList from "@/src/components/ui/DispatchProductList";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import DispatchSummary from "@/src/components/ui/DispatchSummary";
import UserIcon from "@/src/components/icons/page/UserIcon";
import TruckIcon from "@/src/components/icons/page/TruckIcon";

// 4. Project hooks
import { useParams } from "@/src/hooks/useParams";
import { useOrderById } from "@/src/hooks/dispatchOrder";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import { formatTimeDifference } from "@/src/utils/common";

// 6. Types
import { DispatchOrder, OrderProps, PackageItem, ProductDetail, productDetails, SummaryItem } from "@/src/types";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

// 7. Schemas
// No items of this type

// 8. Assets 
// No items of this type

const formatOrder = {
    orderDetails: (order: DispatchOrder): OrderProps => {
        const timeTaken = formatTimeDifference(typeof order.dispatch_date === 'string' ? new Date(order.dispatch_date) : order.dispatch_date, typeof order.delivered_date === 'string' ? new Date(order.delivered_date) : order.delivered_date);
        return {
            title: order.customer_name,
            address: order.address,
            dateDifference: timeTaken,
            sideIcon: <PhoneIcon />,
            sepratorDetails: [
                {
                    name: 'Amount',
                    value: `${order.amount} Rs`,
                    icon: <CashIcon />
                },
                {
                    name: 'Quantity',
                    value: `${order.products?.reduce((total, product) => {
                        const chamberTotal = product.chambers?.reduce((sum, chamber) => sum + (Number(chamber.quantity) || 0), 0);
                        return total + (chamberTotal || 0);
                    }, 0)} Kg`,
                    icon: <DatabaseIcon />
                },
                {
                    name: 'Product',
                    value: order.products ? new Set(order.products.map(p => p.name)).size : 0,
                    icon: <BoxIcon />
                }
            ],
            dispatchDetails: [
                {
                    value: order.dispatch_date
                        ? formatDate(new Date(order.dispatch_date), "dd-MM-yy")
                        : "N/A",
                    icon: <WarehouseIcon />,
                },
                {
                    value: order.delivered_date ? formatDate(order.delivered_date, "dd-MM-yy") : '',
                    icon: <StoreIcon />,
                },
            ],
            identifier: undefined,
        }
    },
    products: (item: ProductDetail, amount: string, packages: PackageItem[]): productDetails => {
        const totalWeight = item.chambers?.reduce((sum, chamber) => sum + (Number(chamber.quantity) || 0), 0);
        const chamberCount = item.chambers?.length || 0;

        const description = `${totalWeight} Kg from ${chamberCount} chamber${chamberCount !== 1 ? 's' : ''}`;

        const allPackages = (packages || []);
        const packageStrings = allPackages?.map(pkg => `${pkg.quantity} package of ${pkg.size}${pkg.unit}`);
        const packagesSentence = packageStrings.join(', ');

        const price = `${amount} Rs`;

        return {
            title: item.name,
            image: item.image ?? "",
            description,
            packagesSentence,
            weight: `${totalWeight} Kg`,
            price,
            packages: packages,
            chambers: item.chambers

        }
    },
    summaryData: (order: DispatchOrder): SummaryItem[] => {
        const data = [
            {
                message: 'Request for the order has been received',
                date: order.createdAt
                    ? formatDate(new Date(order.dispatch_date), 'MMM dd, yyyy')
                    : 'N/A',
                icon: <UserIcon size={24} color={getColor('light')} />,
            },
            {
                message: 'Order has been created',
                date: order.createdAt
                    ? formatDate(new Date(order.dispatch_date), 'MMM dd, yyyy')
                    : 'N/A',
                icon: <BoxIcon size={24} color={getColor('light')} />,
            },
            {
                message: 'Order has been shipped',
                reason: '',
                date: order.dispatch_date
                    ? formatDate(new Date(order.dispatch_date), 'MMM dd, yyyy')
                    : 'N/A',
                icon: <TruckIcon size={24} color={getColor('light')} />,
            },
            {
                message: 'Order has arrived at the destination',
                reason: '',
                date: order.delivered_date
                    ? formatDate(new Date(order.dispatch_date), 'MMM dd, yyyy')
                    : 'N/A',
                icon: <StoreIcon size={36} color={getColor('light')} />,
            },
        ]
        return data
    }
}

const categorizeOrders = (order: DispatchOrder) => {
    const orderDetails: OrderProps = formatOrder.orderDetails(order);
    const summaryData: SummaryItem[] = formatOrder.summaryData(order)
    const products: productDetails[] = []
    order.products?.forEach(element => {
        products.push(formatOrder.products(element, order.amount, order.packages))
    });

    return { orderDetails, products, summaryData };
};

const DispatchSummaryScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { orderId } = useParams('dispatch-summary', 'orderId')
    const { data: orderData, isLoading: ordersLoading } = useOrderById(orderId!)

    const { orderDetails, products, summaryData } = categorizeOrders(!ordersLoading ? orderData : [])

    const { validateAndSetData } = useValidateAndOpenBottomSheet()

    const handleOpenChallanViewer = (urls: string[]) => {
        const ImagePreview = {
            sections: [
                {
                    type: 'title-with-details-cross',
                    data: {
                        title: 'Example_challan'
                    },
                },
                urls?.length === 1 ? {
                    type: 'image-preview',
                    data: {
                        imageUri: urls[0]
                    }
                } : {
                    type: 'full-width-slider',
                    data: urls
                }
            ]
        }
        validateAndSetData("Abcd1", "image-preview", ImagePreview);
    }

    return (
        <View style={styles.pageContainer}>
            <PageHeader page={'Order'} />
            <View style={styles.wrapper}>
                <BackButton label="Order details" backRoute="admin-orders"/>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ gap: 24 }}>
                        <SupervisorOrderDetailsCard order={orderDetails} />

                        <View style={styles.receipt}>
                            <View style={[styles.row, styles.gap12]}>
                                <FileIcon />
                                <B2>
                                    +3Challan_1.{orderData?.sample_images[0].split(".")[1]} + {orderData?.sample_images.length - 1} more</B2>
                                {/* <B2>{ (testUrls?.[0]?.split("/").pop() ?? "").slice(-16) } + {testUrls.length - 1} more</B2> */}
                            </View>
                            <Pressable onPress={() => handleOpenChallanViewer(orderData?.sample_images)}>
                                <B5 color={getColor("green")}>View receipt</B5>
                            </Pressable>
                        </View>

                        <Tabs tabTitles={['Products', 'Product journey']} color='green' style={styles.flexGrow}>
                            <View style={{ paddingVertical: 16 }}>
                                <DispatchProductList products={products} isChecked={true} />
                            </View>
                            <DispatchSummary summaryData={summaryData} />
                        </Tabs>
                    </View>
                </ScrollView>
            </View>
            {isLoading && (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            )}

        </View>

    )
}

export default DispatchSummaryScreen;

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
        position: "relative",
    },
    wrapper: {
        flex: 1,
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        padding: 16,
        gap: 24
    },
    flexGrow: {
        flex: 1,
    },
    searchinputWrapper: {
        height: 44,
        marginTop: 24,
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
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    gap12: {
        gap: 12,
    },
    receipt: {
        backgroundColor: getColor("light"),
        borderWidth: 1,
        borderColor: getColor("green", 100),
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        justifyContent: "space-between",
    }
});
