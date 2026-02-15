// 1. React and React Native core
import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// 2. Third-party dependencies
// no imports

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import Tabs from "@/src/components/ui/Tabs";
import Loader from "@/src/components/ui/Loader";
import Modal from "@/src/components/ui/modals/Modal";
import Alert from "@/src/components/ui/Alert";
import Input from "@/src/components/ui/Inputs/Input";
import UpComingOrders from "@/src/components/ui/dispatch-order/UpComingOrders";
import InProgressOrders from "@/src/components/ui/dispatch-order/InProgressOrders";
import CompletedOrders from "@/src/components/ui/dispatch-order/CompletedOrders";

// 4. Project hooks
import { useOrders } from "@/src/hooks/dispatchOrder";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";

// 6. Types
import { ActivityProps, DispatchOrderList } from "@/src/types";
import {
  OrderBucketAdders,
  orderStatusHandlers,
} from "@/src/lookups/orderCategory";
import Button from "@/src/components/ui/Buttons/Button";
import { H3 } from "@/src/components/typography/Typography";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { maskCurrency } from "@/src/utils/maskUtils";
import { formatAmount } from "@/src/utils/common";
import { useAppCapabilities } from "@/src/hooks/useAppCapabilities";
import Require from "@/src/components/authentication/Require";
import OverlayLoader from "@/src/components/ui/OverlayLoader";

const categorizeOrders = (
  orders: DispatchOrderList
): {
  upComingOrders: ActivityProps[];
  inProgressOrders: ActivityProps[];
  completedOrders: ActivityProps[];
} => {
  const upComingOrders: ActivityProps[] = [];
  const inProgressOrders: ActivityProps[] = [];
  const completedOrders: ActivityProps[] = [];

  if (!Array.isArray(orders)) {
    console.warn("Orders is not an array:", orders);
    return { upComingOrders, inProgressOrders, completedOrders };
  }

  const adders: OrderBucketAdders = {
    upComingOrdersAdd: (item) => upComingOrders.push(item),
    inProgressOrdersAdd: (item) => inProgressOrders.push(item),
    completedOrdersAdd: (item) => completedOrders.push(item),
  };

  orders.forEach((order) => {
    if (!order || !order.id) {
      console.warn("Invalid order found:", order);
      return;
    }
    try {
      const handler = orderStatusHandlers[order.status];
      if (handler) {
        handler(order, adders);
      } else {
        console.warn(
          "Unknown order status:",
          order.status,
          "for order:",
          order.id
        );
      }
    } catch (error) {
      console.error("Error formatting order:", order.id, error);
    }
  });

  return { upComingOrders, inProgressOrders, completedOrders };
};

const SalesSectionHeader = ({
  canEdit,
  onAdd,
}: {
  canEdit: boolean;
  onAdd: () => void;
}) => (
  <View
    style={[
      styles.HStack,
      styles.justifyBetween,
      styles.alignCenter,
      { paddingTop: 16 },
    ]}
  >
    <H3>Create Dispatch Order</H3>
    {canEdit && (
      <Button
        variant="outline"
        size="md"
        onPress={onAdd}
      >
        Create
      </Button>
    )}
  </View>
);

const SalesScreen = () => {
  const { goTo } = useAppNavigation();
  const caps = useAppCapabilities();

  const canSeeFinancialData = caps.isAdmin;

  const {
    data: orderData,
    isFetching: ordersLoading,
    error,
    refetch,
  } = useOrders();
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelOrderModal, setIsCancelOrderModal] = useState(false);

  const secureOrders = useMemo(() => {
    if (!orderData) return [];

    return orderData.map(order => ({
      ...order,

      amount: order.amount,

      amountLabel: canSeeFinancialData
        ? formatAmount(Number(order.amount))
        : maskCurrency(order.amount),
    }));
  }, [orderData, canSeeFinancialData]);

  const categorizedOrders = useMemo(
    () => categorizeOrders(secureOrders),
    [secureOrders]
  );

  const { upComingOrders, inProgressOrders, completedOrders } =
    categorizedOrders;

  if (error) {
    console.error("Error loading orders:", error);
  }

  const showLoader = ordersLoading && orderData === undefined;

  return (
  <Require view="sales">
        <View style={styles.pageContainer}>
        <PageHeader page="Dispatch" />
        <View style={styles.wrapper}>
          <Tabs
            tabTitles={["Upcoming", "In-progress", "Completed"]}
            color="green"
            style={styles.flexGrow}
          >
            <View style={styles.flexGrow}>
              <SalesSectionHeader canEdit={caps.sales.edit} onAdd={() => goTo("create-orders")} />

              <UpComingOrders data={upComingOrders} />
            </View>
            <View style={styles.flexGrow}>
              <SalesSectionHeader canEdit={caps.sales.edit} onAdd={() => goTo("create-orders")} />

              <InProgressOrders data={inProgressOrders} />
            </View>
            <View style={styles.flexGrow}>
              <SalesSectionHeader canEdit={caps.sales.edit} onAdd={() => goTo("create-orders")} />

              <CompletedOrders data={completedOrders} />
            </View>
          </Tabs>
        </View>
          {showLoader && <OverlayLoader /> }
        <Modal
          showPopup={isCancelOrderModal}
          setShowPopup={setIsCancelOrderModal}
          markdown={{ description: ["\u201cVikram Patel\u201d"] }}
          modalData={{
            title: "Cancel order",
            description:
              "Are you sure you want to cancel \u201cVikram Patel\u201d order ",
            buttons: [
              { label: "Cancel", variant: "outline" },
              { label: "Order cancel", variant: "fill" },
            ],
            extraDetails: (
              <>
                <Alert text="This action can't be undo." />
                <Input
                  mask="textarea"
                  value=""
                  onChangeText={() => { }}
                  placeholder="Reason"
                />
              </>
            ),
          }}
        />
      </View>
  </Require>
  );
};

export default SalesScreen;

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
  },
  flexGrow: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.1),
    zIndex: 2,
  },
  HStack: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  gap8: {
    gap: 8,
  },
});