import { B6, H4, H6, SubHeadingV2 } from "@/src/components/typography/Typography";
import WarningIcon from "@/src/components/icons/page/WarningIcon"
import ErrorIcon from "@/src/components/icons/page/ErrorIcon"
import { differenceInDays, differenceInMonths, differenceInYears, format, isValid, parseISO } from "date-fns";
import PaperRollIcon from '../components/icons/packaging/PaperRollIcon'
import BagIcon from "../components/icons/packaging/BagIcon";
import BigBagIcon from "../components/icons/packaging/BigBagIcon";
import { PackageItem } from "../types";
import { PackingPackages } from "../types/domain/packing/packing.types";

export function findPadding(size: string | undefined) {
    switch (size) {
        case "xs":
            return { paddingHorizontal: 4, paddingVertical: 1 };
        case "sm":
            return { paddingHorizontal: 4, paddingVertical: 2 };
        case "md":
            return { paddingHorizontal: 6, paddingVertical: 4 };
        case "lg":
            return { paddingHorizontal: 8, paddingVertical: 6 };
        case "xl":
            return { paddingHorizontal: 10, paddingVertical: 8 };
        default:
            return { paddingHorizontal: 8, paddingVertical: 6 };
    }
}


export function findBtnPadding(size: string | undefined) {
    switch (size) {
        case "sm":
            return { paddingHorizontal: 4, paddingVertical: 4 };
        case "md":
            return { paddingHorizontal: 8, paddingVertical: 8 };
        case "lg":
            return { paddingHorizontal: 10, paddingVertical: 10 };
        case "xl":
            return { paddingHorizontal: 20, paddingVertical: 12 };
        case "icon":
            return { paddingHorizontal: 6, paddingVertical: 6 };
        default:
            return { paddingHorizontal: 10, paddingVertical: 10 };
    }
}

export function findCtaText(text: string) {
    switch (text) {
        case "order-raw":
            return "Order raw material"
        case "create-product":
            return "Create product"
        case "ship-order":
            return "Shipped order"
        default:
            return "Order raw material"
    }
}

export function isValidRole(role: any): role is "superadmin" | "admin" | "supervisor" {
    return ["superadmin", "admin", "supervisor"].includes(role);
}


export function findLinkButtonSize(size: string | undefined) {
    switch (size) {
        case "sm":
            return { component: B6 };
        case "md":
            return { component: H6 };
        case "lg":
            return { component: H4 };
        case "xl":
            return { component: SubHeadingV2 };
        default:
            return { component: H6 };
    }
}

export const statusBaseIcon = (status: "success" | "warning" | "danger") => {
    console.log("status", status);

    switch (status) {
        case "success":
            return null
        case "warning":
            return { Component: WarningIcon }
        case "danger":
            return { Component: ErrorIcon }
        default:
            return { Component: WarningIcon }
    }
}

export const formatTimeDifference = (startDate: Date, endDate: Date): string => {
    const years = differenceInYears(endDate, startDate);
    if (years > 0) return `${years} ${years === 1 ? "year" : "years"}`;

    const months = differenceInMonths(endDate, startDate);
    if (months > 0) return `${months} ${months === 1 ? "month" : "months"}`;

    const days = differenceInDays(endDate, startDate);
    return `${days} ${days === 1 ? "day" : "days"}`;
};

export type PackageIconInput = {
  size: number | string;
  unit?: "kg" | "gm" | "qn" | "unit";
};

export const mapPackageIcon = (item: PackageIconInput) => {
  const size = Number(item.size);
  if (Number.isNaN(size)) return null;

  let grams = size;

  switch (item.unit) {
    case "kg":
      grams = size * 1000;
      break;
    case "gm":
      grams = size;
      break;
    case "qn":
      grams = size * 100_000; // 1 quintal = 100kg
      break;
    default:
      return null;
  }

  if (grams <= 250) return PaperRollIcon;
  if (grams <= 500) return BagIcon;
  return BigBagIcon;
};


export const toPackageIconInput = (
  pkg: Pick<PackageItem, "size" | "unit">,
): PackageIconInput => ({
  size: Number(pkg.size),
  unit: (pkg.unit ?? "unit") as "kg" | "gm" | "unit",
});


// export const toPackageIconInput = (pkg: PackageItem): PackageIconInput => ({
//   size: Number(pkg.size),
//   unit: pkg.unit as "kg" | "gm" | "qn",
// });

export function kConverter(num: number): string {
    if (num >= 1000) {
        return (num / 1000).toString().replace(/\.0$/, '') + 'k';
    }
    return num.toString();
}

export function generateImageFileName(extension: string) {
    const prefix = Math.random().toString(36).substring(2, 8); // random string
    const mid = Math.random().toString(36).substring(2, 5);    // shorter random
    const suffix = Math.floor(Math.random() * 100000000);    // 10-digit number
    return `${prefix}-${mid}-${suffix}.${extension}`;
}

export const customDateFormatter = (rawDate: Date) => {
    const parsedDate = typeof rawDate === 'string' ? parseISO(rawDate) : new Date(rawDate);

    return isValid(parsedDate)
        ? format(parsedDate, 'd MMM yyyy')
        : 'N/A';
}

export function getEmptyStateData(listKey: string) {
    switch (listKey) {
        case "alerts":
            return { title: "No Alerts Found", description: "No Active Alerts right now!" };
        case "recent_activities":
            return { title: "No Recent Activities Found", description: "No Active Recent Activities right now!" };
        case "today":
            return { title: "No Today Activities Found", description: "No Today's Activities right now!" };
        case "vendor-order":
            return { title: "No Vendor RM orders Found", description: "No  Vendor RM orders right now!" };
        case "no-chamber-stock":
            return { title: "No Chamber stock Found", description: "Your chamber is empty!" };
        case "products":
            return { title: "No Products Found", description: "You have no products!" };
        case "packaging-details":
            return { title: "No Packaging Details Found", description: "You have no packages for this product!" };
        case "raw-material-overview":
            return { title: "No Products Found", description: "You have no products!" };
        case "no-raw-material":
            return { title: "No Products Found", description: "You have no products!" };
        case "no-order-pending":
            return { title: "No Order Pending", description: "No raw material orders!" };
        case "production":
            return { title: "Nothing for production", description: "You have 0 items in production!" };
        case "lanes":
            return { title: "No Lanes Found", description: "You have 0 lanes!" };
        case "global_search":
            return { title: "No search Found", description: "No search result Found!" };
        case "truck_details":
            return { title: "No trucks Found", description: "No trucks available!" };
        case "stock-detail":
            return { title: "No Stock Found", description: "No Stock available!" };

        default:
            return { title: "No active batches", description: "No active batches right now. Enjoy the calm!" };
    }
}

export function getRatingColor(rating: 1 | 2 | 3 | 4 | 5) {
    switch (rating) {
        case 5:
            return "green";
        case 4:
            return "blue";
        case 3:
            return "blue";
        case 2:
            return "yellow";
        case 1:
            return "red";
        default:
            return "red";
    }
}

export function formatAmount(
    amount: number,
    overloadOptions?: {
        unit: "rs" | "lakh" | "crore";
    }
) {
    let format = "Rs"
    if (overloadOptions?.unit === "rs") {
        format = "Rs"
    } else if (overloadOptions?.unit === "lakh") {
        format = "Lakh"
    } else if (overloadOptions?.unit === "crore") {
        format = "Crore"
    } else {
        format = "Rs"
    };

    if (amount < 100000) {
        return `${amount} ${format}`;
    } else {
        const lakhValue = (amount / 100000).toFixed(2);
        const cleanLakhValue = lakhValue.replace(/\.?0+$/, '');
        return `${cleanLakhValue} lakh`;
    }
}

export function formatWeight(weightInKg: number) {
    const formatValue = (value: number) => {
        if (typeof value !== "number" || isNaN(value)) {
            return "0.00";
        }
        return Number(value.toFixed(2)).toString();
    };

    if (weightInKg >= 1000) {
        return `${formatValue(weightInKg / 1000)} ton`;
    } else {
        return `${formatValue(weightInKg)} kg`;
    }
}

export function splitValueAndUnit(input: string) {
    const match = input.trim().match(/^([\d.,]+)\s*([a-zA-Z]+)$/);

    if (!match) {
        throw new Error("Invalid format. Expected a number followed by a unit.");
    }

    const number = parseFloat(match[1].replace(',', ''));
    const unit = match[2].toLowerCase();

    return { number, unit };
}

export function getStatusDescription(
    isOccupied: boolean,
    updatedAt: string | number | Date
): string {
    const now = new Date();
    const updatedDate = new Date(updatedAt);
    const diffMs = now.getTime() - updatedDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let timeStr: string = '';

    if (diffMinutes < 60) {
        timeStr = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        timeStr = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (
        updatedDate.toDateString() ===
        new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()
    ) {
        timeStr = 'yesterday';
    } else {
        timeStr = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    return isOccupied
        ? `Production started ${timeStr}`
        : `Vacant since ${timeStr}`;
}


export function computeCurrentValue(key: string, raw: string | false, chamberRating: string, placeholder_second: string, productionPackageType: string) {
    if (!!raw && typeof raw === 'string' && raw.trim() !== '') {
        if (key === 'add-raw-material') return raw;
        if (key === 'supervisor-production') return chamberRating || raw;
        if (key === 'select-package-type') return productionPackageType || raw;
        return raw;
    }
    return placeholder_second || 'Select';
}
