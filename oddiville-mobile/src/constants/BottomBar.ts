import { Dimensions } from "react-native";

import { BottomBarProps } from "@/src/types";
import OrderIcon from "@/src/components/icons/bottom-bar/OrderIcon";
import OrderIconActive from "@/src/components/icons/bottom-bar/OrderActiveIcon";
import ProductionIcon from "@/src/components/icons/bottom-bar/ProductionIcon";
import ProductionActiveIcon from "@/src/components/icons/bottom-bar/ProductionActiveIcon";
import PackagingIcon from "@/src/components/icons/bottom-bar/PackagingIcon";
import PackagingActiveIcon from "@/src/components/icons/bottom-bar/PackagingActiveIcon";
import PurchaseIcon from "@/src/components/icons/bottom-bar/PurchaseIcon";
import PurchaseActiveIcon from "@/src/components/icons/bottom-bar/PurchaseActiveIcon";

const { width } = Dimensions.get("screen");
const isSmallDevice = width <= 360;

export const BOTTOM_BAR_ITEMS: BottomBarProps = [
  {
    name: isSmallDevice ? "Buy" : "Purchase",
    component: "purchase",
    icon: PurchaseIcon,
    activeIcon: PurchaseActiveIcon,
  },
  {
    name: isSmallDevice ? "Prod" : "Production",
    component: "production",
    icon: ProductionIcon,
    activeIcon: ProductionActiveIcon,
  },
  {
    name: isSmallDevice ? "Pack" : "Packing",
    component: "package",
    icon: PackagingIcon,
    activeIcon: PackagingActiveIcon,
  },
  {
    name: isSmallDevice ? "Ship" : "Dispatch",
    component: "sales",
    icon: OrderIcon,
    activeIcon: OrderIconActive,
  },
];