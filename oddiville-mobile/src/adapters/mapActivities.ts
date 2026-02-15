import { activityToSearchDocument } from "./activityToDocument";
import type { SearchActivityProps } from "@/src/types";
import type { SearchDocument } from "@/src/types/search/searchDocument";

export function mapActivitiesToDocuments(
  activities: SearchActivityProps[] = []
): SearchDocument[] {
  const map = new Map<string, SearchDocument>();

  for (const act of activities) {
    const doc = activityToSearchDocument(act);

    // dedupe across sources
    if (!map.has(doc.uid)) {
      map.set(doc.uid, doc);
    }
  }

  return Array.from(map.values());
}