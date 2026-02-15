import type { SearchActivityProps } from "@/src/types";
import { SearchRegistryKey } from "@/src/utils/searchRegistyUtil";

export type DomainSourceResult = {
  domain: string;
  activities: SearchActivityProps[];
  isLoading: boolean;
};

export type DomainSourceHook = () => {
  domain: SearchRegistryKey;
  activities: SearchActivityProps[];
  isLoading: boolean;
};