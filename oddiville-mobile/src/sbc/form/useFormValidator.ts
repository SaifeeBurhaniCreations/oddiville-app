import { useEffect, useRef, useState } from "react";
import set from "lodash/set";
import get from "lodash/get";
import cloneDeep from "lodash/cloneDeep";

// ------------------ Types ------------------

type ValidationRule =
    | { type: "required"; message?: string }
    | { type: "email"; message?: string }
    | { type: "number"; message?: string }
    | { type: "length"; length: number; message?: string }
    | { type: "minLength"; length: number; message?: string }
    | { type: "maxLength"; length: number; message?: string }
    | { type: "match"; field: string; message?: string }
    | { type: "confirm"; field: string; message?: string }
    | { type: "custom"; validate: (value: any, allValues: Record<string, any>) => boolean; message?: string };

type Rules<T> = Partial<Record<keyof T, ValidationRule[]>>;
type ErrorMap<T> = Partial<Record<string, string>>;

interface UseFormValidatorOptions {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounce?: number;
}
// ------------------ Utils ------------------

function setValueAtPath(obj: any, path: string, value: any) {
    const clone = cloneDeep(obj);
    set(clone, path, value);
    return clone;
}

function getValueAtPath(obj: any, path: string) {
    return get(obj, path);
}

// ------------------ Hook ------------------

export function useFormValidator<T extends Record<string, any>>(
    initial: Partial<T>,
    rules: Rules<T>,
    options: UseFormValidatorOptions = {}
) {
    const [values, setValues] = useState<T>(initial as T);
    const [errors, setErrors] = useState<ErrorMap<T>>({});

    const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
    const confirmDependencyMap = useRef<Record<string, (keyof T)[]>>({});
    const matchDependencyMap = useRef<Record<string, (keyof T)[]>>({});

    // ------------------ VALIDATION SETUP ------------------

    useEffect(() => {
        const confirmMap: Record<string, (keyof T)[]> = {};
        const matchMap: Record<string, (keyof T)[]> = {};

        for (const key in rules) {
            const fieldRules = rules[key];
            if (!fieldRules) continue;

            for (const rule of fieldRules) {
                if (rule.type === "confirm") {
                    const source = rule.field;
                    if (!confirmMap[source]) confirmMap[source] = [];
                    confirmMap[source].push(key as keyof T);
                }
                if (rule.type === "match") {
                    const source = rule.field;
                    if (!matchMap[source]) matchMap[source] = [];
                    matchMap[source].push(key as keyof T);
                }
            }
        }

        confirmDependencyMap.current = confirmMap;
        matchDependencyMap.current = matchMap;
    }, [rules]);

    // ------------------ Validation ------------------

    const validateField = (key: string, customValues?: T): string | undefined => {
        const value = getValueAtPath(customValues ?? values, key as string);
        const fieldRules = rules[key as keyof T];

        if (!fieldRules) return;

        for (const rule of fieldRules) {
            switch (rule.type) {
                case "required":
                    const isEmpty =
                        value === undefined ||
                        value === null ||
                        value === "" ||
                        value === false ||
                        Number.isNaN(value) ||
                        (Array.isArray(value) && value?.length === 0) ||
                        (typeof value === "object" && !Array.isArray(value) && Object.keys(value)?.length === 0);
                    if (isEmpty) {
                        setErrors((prev) => ({ ...prev, [key]: rule.message || "Required" }));
                        return rule.message;
                    }
                    break;
                case "custom":
                    if (!rule.validate(value, customValues ?? values)) {
                        setErrors((prev) => ({ ...prev, [key]: rule.message || "Invalid value" }));
                        return rule.message;
                    }
                    break;
                case "email":
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (value && !emailRegex.test(value)) {
                        setErrors((prev) => ({ ...prev, [key]: rule.message || "Invalid email" }));
                        return rule.message;
                    }
                    break;
                case "number":
                    if (isNaN(Number(value))) {
                        setErrors((prev) => ({ ...prev, [key]: rule.message || "Must be a number" }));
                        return rule.message;
                    }
                    break;
                case "length":
                    if (typeof value === "string" && value?.length === rule?.length) {
                        setErrors((prev) => ({
                            ...prev,
                            [key]: rule.message || `length must be ${rule?.length}`
                        }));
                        return rule.message;
                    }
                    break;
                case "minLength":
                    if (typeof value === "string" && value?.length < rule?.length) {
                        setErrors((prev) => ({
                            ...prev,
                            [key]: rule.message || `Min length ${rule?.length}`
                        }));
                        return rule.message;
                    }
                    break;
                case "maxLength":
                    if (typeof value === "string" && value?.length > rule?.length) {
                        setErrors((prev) => ({
                            ...prev,
                            [key]: rule.message || `Max length ${rule?.length}`
                        }));
                        return rule.message;
                    }
                    break;
                case "match":
                case "confirm":
                    const compareTo = (customValues ?? values)[rule.field];
                    if (value !== compareTo) {
                        setErrors((prev) => ({
                            ...prev,
                            [key]: rule.message || `Must match ${rule.field}`
                        }));
                        return rule.message;
                    }
                    break;
            }
        }

        setErrors((prev) => ({ ...prev, [key]: undefined }));
        return;
    };

    const validateForm = (
        customValues?: T
    ): { success: true; data: T } | { success: false; errors: ErrorMap<T> } => {
        const valuesToValidate = customValues ?? values;
        const newErrors: ErrorMap<T> = {};

        for (const key in rules) {
            const msg = validateField(key, valuesToValidate);
            if (msg) newErrors[key] = msg;
        }

        if (Object.keys(newErrors)?.length > 0) {
            setErrors(newErrors);
            return { success: false, errors: newErrors };
        }

        return { success: true, data: valuesToValidate };
    };

    // ------------------ Setters ------------------

    const setField = (key: string, value: any) => {
        setValues((prev) => {
            const newValues = setValueAtPath(prev, key, value);

            if (options.validateOnChange) {
                const run = () => {
                    validateField(key, newValues);
                    confirmDependencyMap.current[key]?.forEach((f) => validateField(f as string, newValues));
                    matchDependencyMap.current[key]?.forEach((f) => validateField(f as string, newValues));
                };

                if (options.debounce) {
                    clearTimeout(debounceTimers.current[key]);
                    debounceTimers.current[key] = setTimeout(run, options.debounce);
                } else {
                    run();
                }
            }

            return newValues;
        });
    };

    const setFields = (updates: Partial<T>) => {
        setValues((prev) => ({ ...prev, ...updates }));
    };

    const resetForm = () => {
        setValues(initial as T);
        setErrors({});
    };

    const setError = (key: string, message: string) => {
        setErrors((prev) => ({ ...prev, [key]: message }));
    };

    const setErrorsBatch = (allErrors: ErrorMap<T>) => {
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


export function useMultiStepFormValidator<T extends Record<string, any>>(
    initial: Partial<T>,
    rules: Rules<T>,
    stepFieldMap: Record<number, string[]>,
    options?: UseFormValidatorOptions,
    externalStep?: number
) {
    const base = useFormValidator<T>(initial, rules, options);

    const validateCurrentStep = (customValues?: T): { success: true } | { success: false; errors: ErrorMap<T> } => {
        const valuesToValidate = customValues ?? base.values;
        const stepToUse = externalStep ?? 1;
        const fieldsToValidate = stepFieldMap[stepToUse];
        const newErrors: ErrorMap<T> = {};

        for (const key of fieldsToValidate) {
            const msg = base.validateField(key, valuesToValidate);
            if (msg) {
                newErrors[key] = msg;
            }
        }

        if (Object.keys(newErrors)?.length > 0) {
            base.setErrors(newErrors);
            return { success: false, errors: newErrors };
        }

        return { success: true };
    };

    const isCurrentStepValid = stepFieldMap[(externalStep ?? 1)].every(
        (key) => !base.errors[key]
    );
    return {
        ...base,
        validateCurrentStep,
        isCurrentStepValid,
    };
}