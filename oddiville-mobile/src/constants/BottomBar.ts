import HomeIcon from "@/src/components/icons/bottom-bar/HomeIcon";
import HomeActiveIcon from "@/src/components/icons/bottom-bar/HomeActiveIcon";
import WarehouseIcon from "@/src/components/icons/bottom-bar/WarehouseIcon";
import WarehouseIconActive from "@/src/components/icons/bottom-bar/WarehouseActiveIcon";
import { BottomBarProps } from "@/src/types";
import OrderIcon from "@/src/components/icons/bottom-bar/OrderIcon";
import OrderIconActive from "@/src/components/icons/bottom-bar/OrderActiveIcon";
import ProductionIcon from "@/src/components/icons/bottom-bar/ProductionIcon";
import ProductionActiveIcon from "../components/icons/bottom-bar/ProductionActiveIcon";
import RawMaterialIcon from "../components/icons/bottom-bar/RawMaterialIcon";
import RawMaterialActiveIcon from "../components/icons/bottom-bar/RawMaterialActiveIcon";
import ContractorIcon from "../components/icons/bottom-bar/ContractorIcon";
import ContractorActiveIcon from "../components/icons/bottom-bar/ContractorActiveIcon";

export const BOTTOM_BAR_ITEMS: BottomBarProps = [
  {
    name: "Home",
    component: "home",
    icon: HomeIcon,
    activeIcon: HomeActiveIcon,
  },
    {
    name: "Purchase",
    component: "purchase",
    icon: WarehouseIcon,
    activeIcon: WarehouseIconActive,
  },
    {
    name: "Production",
    component: "production",
    icon: ProductionIcon,
    activeIcon: ProductionActiveIcon,
  },
  {
    name: "Package",
    component: "package",
    icon: ProductionIcon,
    activeIcon: ProductionActiveIcon,
  },
  {
    name: "Sales",
    component: "sales",
    icon: OrderIcon,
    activeIcon: OrderIconActive,
  },
];

export const BOTTOM_BAR_ITEMS_ADMIN: BottomBarProps = [
  {
    name: "Home",
    component: "home",
    icon: HomeIcon,
    activeIcon: HomeActiveIcon,
  },
  {
    name: "Dispatch",
    component: "admin-orders",
    icon: OrderIcon,
    activeIcon: OrderIconActive,
  },
  {
    name: "Chambers",
    component: "admin-chambers",
    icon: WarehouseIcon,
    activeIcon: WarehouseIconActive,
  },
  {
    name: "Production",
    component: "admin-production",
    icon: ProductionIcon,
    activeIcon: ProductionActiveIcon,
  },
];

export const BOTTOM_BAR_ITEMS_SUPERVISOR: BottomBarProps = [
  {
    name: "Raw Material",
    component: "supervisor-raw-material",
    icon: RawMaterialIcon,
    activeIcon: RawMaterialActiveIcon,
  },
  {
    name: "Orders",
    component: "supervisor-orders",
    icon: OrderIcon,
    activeIcon: OrderIconActive,
  },
  {
    name: "Production",
    component: "supervisor-production",
    icon: ProductionIcon,
    activeIcon: ProductionActiveIcon,
  },
  {
    name: "Labour",
    component: "supervisor-contractor",
    icon: ContractorIcon,
    activeIcon: ContractorActiveIcon,
  },
];
