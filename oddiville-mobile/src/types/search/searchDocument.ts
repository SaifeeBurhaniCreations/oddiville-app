import type { SearchRegistryKey } from "@/src/utils/searchRegistyUtil";

export type SearchSource = SearchRegistryKey;

export type SearchDocument = {
  /** globally unique id (source + itemId) */
  uid: string;

  /** filter chip identifier */
  identifier: string;

  /** module that produced it */
  source: SearchSource;

  /** timestamp used for sorting */
  createdAt: number;

  /** primary visible text */
  title: string;

  /** smaller searchable text */
  subtitle?: string;

  /** tokens used for search matching */
  keywords: string[];

  /** original activity (for UI card rendering) */
  activity: any;

  /** navigation payload */
  navigation: {
    itemId: string;
    identifier: string;
  };
};