import { useEffect, useRef, useState } from "react";
import { getValueAtPath, setValueAtPath } from "./utils/formValidator";
// ------------------ Hook ------------------
export function useFormValidator(initial, rules, options = {}) {
    const [values, setValues] = useState(initial);
    const [errors, setErrors] = useState({});
    const debounceTimers = useRef({});
    const confirmDependencyMap = useRef({});
    const matchDependencyMap = useRef({});
    // ------------------ VALIDATION SETUP ------------------
    useEffect(() => {
        const confirmMap = {};
        const matchMap = {};
        for (const key in rules) {
            const fieldRules = rules[key];
            if (!fieldRules)
                continue;
            for (const rule of fieldRules) {
                if (rule.type === "confirm") {
                    const source = rule.field;
                    if (!confirmMap[source])
                        confirmMap[source] = [];
                    confirmMap[source].push(key);
                }
                if (rule.type === "match") {
                    const source = rule.field;
                    if (!matchMap[source])
                        matchMap[source] = [];
                    matchMap[source].push(key);
                }
            }
        }
        confirmDependencyMap.current = confirmMap;
        matchDependencyMap.current = matchMap;
    }, [rules]);
    // ------------------ Validation ------------------
    const validateField = (key, customValues) => {
        var _a;
        const value = getValueAtPath(customValues !== null && customValues !== void 0 ? customValues : values, key);
        const fieldRules = rules[key];
        if (!fieldRules)
            return;
        for (const rule of fieldRules) {
            switch (rule.type) {
                case "required":
                    const isEmpty = value === undefined ||
                        value === null ||
                        value === "" ||
                        value === false ||
                        Number.isNaN(value) ||
                        (Array.isArray(value) && (value === null || value === void 0 ? void 0 : value.length) === 0) ||
                        (typeof value === "object" && !Array.isArray(value) && ((_a = Object.keys(value)) === null || _a === void 0 ? void 0 : _a.length) === 0);
                    if (isEmpty) {
                        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: rule.message || "Required" })));
                        return rule.message;
                    }
                    break;
                case "custom":
                    if (!rule.validate(value, customValues !== null && customValues !== void 0 ? customValues : values)) {
                        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: rule.message || "Invalid value" })));
                        return rule.message;
                    }
                    break;
                case "email":
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (value && !emailRegex.test(value)) {
                        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: rule.message || "Invalid email" })));
                        return rule.message;
                    }
                    break;
                case "number":
                    if (isNaN(Number(value))) {
                        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: rule.message || "Must be a number" })));
                        return rule.message;
                    }
                    break;
                case "length":
                    if (typeof value === "string" && (value === null || value === void 0 ? void 0 : value.length) === (rule === null || rule === void 0 ? void 0 : rule.length)) {
                        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: rule.message || `length must be ${rule === null || rule === void 0 ? void 0 : rule.length}` })));
                        return rule.message;
                    }
                    break;
                case "minLength":
                    if (typeof value === "string" && (value === null || value === void 0 ? void 0 : value.length) < (rule === null || rule === void 0 ? void 0 : rule.length)) {
                        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: rule.message || `Min length ${rule === null || rule === void 0 ? void 0 : rule.length}` })));
                        return rule.message;
                    }
                    break;
                case "maxLength":
                    if (typeof value === "string" && (value === null || value === void 0 ? void 0 : value.length) > (rule === null || rule === void 0 ? void 0 : rule.length)) {
                        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: rule.message || `Max length ${rule === null || rule === void 0 ? void 0 : rule.length}` })));
                        return rule.message;
                    }
                    break;
                case "match":
                case "confirm":
                    const compareTo = (customValues !== null && customValues !== void 0 ? customValues : values)[rule.field];
                    if (value !== compareTo) {
                        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: rule.message || `Must match ${rule.field}` })));
                        return rule.message;
                    }
                    break;
            }
        }
        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: undefined })));
        return;
    };
    const validateForm = (customValues) => {
        var _a;
        const valuesToValidate = customValues !== null && customValues !== void 0 ? customValues : values;
        const newErrors = {};
        for (const key in rules) {
            const msg = validateField(key, valuesToValidate);
            if (msg)
                newErrors[key] = msg;
        }
        if (((_a = Object.keys(newErrors)) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            setErrors(newErrors);
            return { success: false, errors: newErrors };
        }
        return { success: true, data: valuesToValidate };
    };
    // ------------------ Setters ------------------
    const setField = (key, value) => {
        setValues((prev) => {
            const newValues = setValueAtPath(prev, key, value);
            if (options.validateOnChange) {
                const run = () => {
                    var _a, _b;
                    validateField(key, newValues);
                    (_a = confirmDependencyMap.current[key]) === null || _a === void 0 ? void 0 : _a.forEach((f) => validateField(f, newValues));
                    (_b = matchDependencyMap.current[key]) === null || _b === void 0 ? void 0 : _b.forEach((f) => validateField(f, newValues));
                };
                if (options.debounce) {
                    clearTimeout(debounceTimers.current[key]);
                    debounceTimers.current[key] = setTimeout(run, options.debounce);
                }
                else {
                    run();
                }
            }
            return newValues;
        });
    };
    const setFields = (updates) => {
        setValues((prev) => (Object.assign(Object.assign({}, prev), updates)));
    };
    const resetForm = () => {
        setValues(initial);
        setErrors({});
    };
    const setError = (key, message) => {
        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [key]: message })));
    };
    const setErrorsBatch = (allErrors) => {
        setErrors(allErrors);
    };
    const isValid = Object.values(errors).every((e) => !e);
    // ---------- Return API ----------
    return {
        values,
        errors,
        setField,
        setFields,
        validateForm,
        validateField,
        setError,
        setErrors: setErrorsBatch,
        resetForm,
        isValid,
    };
}