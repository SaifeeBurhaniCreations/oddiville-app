// import SoupIcon from "../components/icons/common/SoupIcon";
import CarrotIcon from "../components/icons/menu/CarrotIcon";
import Calendar12Icon from "../components/icons/page/Calendar12Icon";
import ParcelIcon from "../components/icons/page/ParcelIcon";
import { FebItemsProps } from "../types";

export const FAB_ITEMS: FebItemsProps[] = [
    {
        text: "Order raw material",
        icon: CarrotIcon,
        href:'raw-material-order'
    },
    {
        text: "Create Dispatch",
        icon: ParcelIcon,
        href: 'create-orders'
    },
    {
        text: "Calendar",
        icon: Calendar12Icon,
        href: 'calendar'
    },

]