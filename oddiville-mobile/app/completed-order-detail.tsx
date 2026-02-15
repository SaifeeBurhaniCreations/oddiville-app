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
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import { formatTimeDifference } from "@/src/utils/common";

// 6. Types
import {
  DispatchOrder,
  OrderProps,
  PackageItem,
  productDetails,
  SummaryItem,
} from "@/src/types";
import OverlayLoader from "@/src/components/ui/OverlayLoader";

// ---- Helper: safely convert string | Date | null to Date ----
const toDate = (value: string | Date | null | undefined): Date | undefined => {
  if (!value) return undefined;
  return typeof value === "string" ? new Date(value) : value;
};

// ---- Formatter object ----
const formatOrder = {
  orderDetails: (order: DispatchOrder): OrderProps => {
    const dispatchDate = toDate(order.dispatch_date as any);
    const deliveredDate = toDate(order.delivered_date as any);

    let timeTaken = "N/A";
    if (dispatchDate && deliveredDate) {
      timeTaken = formatTimeDifference(dispatchDate, deliveredDate);
    }

    const totalQuantityKg =
      order.products?.reduce((total: number, product: any) => {
        const chamberTotal =
          product.chambers?.reduce(
            (sum: number, chamber: any) =>
              sum + (Number(chamber.quantity) || 0),
            0
          ) ?? 0;
        return total + chamberTotal;
      }, 0) ?? 0;

    const uniqueProductCount = order.products
      ? new Set(order.products.map((p: any) => p.name)).size
      : 0;

    return {
      title: order.customer_name,
      address: order.address,
      dateDifference: timeTaken,
      sideIconKey: "phone",
      sepratorDetails: [
        {
          name: "Amount",
          value: `${order.amount} Rs`,
          iconKey: "cash",
        },
        {
          name: "Quantity",
          value: `${totalQuantityKg} Kg`,
          iconKey: "database",
        },
        {
          name: "Product",
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

  products: (
    item: DispatchOrder["products"][number],
    amount: string,
    packages: PackageItem[]
  ): productDetails => {
    const totalWeight =
      item.chambers?.reduce(
        (sum: number, chamber: any) => sum + (Number(chamber.quantity) || 0),
        0
      ) ?? 0;

    const chamberCount = item.chambers?.length || 0;

    const description = `${totalWeight} Kg from ${chamberCount} chamber${
      chamberCount !== 1 ? "s" : ""
    }`;

    const allPackages = packages || [];
    const packageStrings = allPackages.map(
      (pkg: PackageItem) =>
        `${pkg.quantity} package of ${pkg.size}${pkg.unit}`
    );
    const packagesSentence = packageStrings.join(", ");

    const price = `${amount} Rs`;

    return {
      title: (item as any).name,
      image: (item as any).image ?? "",
      description,
      // packagesSentence,
      weight: `${totalWeight} Kg`,
      // price,
      // packages: allPackages,
      // chambers: (item as any).chambers,
    };
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
        date: deliveredDate
          ? formatDate(deliveredDate, "MMM dd, yyyy")
          : "N/A",
        icon: <StoreIcon size={36} color={getColor("light")} />,
      },
    ];
    return data;
  },
};

// ---- Categorize + map into UI-friendly structures ----
const categorizeOrders = (order: DispatchOrder) => {
  const orderDetails: OrderProps = formatOrder.orderDetails(order);
  const summaryData: SummaryItem[] = formatOrder.summaryData(order);
  const products: productDetails[] = [];

  // Based on your TS error, DispatchOrder has "package", not "packages"
  const orderPackages: PackageItem[] = (order as any).package ?? [];

  order.products?.forEach((element: DispatchOrder["products"][number]) => {
    products.push(
      formatOrder.products(
        element,
        String(order.amount ?? ""),
        orderPackages
      )
    );
  });

  return { orderDetails, products, summaryData };
};

const CompletedOrderDetailScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { orderId } = useParams("dispatch-summary", "orderId");
  const { data: orderData, isLoading: ordersLoading } = useOrderById(orderId!);
  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  // While order is loading or missing, show loader
  if (ordersLoading || !orderData) {
    return (
      <View style={styles.pageContainer}>
        <PageHeader page={"Order"} />
        <View style={styles.wrapper}>
          <Loader />
        </View>
      </View>
    );
  }

  const { orderDetails, products, summaryData } = categorizeOrders(
    orderData as DispatchOrder
  );

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

  const hasImages =
    Array.isArray((orderData as any).sample_images) &&
    (orderData as any).sample_images.length > 0;

  const firstImage = hasImages ? (orderData as any).sample_images[0] : "";
  const firstExt = firstImage ? firstImage.split(".").pop() : "jpg";
  const remainingCount = hasImages
    ? Math.max(0, (orderData as any).sample_images.length - 1)
    : 0;

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Order"} />
      <View style={styles.wrapper}>
        <BackButton label="Order details" backRoute="sales" />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ gap: 24 }}>
            <SupervisorOrderDetailsCard order={orderDetails} />

            {hasImages && (
              <View style={styles.receipt}>
                <View style={[styles.row, styles.gap12]}>
                  <FileIcon />
                  <B2>
                    {`Challan_1.${firstExt}` +
                      (remainingCount > 0
                        ? ` + ${remainingCount} more`
                        : "")}
                  </B2>
                </View>
                <Pressable
                  onPress={() =>
                    handleOpenChallanViewer(
                      (orderData as any).sample_images as string[]
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
      </View>
            {isLoading && <OverlayLoader />}
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