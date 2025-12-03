import { formatDistanceToNow, differenceInSeconds, differenceInCalendarDays, format, parseISO, isValid as isDateValid } from "date-fns";

export const formatTimeAgo = (date: Date) => {
    const seconds = differenceInSeconds(new Date(), date);

    if (seconds < 60) {
        return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
    }

    return formatDistanceToNow(date, { addSuffix: true });
};

export const formatDateAgo = (date: Date) => {
  const days = differenceInCalendarDays(new Date(), date);

  if (days === 0) {
    return formatTimeAgo(date);
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return format(date, "d MMM yyyy");
};



export function customTimeAgo(date: Date | string) {
    const now = new Date();
    const target = new Date(date);
    const seconds = differenceInSeconds(now, target);
  
    if (seconds < 60) {
      return `${seconds} sec ago`;
    }
  
    return formatDistanceToNow(target, { addSuffix: true });
  }

  export const formatDateForDisplay = (dateValue: any): string => {
    if (!dateValue) return "";
  
    try {
      let date: Date;
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        date = parseISO(dateValue);
      } else {
        return "";
      }
  
      return isDateValid(date) ? format(date, "MMM d, yyyy") : "";
    } catch (error) {
      console.warn("Date formatting error:", error);
      return "";
    }
  };

  export const parseValidDate = (date: string | undefined | null): Date => {
    const parsed =
      date && !isNaN(Date.parse(date)) ? new Date(date) : new Date();
    return parsed;
  };