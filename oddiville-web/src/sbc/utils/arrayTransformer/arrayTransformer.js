// ============= TYPE DEFINITIONS =============
// ============= Functions =============
export function uuidv4() {
    let d = new Date().getTime();
    let d2 = (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
        0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        }
        else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
}
function formatDate(date, fmt = "yyyy-MM-dd") {
    const d = typeof date === "string" ? new Date(date) : date;
    if (fmt === "iso")
        return d.toISOString();
    return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
}
// ============= ALGORITHMS =============
function quickSort(arr, compareFn = (a, b) => (a > b ? 1 : -1)) {
    if (arr.length <= 1)
        return arr;
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
function mergeSort(arr, compareFn = (a, b) => (a > b ? 1 : -1)) {
    if (arr.length <= 1)
        return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid), compareFn);
    const right = mergeSort(arr.slice(mid), compareFn);
    return merge(left, right, compareFn);
}
function merge(left, right, compareFn) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (compareFn(left[i], right[j]) <= 0) {
            result.push(left[i++]);
        }
        else {
            result.push(right[j++]);
        }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}
function bubbleSort(arr, compareFn = (a, b) => (a > b ? 1 : -1)) {
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
function binarySearch(arr, target, compareFn = (a, b) => (a > b ? 1 : a < b ? -1 : 0)) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const cmp = compareFn(arr[mid], target);
        if (cmp === 0)
            return mid;
        if (cmp < 0)
            left = mid + 1;
        else
            right = mid - 1;
    }
    return -1;
}
function linearSearch(arr, predicate) {
    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i]))
            return i;
    }
    return -1;
}
function fuzzySearch(arr, query) {
    const lowerQuery = query.toLowerCase();
    return arr.filter((item) => item.toLowerCase().includes(lowerQuery) ||
        levenshteinDistance(item.toLowerCase(), lowerQuery) <= 3);
}
function levenshteinDistance(a, b) {
    const matrix = [];
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
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[b.length][a.length];
}
// ============= UTILITY FUNCTIONS =============
function deepClone(obj) {
    if (obj === null || typeof obj !== "object")
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (Array.isArray(obj))
        return obj.map((item) => deepClone(item));
    const clonedObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}
function pickProperties(obj, keys) {
    const result = {};
    keys.forEach((key) => {
        if (key in obj)
            result[key] = obj[key];
    });
    return result;
}
function omitProperties(obj, keys) {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
}
function applyStyleTransform(value, transform) {
    if (!value || typeof value !== "object")
        return value;
    const transforms = Array.isArray(transform) ? transform : [transform];
    const result = { ...value };
    transforms.forEach(({ property, value: newValue, unit }) => {
        result[property] = unit ? `${newValue}${unit}` : newValue;
    });
    return result;
}
function nanoid(length = 10) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function chunk(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}
function flatten(arr, depth = 1) {
    if (depth === 0)
        return arr;
    return arr.reduce((acc, val) => Array.isArray(val)
        ? acc.concat(flatten(val, depth - 1))
        : acc.concat(val), []);
}
function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
function sample(arr, count) {
    if (count === undefined) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    const shuffled = shuffle(arr);
    return shuffled.slice(0, count);
}
function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function truncate(str, length) {
    return str.length > length ? str.slice(0, length) + "..." : str;
}
// ============= UPGRADES OBJECT =============
function createUpgrades() {
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
            createIndex: (arr, key) => {
                const index = new Map();
                arr.forEach((item) => {
                    const value = item[key];
                    if (!index.has(value)) {
                        index.set(value, []);
                    }
                    index.get(value).push(item);
                });
                return index;
            },
            createUniqueIndex: (arr, key) => {
                const index = new Map();
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
    };
}
// ============= MAIN TRANSFORM FUNCTION =============
export function transformArray(array, options = {}, storage = {}) {
    if (!Array.isArray(array)) {
        console.warn("transformArray: First argument must be an array");
        return [];
    }
    const upgrades = createUpgrades();
    let addEntryBase;
    let result = [...array];
    const typeMap = options.typeMap ?? {};
    if (options.where) {
        result = result.filter((item, index) => options.where(item, index, storage));
    }
    if (options.filter) {
        result = result.filter(options.filter);
    }
    if (options.sortBy) {
        const key = options.sortBy;
        const order = options.sortOrder || "asc";
        const compareFn = typeof key === "function"
            ? key
            : (a, b) => {
                const aVal = a[key];
                const bVal = b[key];
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
    }
    else if (options.sort) {
        result = result.sort(options.sort);
    }
    if (options.offset !== undefined) {
        result = result.slice(options.offset);
    }
    if (options.limit !== undefined) {
        result = result.slice(0, options.limit);
    }
    result = result.map((item, index) => {
        const shouldDeepClone = options.deepClone &&
            (!options.deepCloneBy || options.deepCloneBy(item, index));
        let transformed = shouldDeepClone ? deepClone(item) : { ...item };
        if (options.propertyMap) {
            transformed = Object.fromEntries(Object.entries(transformed).map(([k, v]) => [
                options.propertyMap[k] || k,
                v,
            ]));
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
                const transform = options.valueTransform[key];
                if (transform && key in transformed) {
                    transformed[key] = transform(transformed[key], item, index);
                }
            });
        }
        if (options.typeTransform) {
            Object.keys(options.typeTransform).forEach((key) => {
                const targetType = options.typeTransform[key];
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
                const transform = options.styleTransform[key];
                if (transform && key in transformed) {
                    transformed[key] = applyStyleTransform(transformed[key], transform);
                }
            });
        }
        if (options.addProperties) {
            Object.keys(options.addProperties).forEach((key) => {
                const value = options.addProperties[key];
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
                    const type = options.typeMap[key];
                    const defaultValue = options.defaults?.[key];
                    transformed[key] =
                        defaultValue !== undefined ? defaultValue : getDefaultValue(type);
                }
            });
        }
        if (options.map)
            transformed = options.map(transformed, index);
        Object.entries(typeMap).forEach(([k, typ]) => {
            if (transformed[k] === undefined || transformed[k] === null) {
                transformed[k] = getDefaultValue(typ);
            }
        });
        if (options.loop)
            options.loop(transformed, index);
        return transformed;
    });
    if (options.cloneBy) {
        const match = array.find(options.cloneBy);
        addEntryBase = match ? deepClone(match) : undefined;
    }
    if (options.addEntry) {
        const entry = options.addEntry(addEntryBase, storage, upgrades);
        const entries = Array.isArray(entry) ? entry : [entry];
        const fallbackedEntries = entries.map((e) => {
            let resultObj = { ...e };
            Object.entries(typeMap).forEach(([k, typ]) => {
                if (resultObj[k] === undefined || resultObj[k] === null) {
                    resultObj[k] = getDefaultValue(typ);
                }
            });
            return resultObj;
        });
        if (options.addEntryPosition === "start") {
            result = [...fallbackedEntries, ...result];
        }
        else {
            result = [...result, ...fallbackedEntries];
        }
    }
    if (options.pluck) {
        return result.map((item) => item[options.pluck]);
    }
    if (options.groupBy) {
        const grouped = result.reduce((acc, item) => {
            const key = String(item[options.groupBy]);
            if (!acc[key])
                acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
        return grouped;
    }
    if (options.omit) {
      const keysToOmit = Array.isArray(options.omit)
        ? options.omit
        : [options.omit];
      transformed = omitProperties(transformed, keysToOmit);
    }

    // === NEW/ENHANCED: omit keys inside nested array properties ===
    if (options.omitArray) {
      const configs = Array.isArray(options.omitArray)
        ? options.omitArray
        : [options.omitArray];

      configs.forEach((cfg) => {
        let propName;
        let keys = [];

        if (typeof cfg === "string") {
          propName = cfg;
          keys = [];
        } else if (cfg && typeof cfg === "object") {
          propName = cfg.prop || cfg.property || cfg.key;
          keys = cfg.keys || (cfg.key ? [cfg.key] : []);
        }

        if (!propName) return;
        if (!Array.isArray(transformed[propName])) return;
        if (!keys || keys.length === 0) return; // nothing to remove

        transformed[propName] = omitArrayKeys(transformed[propName], keys);
      });
    }
    switch (options.storeMode) {
        case "recordMap":
            return keyBy(result, "id");
        case "memo":
        case "state":
        default:
            return result;
    }
}
function getDefaultValue(type) {
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
export function pluckArray(array, key) {
    return array.map((item) => item[key]);
}
export function omitArray(array, key) {
  if (!Array.isArray(array)) return [];

  return array.map((item) => {
    if (item == null || typeof item !== "object") return item;

    const clone = { ...item };
    delete clone[key];
    return clone;
  });
}

export function omitArrayKeys(array, keys = []) {
  if (!Array.isArray(array)) return [];
  return array.map((item) => {
    if (item == null || typeof item !== "object") return item;
    const clone = { ...item };
    keys.forEach((k) => delete clone[k]);
    return clone;
  });
}

function applyOmitPath(obj, path) {
  if (!obj || typeof obj !== "object") return;

  const parts = String(path).split(".");
  if (parts.length === 0) return;

  const walk = (target, idx) => {
    if (target == null) return;
    const part = parts[idx];
    const isArrayToken = part.endsWith("[]");
    const keyName = isArrayToken ? part.slice(0, -2) : part;

    if (idx === parts.length - 1) {
      if (isArrayToken) {
        return;
      }
      if (Array.isArray(target)) {
        target.forEach((el) => {
          if (el && typeof el === "object") delete el[keyName];
        });
        return;
      }
      if (target && typeof target === "object") {
        delete target[keyName];
      }
      return;
    }

    const nextPart = parts[idx + 1];
    if (isArrayToken) {
      const arr = target[keyName];
      if (!Array.isArray(arr)) return;
      arr.forEach((el) => walk(el, idx + 1));
      return;
    } else {
      const nextTarget = target[keyName];
      if (nextTarget == null) return;
      walk(nextTarget, idx + 1);
      return;
    }
  };

  walk(obj, 0);
}

export function groupBy(array, key) {
    return array.reduce((acc, item) => {
        const groupKey = String(item[key]);
        if (!acc[groupKey])
            acc[groupKey] = [];
        acc[groupKey].push(item);
        return acc;
    }, {});
}
export function keyBy(array, key) {
    return array.reduce((acc, item) => {
        acc[String(item[key])] = item;
        return acc;
    }, {});
}
export function uniqueBy(array, key) {
    const seen = new Set();
    return array.filter((item) => {
        const value = item[key];
        if (seen.has(value))
            return false;
        seen.add(value);
        return true;
    });
}
