import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchThirdPartyProducts,
  fetchThirdPartyProductsById,
} from "@/services/ThirdPartyProductService";
import { useChamberstock } from "./chamberStock";
export function useThirdPartyProducts(options = {}) {
  const defaults = {
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  };
  const merged = { ...defaults, ...options };

  return useQuery({
    queryKey: ["third-party-products"],
    queryFn: async () => {
      const res = await fetchThirdPartyProducts();
      return res?.data ?? res;
    },
    enabled: merged.enabled,
    staleTime: merged.staleTime,
    cacheTime: merged.cacheTime,
    refetchOnWindowFocus: merged.refetchOnWindowFocus,
    refetchOnMount: merged.refetchOnMount,
    retry: merged.retry,
  });
}

import { useMemo } from "react";

export function useOtherProductById(id = null) {
  const { data: stock } = useChamberstock(); 
  const { data: otherProduct } = useThirdPartyProducts(); 

  const stockById = useMemo(() => {
    const map = new Map();
    if (Array.isArray(stock)) {
      for (const s of stock) {
        if (s && s.id) map.set(String(s.id), s);
      }
    }
    return map;
  }, [stock]);

  const enrichedOtherProducts = useMemo(() => {
    if (!Array.isArray(otherProduct)) return [];
    return otherProduct.map((op) => {
      const productIds = Array.isArray(op.products) ? op.products : [];
      const productsFull = productIds
        .map((pid) => stockById.get(String(pid)))
        .filter(Boolean); 
      return { ...op, products: productsFull };
    });
  }, [otherProduct, stockById]);

  const otherProductResult = useMemo(() => {
    if (!id) return enrichedOtherProducts;
    return enrichedOtherProducts.find((op) => String(op.id) === String(id)) || null;
  }, [id, enrichedOtherProducts]);

  const stockData = useMemo(() => {
    if (id) {
      return (otherProductResult?.products && Array.isArray(otherProductResult.products))
        ? otherProductResult.products
        : [];
    }
    const seen = new Set();
    const list = [];
    for (const op of enrichedOtherProducts) {
      for (const s of op.products || []) {
        const key = String(s.id);
        if (!seen.has(key)) {
          seen.add(key);
          list.push(s);
        }
      }
    }
    return list;
  }, [id, otherProductResult, enrichedOtherProducts]);

  return { stockData, otherProduct: otherProductResult };
}
