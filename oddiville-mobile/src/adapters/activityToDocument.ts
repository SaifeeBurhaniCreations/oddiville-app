import { SearchDocument } from "@/src/types/search/searchDocument";

import type { SearchActivityProps } from "@/src/types";

function tokenize(text?: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function resolveTimestamp(value: unknown): number {
  if (!value) return Date.now();

  if (value instanceof Date) return value.getTime();

  const parsed = new Date(value as any);
  const time = parsed.getTime();

  return Number.isNaN(time) ? Date.now() : time;
}

export function activityToSearchDocument(
  activity: SearchActivityProps
): SearchDocument {
  const title = activity.title ?? "";
  const details = activity.extra_details?.join(" ") ?? "";
  const identifier = activity.domain ?? "unknown";

  const keywords = [
    ...tokenize(title),
    ...tokenize(details),
    ...tokenize(activity.type),
    ...tokenize(activity.badgeText ?? ""),
  ];

  return {
    uid: `${activity.domain}:${activity.itemId}`,
    identifier,
    source: activity.domain,
    createdAt: resolveTimestamp(activity.createdAt),
    title,
    subtitle: details,
    keywords,
    activity,
    navigation: {
      itemId: activity.itemId,
      identifier,
    },
  };
}