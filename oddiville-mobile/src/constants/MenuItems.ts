import ContractorIcon from "../components/icons/bottom-bar/ContractorIcon";
import OrderIcon from "../components/icons/bottom-bar/OrderIcon";
import ProductionIcon from "../components/icons/bottom-bar/ProductionIcon";
import PurchaseIcon from "../components/icons/bottom-bar/PurchaseIcon";
import WarehouseIcon from "../components/icons/bottom-bar/WarehouseIcon";
import PackagingIcon from "../components/icons/menu/PackagingIcon";
import ShopIcon from "../components/icons/menu/ShopIcon";
import UserIcon from "../components/icons/menu/UserIcon";
import TruckIcon from "../components/icons/page/TruckIcon";
import { menuItemsProps } from "../types";

export const MENU_ITEMS: menuItemsProps[] = [
    {
        name: "Chambers",
        icon: WarehouseIcon,
        href: "chambers"
    },
    {
        name: "Vendors",
        icon: ShopIcon,
        href: "vendor-orders"
    },
     {
        name: "Users",
        icon: UserIcon,
        href: "user"
    },
    {
        name: "Trucks",
        icon: TruckIcon,
        href: "trucks"
    },
    {
        name: "Labours",
        icon: ContractorIcon,
        href: "labours"
    },
]

export const CHAMBERS_MENU_ITEMS: menuItemsProps[] = [
  {
    name: "Chambers",
    icon: WarehouseIcon,
    href: "chambers",
  },
];

export const PURCHASE_MENU_ITEMS: menuItemsProps[] = [
  {
    name: "Purchase",
    icon: PurchaseIcon,
    href: "policies/purchase",
  },
];

export const PRODUCTION_MENU_ITEMS: menuItemsProps[] = [
  {
    name: "Production",
    icon: ProductionIcon,
    href: "policies/production",
  },
];

export const PACKAGE_MENU_ITEMS: menuItemsProps[] = [
  {
    name: "Package",
    icon: PackagingIcon,
    href: "policies/package",
  },
];

export const DISPATCH_MENU_ITEMS: menuItemsProps[] = [
    {
        name: "Sales",
        icon: OrderIcon,
        href: "policies/sales"
    },
]
export const TRUCKS_MENU_ITEMS: menuItemsProps[] = [
    {
        name: "Trucks",
        icon: TruckIcon,
        href: "trucks"
    },
]
export const LABOURS_MENU_ITEMS: menuItemsProps[] = [
     {
        name: "Labours",
        icon: ContractorIcon,
        href: "labours"
    },
]

// export const DISPATCH_MENU_EDIT_ITEMS: menuItemsProps[] = [
//       {
//         name: "Sales Edit",
//         icon: OrderIcon,
//         href: "sales"
//     },
//     {
//         name: "Manage Trucks",
//         icon: TruckIcon,
//         href: "trucks"
//     },
// ]

// {
//     name: "Packaging Material",
//     icon: PackagingIcon,
//     href: "packaging"
// },

// {
//     name: "Supervisor View",
//     icon: WarehouseIcon,
//     href: "purchase"
// },

export const SUPERVISOR_VIEW_MENU_ITEMS: menuItemsProps[] = [
    {
        name: "Chamber",
        icon: WarehouseIcon,
        href: "chambers"
    },
    {
        name: "Packaging",
        icon: PackagingIcon,
        href: "packaging"
    },
    {
        name: "Manage Trucks",
        icon: TruckIcon,
        href: "trucks"
    },
    {
        name: "Admin View",
        icon: UserIcon,
        href: "home"
    },
]
export const SUPERVISOR_MENU_ITEMS: menuItemsProps[] = [
    {
        name: "Chamber",
        icon: WarehouseIcon,
        href: "packaging"
    },
    {
        name: "Packaging",
        icon: PackagingIcon,
        href: "packaging"
    },
    {
        name: "Manage Trucks",
        icon: TruckIcon,
        href: "trucks"
    },
]