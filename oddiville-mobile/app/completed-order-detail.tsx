// 1. React and React Native core
import React, { useEffect, useState } from "react";
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
import { DispatchOrderProduct, useOrderById } from "@/src/hooks/dispatchOrder";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import { formatTimeDifference, getEmptyStateData } from "@/src/utils/common";

// 6. Types
import {
  DispatchOrder,
  OrderProps,
  productDetails,
  SummaryItem,
} from "@/src/types";
import { useOverlayLoader } from "@/src/context/OverlayLoaderContext";
import EmptyState, { EmptyStateStyles } from "@/src/components/ui/EmptyState";
import { isAllowedUnit } from "@/src/utils/unitUtils";

const toDate = (value: string | Date | null | undefined): Date | undefined => {
  if (!value) return undefined;
  return typeof value === "string" ? new Date(value) : value;
};

const formatOrder = {
  orderDetails: (order: DispatchOrder): OrderProps => {
    const dispatchDate = toDate(order.dispatch_date as any);
    const deliveredDate = toDate(order.delivered_date as any);

    let timeTaken = "N/A";
    if (dispatchDate && deliveredDate) {
      timeTaken = formatTimeDifference(dispatchDate, deliveredDate);
    }

    const totalQuantityKg = Object.values(order.dispatched_items ?? {})
      .flatMap((product) => Object.values(product))
      .reduce((totalKg, sku) => {
        const { size, unit } = sku.packet;
        const packets = sku.totalPackets ?? 0;

        const weightInKg =
          unit === "kg"
            ? packets * size
            : unit === "gm"
              ? (packets * size) / 1000
              : 0;

        return totalKg + weightInKg;
      }, 0);
    const uniqueProductCount = order.products
      ? new Set(order.products.map((p: any) => p.name)).size
      : 0;

    return {
      title: order.customer_name,
      address: order.address,
      city: order.city,
      state: order.state,
      country: order.country,
      dateDifference: timeTaken,
      sideIconKey: "phone",
      sepratorDetails: [
        {
          name: "Total quantity",
          value: `${totalQuantityKg} Kg`,
          iconKey: "database",
        },
        {
          name: "Product count",
          value: uniqueProductCount,
          iconKey: "box",
        },
      ],
      dispatchDetails: [
        {
          value: dispatchDate ? formatDate(dispatchDate, "dd-MM-yy") : "N/A",
          iconKey: "warehouse",
        },
        {
          value: deliveredDate ? formatDate(deliveredDate, "dd-MM-yy") : "",
          iconKey: "store",
        },
      ],
      identifier: undefined,
    };
  },

  products: (order: DispatchOrder): productDetails[] => {
    return order.products.map((product) => {
      const productSkusObject = order.dispatched_items?.[product.id] ?? {};

      const skus = Object.entries(productSkusObject).map(
        ([skuId, skuData]) => ({
          skuId,
          size: skuData.packet.size,
          unit: isAllowedUnit(skuData.packet.unit)
            ? skuData.packet.unit
            : "unit",
          totalBags: skuData.totalBags,
          totalPackets: skuData.totalPackets,
        }),
      );

      const totalWeightKg = skus.reduce((total, sku) => {
        const weight =
          sku.unit === "kg"
            ? sku.totalPackets * sku.size
            : sku.unit === "gm"
              ? (sku.totalPackets * sku.size) / 1000
              : 0;

        return total + weight;
      }, 0);

      return {
        title: product.product_name,
        description: "",
        image: product.image ?? "",
        weight: `${totalWeightKg} Kg`,
        productId: product.id,
        rating: product.rating,
        skus,
      };
    });
  },

  summaryData: (order: DispatchOrder): SummaryItem[] => {
    const createdAt = toDate(order.createdAt as any);
    const dispatchDate = toDate(order.dispatch_date as any);
    const deliveredDate = toDate(order.delivered_date as any);

    const data: SummaryItem[] = [
      {
        message: "Request for the order has been received",
        date: createdAt ? formatDate(createdAt, "MMM dd, yyyy") : "N/A",
        icon: <UserIcon size={24} color={getColor("light")} />,
      },
      {
        message: "Order has been created",
        date: createdAt ? formatDate(createdAt, "MMM dd, yyyy") : "N/A",
        icon: <BoxIcon size={24} color={getColor("light")} />,
      },
      {
        message: "Order has been shipped",
        reason: "",
        date: dispatchDate ? formatDate(dispatchDate, "MMM dd, yyyy") : "N/A",
        icon: <TruckIcon size={24} color={getColor("light")} />,
      },
      {
        message: "Order has arrived at the destination",
        reason: "",
        date: deliveredDate ? formatDate(deliveredDate, "MMM dd, yyyy") : "N/A",
        icon: <StoreIcon size={36} color={getColor("light")} />,
      },
    ];
    return data;
  },
};

const categorizeOrders = (order: DispatchOrder) => {
  const orderDetails: OrderProps = formatOrder.orderDetails(order);
  const summaryData: SummaryItem[] = formatOrder.summaryData(order);

  const products = formatOrder.products(order);

  return { orderDetails, products, summaryData };
};

const CompletedOrderDetailScreen = () => {
  const { orderId } = useParams("dispatch-summary", "orderId");
  const { data: orderData, isLoading: ordersLoading } = useOrderById(orderId!);
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const loader = useOverlayLoader();

  useEffect(() => {
    loader.bind(ordersLoading);
  }, [ordersLoading]);

  const isEmpty =
    !ordersLoading && Array.isArray(orderData) && orderData.length === 0;

  const { orderDetails, products, summaryData } = categorizeOrders(orderData);

  const handleOpenChallanViewer = (urls: string[]) => {
    if (!urls || urls.length === 0) return;

    const ImagePreview = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Example_challan",
          },
        },
        urls.length === 1
          ? {
              type: "image-preview",
              data: {
                imageUri: urls[0],
              },
            }
          : {
              type: "full-width-slider",
              data: urls,
            },
      ],
    };
    validateAndSetData("Abcd1", "image-preview", ImagePreview);
  };

  if (ordersLoading) {
    return null;
  }
  const hasImages =
    Array.isArray(orderData.sample_images) &&
    orderData.sample_images.length > 0;

  const firstImage = hasImages ? orderData.sample_images[0] : "";
  const firstExt = firstImage ? firstImage.split(".").pop() : "jpg";
  const remainingCount = hasImages
    ? Math.max(0, orderData.sample_images.length - 1)
    : 0;

  const emptyStateData = getEmptyStateData("no-order");

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Order"} />
      <View style={styles.wrapper}>
        <BackButton label="Order details" backRoute="sales" />
        {isEmpty ? (
          <View style={EmptyStateStyles.center}>
            <EmptyState stateData={emptyStateData} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 24 }}>
              <SupervisorOrderDetailsCard order={orderDetails} />

              {hasImages && (
                <View style={styles.receipt}>
                  <View style={[styles.row, styles.gap12]}>
                    <FileIcon />
                    <B2>
                      {`Challan_1.${firstExt}` +
                        (remainingCount > 0 ? ` + ${remainingCount} more` : "")}
                    </B2>
                  </View>
                  <Pressable
                    onPress={() =>
                      handleOpenChallanViewer(
                        (orderData as any).sample_images as string[],
                      )
                    }
                  >
                    <B5 color={getColor("green")}>View receipt</B5>
                  </Pressable>
                </View>
              )}

              <Tabs
                tabTitles={["Products", "Product journey"]}
                color="green"
                style={styles.flexGrow}
              >
                <View style={{ paddingVertical: 16 }}>
                  <DispatchProductList products={products} isChecked={true} />
                </View>
                <DispatchSummary summaryData={summaryData} />
              </Tabs>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default CompletedOrderDetailScreen;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 16,
    gap: 24,
  },
  flexGrow: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
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
  },
});