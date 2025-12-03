import { useMemo, useCallback, useRef } from "react";
import {
  transformArray,
  TransformOptions,
  TransformStorage,
} from "./arrayTransformer";

/**
 * Hook with persistent storage across instances
 * Storage maintains consistency
 */
export function useArrayTransformer<T extends Record<string, any>, R = T>(
  array: T[],
  options: TransformOptions<T, R> = {},
  deps: React.DependencyList = []
) {
  const storageRef = useRef<TransformStorage>({});

  const transformedData = useMemo(
    () => transformArray(array, options, storageRef.current),
    [array, ...deps]
  );

  const transform = useCallback(
    (newOptions?: TransformOptions<T, R>) => {
      return transformArray(array, newOptions || options, storageRef.current);
    },
    [array, options]
  );

  const getStorage = useCallback(() => {
    return storageRef.current;
  }, []);

  const setStorage = useCallback((key: string, value: any) => {
    storageRef.current[key] = value;
  }, []);

  return {
    data: transformedData,
    transform,
    storage: storageRef.current,
    getStorage,
    setStorage,
  };
}

/**
 * hook for filtering
 */
export function useArrayFilter<T extends Record<string, any>>(
  array: T[],
  filterFn?: (item: T, index: number) => boolean,
  sortFn?: (a: T, b: T) => number
) {
  const { data } = useArrayTransformer(
    array,
    {
      filter: filterFn,
      sort: sortFn,
    },
    [filterFn, sortFn]
  );

  return data;
}

/**
 * hook for selecting properties
 */
export function useArraySelect<T extends Record<string, any>>(
  array: T[],
  keys: (keyof T)[]
) {
  const { data } = useArrayTransformer(
    array,
    {
      select: keys,
    },
    [keys.join(",")]
  );

  return data;
}

/**
 * hook for excluding properties
 */
export function useArrayExclude<T extends Record<string, any>>(
  array: T[],
  keys: (keyof T)[]
) {
  const { data } = useArrayTransformer(
    array,
    {
      exclude: keys,
    },
    [keys.join(",")]
  );

  return data;
}

/**
 * Hook for sorting with algorithm selection
 */
export function useArraySort<T extends Record<string, any>>(
  array: T[],
  sortBy: keyof T | ((a: T, b: T) => number),
  order: "asc" | "desc" = "asc",
  algorithm: "quick" | "merge" | "bubble" | "native" = "native"
) {
  const { data } = useArrayTransformer(
    array,
    {
      sortBy,
      sortOrder: order,
      sortAlgorithm: algorithm,
    },
    [sortBy, order, algorithm]
  );

  return data;
}

/**
 * Hook for pagination
 */
export function useArrayPagination<T extends Record<string, any>>(
  array: T[],
  page: number = 1,
  pageSize: number = 10
) {
  const { data } = useArrayTransformer(
    array,
    {
      offset: (page - 1) * pageSize,
      limit: pageSize,
    },
    [page, pageSize]
  );

  const totalPages = Math.ceil(array.length / pageSize);

  return {
    data,
    page,
    pageSize,
    totalPages,
    totalItems: array.length,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}