import set from "lodash/set";
import get from "lodash/get";
import cloneDeep from "lodash/cloneDeep";
export function setValueAtPath(obj, path, value) {
    const clone = cloneDeep(obj);
    set(clone, path, value);
    return clone;
}
export function getValueAtPath(obj, path) {
    return get(obj, path);
}