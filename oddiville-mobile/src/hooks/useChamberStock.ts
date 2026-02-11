import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import {
  fetchChamberStock,
  fetchChamberStockAll,
  fetchChamberStockById,
  fetchChamberStockRawMaterials,
  getChamberStockProduction,
} from "../services/chamberStock.service";
import { sumBy } from "@/src/sbc/utils/sumBy/sumBy";
import { zipAndFit } from "@/src/sbc/utils/zipAndFit/zipAndFit";
import { useChamber, useChamberById } from "./useChambers";
import { pluck } from "../sbc/utils/pluck/pluck";
import { rejectEmptyOrNull } from "../utils/authUtils";
import useSocket from "./useSocketFromContext";

export interface PackagingSize {
  value: number;
  unit: string;
}

export interface Packaging {
  size: PackagingSize;
  type: string;
  count: number;
}

export interface OutputBagPackaging {
  size: {
    value: number;
    unit: "gm" | "kg";
  };
  packetsPerBag: number;
}

export interface PackageItemLocal {
  size: string;
  unit?: string;
  rawSize?: string;
  dry_item_id?: string | null;
  quantity: string;
}
export interface ChamberStock {
  id: string;
  product_name: string;
  image?: string | null;
  category: "material" | "other" | "packed";
  unit: string;

  packaging: Packaging | Packaging[];

  packages?: PackageItemLocal[] | null;

  chamber: Array<{
    id: string;
    quantity: string;
    rating: string;
  }>;

  createdAt: string;
  updatedAt: string;
}

export interface ChamberStockPage {
  data: ChamberStock[];
  nextOffset?: number;
}

export function useChamberStockById(id: string | null) {
  const queryClient = useQueryClient();
  return useQuery<ChamberStock>({
    queryKey: ["chamber-stock", id],
    queryFn: rejectEmptyOrNull(async () => {
      if (!id) return null;

      const cachedStocks = queryClient.getQueryData<ChamberStock[]>([
        "chamber-stock",
      ]);
      if (cachedStocks) {
        const stockFromCache = cachedStocks.find((item) => item.id === id);
        if (stockFromCache) {
          return stockFromCache;
        }
      }

      const response = await fetchChamberStockById(id);
      return response?.data ?? null;
    }),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useChamberStockByName(names: string[]) {
    const { data: chamberStock, refetch, isFetching } = useChamberStock();
    return { chamberStock: chamberStock?.filter((item) => names.includes(item.product_name)), refetch, isFetching };
}

export function useChamberStock() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const listener = (updatedItem: ChamberStock) => {
      if (!updatedItem?.id) return;

      queryClient.setQueryData(
        ["chamber-stock"],
        (oldData: ChamberStock[] | undefined) => {
          if (!oldData) return [updatedItem];

          const index = oldData.findIndex((item) => item.id === updatedItem.id);

          if (index !== -1) {
            const newData = [...oldData];
            newData[index] = updatedItem;
            return newData;
          } else {
            return [...oldData, updatedItem];
          }
        }
      );
    };

    socket.on("chamber-stock:receive", listener);

    return () => {
      socket.off("chamber-stock:receive", listener);
    };
  }, [queryClient]);

  return useQuery<ChamberStock[]>({
    queryKey: ["chamber-stock"],
    queryFn: rejectEmptyOrNull(async () => {
      const response = await fetchChamberStockAll();
      return response?.data || [];
    }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useChamberStockRawMaterials() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const listener = (updatedItem: ChamberStock) => {
      if (!updatedItem?.id) return;

      queryClient.setQueryData(
        ["chamber-stock"],
        (oldData: ChamberStock[] | undefined) => {
          if (!oldData) return [updatedItem];

          const index = oldData.findIndex((item) => item.id === updatedItem.id);

          if (index !== -1) {
            const newData = [...oldData];
            newData[index] = updatedItem;
            return newData;
          } else {
            return [...oldData, updatedItem];
          }
        }
      );
    };

    socket.on("chamber-stock:receive", listener);

    return () => {
      socket.off("chamber-stock:receive", listener);
    };
  }, [queryClient]);

  return useQuery<ChamberStock[]>({
    queryKey: ["chamber-stock", "raw-materials"],
    queryFn: rejectEmptyOrNull(async () => {
      const response = await fetchChamberStockRawMaterials();
      return response?.data || [];
    }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useChamberStockPaginated(searchText: string = "") {
  return useInfiniteQuery<ChamberStockPage, Error>({
    queryKey: ["chamber-stock", searchText],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const offset = typeof pageParam === "number" ? pageParam : 0;
      const response = await fetchChamberStock({
        search: searchText,
        limit,
        offset,
      });
      return {
        data: response.data ?? [],
        nextOffset: response.data.length === limit ? offset + limit : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

function isChamberStock(
  stock: ChamberStock | { status: string } | null | undefined
): stock is ChamberStock {
  return !!stock && "chamber" in stock && Array.isArray(stock.chamber);
}

export function useChamberStockDetails(productName: string) {
  const { data: chambers } = useChamber();
  const { data: stocks } = useChamberStock();
  const stock = stocks?.find((s) => s.product_name === productName);

  const { data: stockFallback } = useQuery<
    ChamberStock | { status: string } | null
  >({
    queryKey: ["chamber-stock-production", productName],
    queryFn: rejectEmptyOrNull(async () => {
      const result = await getChamberStockProduction(productName);
      return result?.data ?? null;
    }),
    enabled: !stock && !!productName,
    gcTime: 1000 * 60 * 1,
    staleTime: 1000 * 60 * 5,
  });

  const finalStock = stock ?? stockFallback;

  let chamberIds: (string | number)[] = [];
  let chamberQuantities: number[] = [];

  if (finalStock && isChamberStock(finalStock)) {
    chamberIds = finalStock.chamber.map((c) => c.id);
    chamberQuantities = finalStock.chamber.map((c) => Number(c.quantity));
  }

  const { data: chambersDataRaw } = useChamberById(
    undefined,
    chamberIds.map(String)
  );

  const chambersArray = Array.isArray(chambersDataRaw)
    ? chambersDataRaw
    : chambersDataRaw
    ? [chambersDataRaw]
    : [];

  const newChamberNames = pluck(chambers ?? [], "chamber_name");
  const chamberCapacity = pluck(chambers ?? [], "capacity");
  const newChambers = zipAndFit(newChamberNames, chamberCapacity, [
    "chamberName",
    "chamberCapacity",
  ]);

  if (finalStock && "status" in finalStock && finalStock.status === "new") {
    return {
      chambers: [],
      total: 0,
      chamberCapacityWithName: newChambers,
      isReady: true,
      message: "No material yet in any chamber",
    };
  }

  if (!isChamberStock(finalStock)) {
    return {
      chambers: [],
      total: 0,
      isReady: false,
    };
  }

  const chamberNames = chambersArray.map((c) => c.chamber_name);
  const responseChambers = zipAndFit(
    chamberNames,
    chamberQuantities,
    chamberCapacity,
    ["chamberName", "quantity", "chamberCapacity"]
  );
  const totalQty = sumBy({ array: chamberQuantities, transform: "number" });

  return {
    chambers: responseChambers,
    total: totalQty,
    isReady: !!finalStock && chambersArray?.length > 0,
  };
}