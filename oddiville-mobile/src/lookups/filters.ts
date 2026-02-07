import { isToday, isAfter, subDays, subHours, startOfDay } from "date-fns";

export const filterHandlers: Record<
  string,
  (item: any, subKey: string, selected: string[]) => boolean
> = {
  "raw-material:overview": (item, subKey, selected) => {
    if (subKey === "Name") {
      if (selected.includes("All")) return true;
      return (
        selected.length === 0 ||
        selected.some((sel) => item.name?.toLowerCase() === sel.toLowerCase())
      );
    }
    return true;
  },
  "raw-material:detailed": (item, subKey, selected) => {
    if (subKey === "Name") {
      return (
        selected.length === 0 ||
        selected.some((sel) => item.name?.toLowerCase() === sel.toLowerCase())
      );
    }
    if (subKey === "Category") {
      return (
        selected.length === 0 ||
        selected.some(
          (sel) => item.category?.toLowerCase() === sel.toLowerCase(),
        )
      );
    }
    return true;
  },
  "chamber:detailed": (item, subKey, selected) => {
    if (!selected || selected.length === 0) return true;

    const cat = (item.category ?? "").toLowerCase();

    if (subKey === "Material") {
      return cat === "material";
    }

    if (subKey === "Others") {
      return cat === "other";
    }

    if (subKey === "Packed") {
      return cat === "packed";
    }

    return true;
  },

  "home:activities": (item, _, selected) => {
    if (!selected || !item.createdAt) return true;

    const selectedValues = Array.isArray(selected)
      ? selected
      : Object.keys(selected);

    if (selectedValues.length === 0) return true;

    const itemDate = new Date(item.createdAt);
    if (isNaN(itemDate.getTime())) return false;

    const now = new Date();

    if (selectedValues.includes("Last 6 hours")) {
      return isAfter(itemDate, subHours(now, 6));
    }

    if (selectedValues.includes("Today")) {
      return isToday(itemDate);
    }

    if (selectedValues.includes("Last 7 days")) {
      const cutoff = startOfDay(subDays(now, 7));
      return isAfter(itemDate, cutoff);
    }

    if (selectedValues.includes("Last 30 days")) {
      return isAfter(itemDate, subDays(now, 30));
    }

    return true;
  },
};
