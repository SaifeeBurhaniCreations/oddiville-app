import { useMemo, useCallback, useRef } from "react";
import { transformArray, } from "./arrayTransformer";
/**
 * Hook with persistent storage across instances
 * Storage maintains consistency
 */
export function useArrayTransformer(array, options = {}, deps = []) {
    const storageRef = useRef({});
    const transformedData = useMemo(() => transformArray(array, options, storageRef.current), [array, ...deps]);
    const transform = useCallback((newOptions) => {
        return transformArray(array, newOptions || options, storageRef.current);
    }, [array, options]);
    const getStorage = useCallback(() => {
        return storageRef.current;
    }, []);
    const setStorage = useCallback((key, value) => {
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
export function useArrayFilter(array, filterFn, sortFn) {
    const { data } = useArrayTransformer(array, {
        filter: filterFn,
        sort: sortFn,
    }, [filterFn, sortFn]);
    return data;
}
/**
 * hook for selecting properties
 */
export function useArraySelect(array, keys) {
    const { data } = useArrayTransformer(array, {
        select: keys,
    }, [keys.join(",")]);
    return data;
}
/**
 * hook for excluding properties
 */
export function useArrayExclude(array, keys) {
    const { data } = useArrayTransformer(array, {
        exclude: keys,
    }, [keys.join(",")]);
    return data;
}
/**
 * Hook for sorting with algorithm selection
 */
export function useArraySort(array, sortBy, order = "asc", algorithm = "native") {
    const { data } = useArrayTransformer(array, {
        sortBy,
        sortOrder: order,
        sortAlgorithm: algorithm,
    }, [sortBy, order, algorithm]);
    return data;
}
/**
 * Hook for pagination
 */
export function useArrayPagination(array, page = 1, pageSize = 10) {
    const { data } = useArrayTransformer(array, {
        offset: (page - 1) * pageSize,
        limit: pageSize,
    }, [page, pageSize]);
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
