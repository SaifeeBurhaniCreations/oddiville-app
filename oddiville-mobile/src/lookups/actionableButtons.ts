import { BottomSheetSchemaKey } from "../schemas/BottomSheetSchema";

export const actionableButtons: Partial<
  Record<
    | BottomSheetSchemaKey
    | "lane-empty"
    | "low-chamber-stock"
    | "low-package-stock",
    {
      text: string;
      key: string;
    }
  >
> = {
  "order-ready": {
    text: "Shipped order",
    key: "ship-order",
  },
  "lane-empty": {
    text: "Send alert to manager",
    key: "alert-to-manager",
  },
  "low-chamber-stock": {
    text: "Order raw material",
    key: "order-raw-material",
  },
  "production-completed": {
    text: "Create dispatch",
    key: "create-order",
  },
  "low-package-stock": {
    text: "Create Package",
    key: "package-comes-to-end",
  },
};
