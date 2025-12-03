import WarehouseIcon from "../components/icons/bottom-bar/WarehouseIcon";
import CarrotIcon from "../components/icons/menu/CarrotIcon";
import HeadphoneIcon from "../components/icons/menu/HeadphoneIcon";
import PackagingIcon from "../components/icons/menu/PackagingIcon";
import ShopIcon from "../components/icons/menu/ShopIcon";
import UserIcon from "../components/icons/menu/UserIcon";
import TruckIcon from "../components/icons/page/TruckIcon";
import { menuItemsProps } from "../types";

export const MENU_ITEMS: menuItemsProps[] = [
    {
        name: "Raw Material",
        icon: CarrotIcon,
        href: "raw-material-overview"
        // href: "rawMaterial"
    },
    {
        name: "Vendors",
        icon: ShopIcon,
        href: "vendor-orders"
    },
    {
        name: "Packaging Material",
        icon: PackagingIcon,
        href: "packaging"
    },
    {
        name: "Users",
        icon: UserIcon,
        href: "user"
    },
    {
        name: "Supervisor View",
        icon: WarehouseIcon,
        href: "supervisor-raw-material"
    },
]

export const SUPERVISOR_VIEW_MENU_ITEMS: menuItemsProps[] = [
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
    {
        name: "Admin View",
        icon: UserIcon,
        href: "admin-home"
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