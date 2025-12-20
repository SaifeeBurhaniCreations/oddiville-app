import BoxIcon from "@/src/components/icons/common/BoxIcon";
import CashIcon from "@/src/components/icons/page/CashIcon";
import CalandarCheckIcon from "@/src/components/icons/page/calandarCheck";
import WarehouseIcon from "@/src/components/icons/page/WarehouseIcon";
import StoreIcon from "@/src/components/icons/common/StoreIcon";
import { ActivityProps, DispatchOrder } from "@/src/types";
import { formatAmount, formatTimeDifference } from "@/src/utils/common";
import { differenceInDays, formatDate, isValid as isValidDate } from "date-fns";
import { getColor } from "../constants/colors";

const safeFormatDate = (date: any, format: string = "dd-MM-yy"): string => {
  if (!date) return "N/A";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (!isValidDate(parsedDate)) {
    return "Invalid Date";
  }

  try {
    return formatDate(parsedDate, format);
  } catch (error) {
    console.warn("Error formatting date:", date, error);
    return "Invalid Date";
  }
};

const safeDateDifference = (endDate: any, startDate: any): number => {
  if (!endDate || !startDate) return 0;

  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;

  if (!isValidDate(end) || !isValidDate(start)) {
    return 0;
  }

  try {
    return differenceInDays(end, start);
  } catch (error) {
    console.warn(
      "Error calculating date difference:",
      { endDate, startDate },
      error
    );
    return 0;
  }
};
export const formatOrder = {
  upcoming: (order: DispatchOrder): ActivityProps => ({
    id: order.id,
    itemId: order.id,
    title: order.customer_name || "Unknown Customer",
    sideDetails: {
      name: "Products",
      value: Array.isArray(order.products) ? order.products?.length : 0,
      icon: <BoxIcon size={16} />,
    },
    bottomDetails: [
      // {
      //   name: "Amount",
      //   value: order.amountLabel ? order.amountLabel : `${formatAmount(Number(order.amount), { unit: "rs" })}`,
      //   icon: <CashIcon size={16} />,
      // },
      {
        name: "Est Dis",
        value: safeFormatDate(order.est_delivered_date),
        icon: <CalandarCheckIcon size={16} />,
      },
    ],
    extra_details: [order.address || "No address provided"],
    identifier: "order-ready",
  }),

  inProgress: (order: DispatchOrder): ActivityProps => {
    const daysLeft = safeDateDifference(
      order.est_delivered_date,
      order.dispatch_date
    );
    return {
      id: order.id,
      itemId: order.id,
      title: order.customer_name || "Unknown Customer",
      dateDifference: `${Math.max(0, daysLeft)} days left`,
      sideDetails: {
        name: "Products",
        value: Array.isArray(order.products) ? order.products?.length : 0,
        icon: <BoxIcon size={16} />,
      },
      bottomDetails: [
        // {
        //   name: "Amount",
        //   value: order.amountLabel ? order.amountLabel : `${formatAmount(Number(order.amount), { unit: "rs" })}`,
        //   icon: <CashIcon size={16} />,
        // },
        {
          name: "Est Dis",
          value: safeFormatDate(order.est_delivered_date),
          icon: <CalandarCheckIcon size={16} />,
        },
      ],
      dispatchDetails: [
        {
          value: safeFormatDate(order.dispatch_date),
          icon: <WarehouseIcon color={getColor("light")} />,
        },
        {
          value: safeFormatDate(order.est_delivered_date),
          icon: <StoreIcon color={getColor("green", 200)} />,
        },
      ],
      extra_details: [order.address || "No address provided"],
      identifier: "order-shipped",
    };
  },

  completed: (order: DispatchOrder): ActivityProps => {
    let timeTaken = "N/A";
    try {
      if (order.dispatch_date && order.delivered_date) {
        const dispatchDate =
          typeof order.dispatch_date === "string"
            ? new Date(order.dispatch_date)
            : order.dispatch_date;

        const deliveredDate =
          typeof order.delivered_date === "string"
            ? new Date(order.delivered_date)
            : order.delivered_date;

        if (isValidDate(dispatchDate) && isValidDate(deliveredDate)) {
          timeTaken = formatTimeDifference(dispatchDate, deliveredDate);
        }
      }
    } catch (error) {
      console.warn(
        "Error calculating time difference for completed order:",
        order.id,
        error
      );
    }

    return {
      id: order.id,
      itemId: order.id,
      identifier: null,
      title: order.customer_name || "Unknown Customer",
      dateDifference: timeTaken,
      sideDetails: {
        name: "Products",
        value: Array.isArray(order.products) ? order.products?.length : 0,
        icon: <BoxIcon size={16} />,
      },
      // bottomDetails: [
      //   // {
      //   //   name: "Amount",
      //   //   value: order.amountLabel ? order.amountLabel : `${formatAmount(Number(order.amount), { unit: "rs" })}`,
      //   // },
      //   {
      //     name: "Est Dis",
      //     value: safeFormatDate(order.delivered_date),
      //     icon: <CalandarCheckIcon size={16} />,
      //   },
      // ],
      dispatchDetails: [
        {
          value: safeFormatDate(order.dispatch_date),
          icon: <WarehouseIcon color={getColor("light")} />,
        },
        {
          value: safeFormatDate(order.delivered_date),
          icon: <StoreIcon color={getColor("light")} />,
        },
      ],
      params: { orderId: order.id },
      extra_details: [order.address || "No address provided"],
      href: "completed-order-detail",
    };
  },
};

export type OrderBucketAdders = {
  upComingOrdersAdd: (o: ReturnType<typeof formatOrder.upcoming>) => void;
  inProgressOrdersAdd: (o: ReturnType<typeof formatOrder.inProgress>) => void;
  completedOrdersAdd: (o: ReturnType<typeof formatOrder.completed>) => void;
};

export const orderStatusHandlers: Record<
  string,
  (order: DispatchOrder, adders: OrderBucketAdders) => void
> = {
  pending: (order, { upComingOrdersAdd }) =>
    upComingOrdersAdd(formatOrder.upcoming(order)),
  "in-progress": (order, { inProgressOrdersAdd }) =>
    inProgressOrdersAdd(formatOrder.inProgress(order)),
  completed: (order, { completedOrdersAdd }) =>
    completedOrdersAdd(formatOrder.completed(order)),
};
