  // ============= TYPE DEFINITIONS =============

  type PrimitiveType =
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "array"
    | "object"
    | "null";

  interface StyleTransform {
    property: string;
    value: string | number;
    unit?: string;
  }

  // Storage interface for consistency across instances
  export interface TransformStorage {
    [key: string]: any;
  }

  // Upgrade utilities available in transformations
  export interface TransformUpgrades {
    // ID generation
    uuid: () => string;
    nanoid: () => string;

    // Date generation
    timestamp: () => number;
    date: () => Date;
    formatDate: (date: Date | string, fmt?: string) => string;

    // Sorting algorithms
    sort: {
      quickSort: <T>(arr: T[], compareFn?: (a: T, b: T) => number) => T[];
      mergeSort: <T>(arr: T[], compareFn?: (a: T, b: T) => number) => T[];
      bubbleSort: <T>(arr: T[], compareFn?: (a: T, b: T) => number) => T[];
    };

    // Search algorithms
    search: {
      binarySearch: <T>(
        arr: T[],
        target: T,
        compareFn?: (a: T, b: T) => number
      ) => number;
      linearSearch: <T>(arr: T[], predicate: (item: T) => boolean) => number;
      fuzzySearch: (arr: string[], query: string) => string[];
    };

    // Indexing utilities
    index: {
      createIndex: <T>(arr: T[], key: keyof T) => Map<any, T[]>;
      createUniqueIndex: <T>(arr: T[], key: keyof T) => Map<any, T>;
    };

    // Array utilities
    chunk: <T>(arr: T[], size: number) => T[][];
    flatten: <T>(arr: any[], depth?: number) => T[];
    shuffle: <T>(arr: T[]) => T[];
    sample: <T>(arr: T[], count?: number) => T | T[];

    // String utilities
    slugify: (str: string) => string;
    capitalize: (str: string) => string;
    truncate: (str: string, length: number) => string;

    // Array / object utilities
    stripKeys: (value: any, keys: string[]) => any;
  }

  export interface TransformOptions<T = any, R = any> {
    // === SIMPLIFIED OPTIONS ===

    cloneBy?: (item: T, index?: number) => boolean;
    deepClone?: boolean;
    deepCloneBy?: (item: T, index: number) => boolean;

    addValue?: (
      item: T,
      storage: TransformStorage,
      upgrades: TransformUpgrades,
      index: number
    ) => Partial<R> | R;

    where?: (item: T, index: number, storage: TransformStorage) => boolean;

    sortBy?: keyof T | ((a: T, b: T) => number);
    sortOrder?: "asc" | "desc";

    select?: (keyof T)[];
    exclude?: (keyof T)[];

    // === ADVANCED OPTIONS ===
    pick?: (keyof T)[];
    omit?: (keyof T)[];
    pluck?: keyof T;

    valueTransform?: {
      [K in keyof T]?: (value: T[K], item: T, index: number, upgrades: TransformUpgrades, storage?: TransformStorage) => any;
    };

    typeTransform?: {
      [K in keyof T]?: PrimitiveType;
    };

    styleTransform?: {
      [K in keyof T]?: StyleTransform | StyleTransform[];
    };

    addProperties?: {
      [key: string]: any | ((item: T, index: number) => any);
    };

    clone?: boolean;
    defaults?: Partial<R>;
    typeMap?: {
      [K in keyof R]?: PrimitiveType;
    };

    filter?: (item: T, index: number) => boolean;
    sort?: (a: T, b: T) => number;
    map?: (item: any, index: number) => R;
    loop?: (item: T, index: number) => void;

    // === ALGORITHM OPTIONS ===
    sortAlgorithm?: "quick" | "merge" | "bubble" | "native";

    // === MAP OPTIONS ===
    propertyMap?: Record<string, string>;
    storeMode?: "state" | "memo" | "recordMap";

    // === PERFORMANCE OPTIONS ===
    limit?: number;
    offset?: number;

    // === GROUPING OPTIONS ===
    groupBy?: keyof T;

    // === add entry OPTIONS ===
    addEntry?: (
      base: T | undefined,
      storage: TransformStorage,
      upgrades: TransformUpgrades
    ) => R | R[];

    addEntryPosition?: "start" | "end";
  }

  // ============= Functions =============
  export function uuidv4(): string {
    let d = new Date().getTime();
    let d2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      let r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function formatDate(date: Date | string, fmt: string = "yyyy-MM-dd") {
    const d = typeof date === "string" ? new Date(date) : date;
    if (fmt === "iso") return d.toISOString();
    return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
      "0" + d.getDate()
    ).slice(-2)}`;
  }

  // ============= ALGORITHMS =============

  function quickSort<T>(
    arr: T[],
    compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : -1)
  ): T[] {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter((x) => compareFn(x, pivot) < 0);
    const middle = arr.filter((x) => compareFn(x, pivot) === 0);
    const right = arr.filter((x) => compareFn(x, pivot) > 0);
    return [
      ...quickSort(left, compareFn),
      ...middle,
      ...quickSort(right, compareFn),
    ];
  }

  function mergeSort<T>(
    arr: T[],
    compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : -1)
  ): T[] {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid), compareFn);
    const right = mergeSort(arr.slice(mid), compareFn);
    return merge(left, right, compareFn);
  }

  function merge<T>(
    left: T[],
    right: T[],
    compareFn: (a: T, b: T) => number
  ): T[] {
    const result: T[] = [];
    let i = 0,
      j = 0;
    while (i < left.length && j < right.length) {
      if (compareFn(left[i], right[j]) <= 0) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
  }

  function bubbleSort<T>(
    arr: T[],
    compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : -1)
  ): T[] {
    const result = [...arr];
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result.length - i - 1; j++) {
        if (compareFn(result[j], result[j + 1]) > 0) {
          [result[j], result[j + 1]] = [result[j + 1], result[j]];
        }
      }
    }
    return result;
  }

  function binarySearch<T>(
    arr: T[],
    target: T,
    compareFn: (a: T, b: T) => number = (a, b) => (a > b ? 1 : a < b ? -1 : 0)
  ): number {
    let left = 0,
      right = arr.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const cmp = compareFn(arr[mid], target);
      if (cmp === 0) return mid;
      if (cmp < 0) left = mid + 1;
      else right = mid - 1;
    }
    return -1;
  }

  function linearSearch<T>(arr: T[], predicate: (item: T) => boolean): number {
    for (let i = 0; i < arr.length; i++) {
      if (predicate(arr[i])) return i;
    }
    return -1;
  }

  function fuzzySearch(arr: string[], query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return arr.filter(
      (item) =>
        item.toLowerCase().includes(lowerQuery) ||
        levenshteinDistance(item.toLowerCase(), lowerQuery) <= 3
    );
  }

  function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // ============= UTILITY FUNCTIONS =============

  function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as any;
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  function pickProperties<T extends Record<string, any>>(
    obj: T,
    keys: (keyof T)[]
  ): Partial<T> {
    const result = {} as Partial<T>;
    keys.forEach((key) => {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  }

  function omitProperties<T extends Record<string, any>>(
    obj: T,
    keys: (keyof T)[]
  ): Partial<T> {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
  }

  function applyStyleTransform(
    value: any,
    transform: StyleTransform | StyleTransform[]
  ): any {
    if (!value || typeof value !== "object") return value;
    const transforms = Array.isArray(transform) ? transform : [transform];
    const result = { ...value };
    transforms.forEach(({ property, value: newValue, unit }) => {
      result[property] = unit ? `${newValue}${unit}` : newValue;
    });
    return result;
  }

function stripKeys(value: any, keys: string[]) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((v) =>
      v && typeof v === "object" ? keys.reduce((o, k) => { const { [k]: _, ...r } = o; return r; }, { ...v }) : v
    );
  }
  return keys.reduce((o, k) => {
    const { [k]: _discard, ...rest } = o as Record<string, any>;
    return rest;
  }, { ...value });
}

  function nanoid(length: number = 10): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  function flatten<T>(arr: any[], depth: number = 1): T[] {
    if (depth === 0) return arr;
    return arr.reduce(
      (acc, val) =>
        Array.isArray(val)
          ? acc.concat(flatten(val, depth - 1))
          : acc.concat(val),
      []
    );
  }

  function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function sample<T>(arr: T[], count?: number): T | T[] {
    if (count === undefined) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    const shuffled = shuffle(arr);
    return shuffled.slice(0, count);
  }

  function slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function truncate(str: string, length: number): string {
    return str.length > length ? str.slice(0, length) + "..." : str;
  }

  // ============= UPGRADES OBJECT =============

  function createUpgrades(): TransformUpgrades {
    return {
      uuid: () => uuidv4(),
      nanoid: () => nanoid(),

      timestamp: () => Date.now(),
      date: () => new Date(),
      formatDate,

      sort: {
        quickSort,
        mergeSort,
        bubbleSort,
      },

      search: {
        binarySearch,
        linearSearch,
        fuzzySearch,
      },

      index: {
        createIndex: <T>(arr: T[], key: keyof T) => {
          const index = new Map<any, T[]>();
          arr.forEach((item) => {
            const value = item[key];
            if (!index.has(value)) {
              index.set(value, []);
            }
            index.get(value)!.push(item);
          });
          return index;
        },
        createUniqueIndex: <T>(arr: T[], key: keyof T) => {
          const index = new Map<any, T>();
          arr.forEach((item) => {
            index.set(item[key], item);
          });
          return index;
        },
      },

      chunk,
      flatten,
      shuffle,
      sample,
      slugify,
      capitalize,
      truncate,
      stripKeys,
    };
  }

  // ============= MAIN TRANSFORM FUNCTION =============

  export function transformArray<T extends Record<string, any>, R = T>(
    array: T[],
    options: TransformOptions<T, R> = {},
    storage: TransformStorage = {}
  ): R[] | Record<string, R> {
    if (!Array.isArray(array)) {
      console.warn("transformArray: First argument must be an array");
      return [] as R[];
    }

    const upgrades = createUpgrades();
    let addEntryBase: T | undefined;
    let result: any[] = [...array];
    const typeMap = options.typeMap ?? {};

    if (options.where) {
      result = result.filter((item, index) =>
        options.where!(item, index, storage)
      );
    }

    if (options.filter) {
      result = result.filter(options.filter);
    }

    if (options.sortBy) {
      const key = options.sortBy;
      const order = options.sortOrder || "asc";
      const compareFn =
        typeof key === "function"
          ? key
          : (a: T, b: T) => {
              const aVal = a[key as keyof T];
              const bVal = b[key as keyof T];
              const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
              return order === "asc" ? comparison : -comparison;
            };

      const algorithm = options.sortAlgorithm || "native";
      switch (algorithm) {
        case "quick":
          result = quickSort(result, compareFn);
          break;
        case "merge":
          result = mergeSort(result, compareFn);
          break;
        case "bubble":
          result = bubbleSort(result, compareFn);
          break;
        default:
          result = result.sort(compareFn);
      }
    } else if (options.sort) {
      result = result.sort(options.sort);
    }

    if (options.offset !== undefined) {
      result = result.slice(options.offset);
    }
    if (options.limit !== undefined) {
      result = result.slice(0, options.limit);
    }

    result = result.map((item, index) => {
      const shouldDeepClone =
        options.deepClone &&
        (!options.deepCloneBy || options.deepCloneBy(item, index));

      let transformed: any = shouldDeepClone ? deepClone(item) : { ...item };

      if (options.propertyMap) {
        transformed = Object.fromEntries(
          Object.entries(transformed).map(([k, v]) => [
            options.propertyMap![k] || k,
            v,
          ])
        );
      }

      if (options.select && options.select.length > 0) {
        transformed = pickProperties(transformed, options.select);
      }
      if (options.exclude && options.exclude.length > 0) {
        transformed = omitProperties(transformed, options.exclude);
      }

      if (options.pick && options.pick.length > 0) {
        transformed = pickProperties(transformed, options.pick);
      }
      if (options.omit && options.omit.length > 0) {
        transformed = omitProperties(transformed, options.omit);
      }

      if (options.valueTransform) {
        Object.keys(options.valueTransform).forEach((key) => {
          const transform = options.valueTransform![key as keyof T] as any;
          if (transform && key in transformed) {
            transformed[key] = transform(transformed[key], item, index, upgrades, storage);
          }
        });
      }
      

      if (options.typeTransform) {
        Object.keys(options.typeTransform).forEach((key) => {
          const targetType = options.typeTransform![key as keyof T];
          if (targetType && key in transformed) {
            const value = transformed[key];
            switch (targetType) {
              case "string":
                transformed[key] = String(value);
                break;
              case "number":
                transformed[key] = Number(value);
                break;
              case "boolean":
                transformed[key] = Boolean(value);
                break;
              case "date":
                transformed[key] = new Date(value);
                break;
              case "array":
                transformed[key] = Array.isArray(value) ? value : [value];
                break;
              case "object":
                transformed[key] = typeof value === "object" ? value : { value };
                break;
            }
          }
        });
      }

      if (options.styleTransform) {
        Object.keys(options.styleTransform).forEach((key) => {
          const transform = options.styleTransform![key as keyof T];
          if (transform && key in transformed) {
            transformed[key] = applyStyleTransform(transformed[key], transform);
          }
        });
      }

      if (options.addProperties) {
        Object.keys(options.addProperties).forEach((key) => {
          const value = options.addProperties![key];
          transformed[key] =
            typeof value === "function" ? value(item, index) : value;
        });
      }

      if (options.addValue) {
        const newProps = options.addValue(item, storage, upgrades, index);
        transformed = { ...transformed, ...newProps };
      }

      if (options.clone && options.typeMap) {
        Object.keys(options.typeMap).forEach((key) => {
          if (!(key in transformed)) {
            const type = options.typeMap![key as keyof R];
            const defaultValue = options.defaults?.[key as keyof R];
            transformed[key] =
              defaultValue !== undefined ? defaultValue : getDefaultValue(type!);
          }
        });
      }

      if (options.map) transformed = options.map(transformed, index);

      Object.entries(typeMap).forEach(([k, typ]) => {
        if (transformed[k] === undefined || transformed[k] === null) {
          transformed[k] = getDefaultValue(typ as PrimitiveType);
        }
      });

      if (options.loop) options.loop(transformed, index);

      return transformed as R;
    });

    if (options.cloneBy) {
      const match = array.find(options.cloneBy);
      addEntryBase = match ? deepClone(match) : undefined;
    }

    if (options.addEntry) {
      const entry = options.addEntry(addEntryBase, storage, upgrades);
      const entries = Array.isArray(entry) ? entry : [entry];

      const fallbackedEntries = entries.map((e) => {
        let resultObj: Record<string, any> = { ...(e as Record<string, any>) };
        Object.entries(typeMap).forEach(([k, typ]) => {
          if (resultObj[k] === undefined || resultObj[k] === null) {
            resultObj[k] = getDefaultValue(typ as PrimitiveType);
          }
        });
        return resultObj as R;
      });

      if (options.addEntryPosition === "start") {
        result = [...fallbackedEntries, ...result];
      } else {
        result = [...result, ...fallbackedEntries];
      }
    }

    if (options.pluck) {
      return result.map(
        (item) => (item as any)[options.pluck!]
      ) as unknown as R[];
    }

    if (options.groupBy) {
      const grouped = result.reduce((acc, item) => {
        const key = String(item[options.groupBy!]);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, any[]>);
      return grouped as unknown as R[];
    }

    switch (options.storeMode) {
      case "recordMap":
        return keyBy(result, "id");
      case "memo":
      case "state":
      default:
        return result as R[];
    }
  }


  function getDefaultValue(type: PrimitiveType): any {
    switch (type) {
      case "string":
        return "";
      case "number":
        return 0;
      case "boolean":
        return false;
      case "date":
        return new Date();
      case "array":
        return [];
      case "object":
        return {};
      case "null":
        return null;
      default:
        return undefined;
    }
  }
  // ============= HELPER UTILITIES =============

  export function pluckArray<T extends Record<string, any>, K extends keyof T>(
    array: T[],
    key: K
  ): T[K][] {
    return array.map((item) => item[key]);
  }

  export function groupBy<T extends Record<string, any>, K extends keyof T>(
    array: T[],
    key: K
  ): Record<string, T[]> {
    return array.reduce((acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }

  export function keyBy<T extends Record<string, any>, K extends keyof T>(
    array: T[],
    key: K
  ): Record<string, T> {
    return array.reduce((acc, item) => {
      acc[String(item[key])] = item;
      return acc;
    }, {} as Record<string, T>);
  }

  export function uniqueBy<T extends Record<string, any>, K extends keyof T>(
    array: T[],
    key: K
  ): T[] {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
