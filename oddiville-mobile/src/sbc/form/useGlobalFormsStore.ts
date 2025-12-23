import { create } from "zustand";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import get from "lodash/get";

// --- Types ---
export type ValidationRule<T> =
    | { type: "required"; message?: string }
    | { type: "email"; message?: string }
    | { type: "number"; message?: string }
    | { type: "minLength"; length: number; message?: string }
    | { type: "maxLength"; length: number; message?: string }
    | { type: "match"; field: keyof T; message?: string }
    | { type: "confirm"; field: keyof T; message?: string }
    | { type: "custom"; validate: (value: any, allValues: T) => boolean; message?: string };

export type Rules<T> = Partial<Record<keyof T, ValidationRule<T>[]>>;
export type ErrorMap<T> = Partial<Record<keyof T, string>>;

export interface UseFormValidatorOptions {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounce?: number;
}

interface FormState<T> {
    values: T;
    initialValues: T;
    errors: ErrorMap<T>;
    rules: Rules<T>;
    options: UseFormValidatorOptions;
    debounceTimers: Record<string, NodeJS.Timeout>;
    confirmDependencyMap: Record<string, (keyof T)[]>;
    matchDependencyMap: Record<string, (keyof T)[]>;
}

export interface GlobalFormsStore {
    forms: Record<string, FormState<any>>;
    isValid: (formId: string) => boolean;

    initializeForm: <T>(
        formId: string,
        initial: T,
        rules: Rules<T>,
        options?: UseFormValidatorOptions
    ) => void;

    setField: <T>(formId: string, key: keyof T, value: T[keyof T]) => void;
    setErrors: <T>(formId: string, errors: ErrorMap<T>) => void;
    resetForm: <T>(formId: string) => void;
    validateField: <T>(formId: string, key: keyof T) => string | undefined;
    validateForm: <T>(
        formId: string,
        customValues?: T
    ) => { success: true; data: T } | { success: false; errors: ErrorMap<T> };
    getValues: <T>(formId: string) => T | undefined;
    getErrors: <T>(formId: string) => ErrorMap<T> | undefined;
}

function setValueAtPath(obj: any, path: string, value: any) {
    const clone = cloneDeep(obj);
    set(clone, path, value);
    return clone;
}

function getValueAtPath(obj: any, path: string) {
    return get(obj, path);
}

function validateSingleRule<T>(
    rule: ValidationRule<T>,
    val: any,
    all: T
): string | undefined {
    switch (rule.type) {
        case "required":
            if (
                val === undefined ||
                val === null ||
                val === "" ||
                val === false ||
                (Array.isArray(val) && val?.length === 0) ||
                (typeof val === "object" && !Array.isArray(val) && Object.keys(val)?.length === 0)
            )
                return rule.message || "Required";
            break;
        case "email":
            if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return rule.message || "Invalid email";
            break;
        case "number":
            if (isNaN(Number(val))) return rule.message || "Must be a number";
            break;
        case "minLength":
            if (typeof val === "string" && val?.length < rule?.length)
                return rule.message || `Min length ${rule?.length}`;
            break;
        case "maxLength":
            if (typeof val === "string" && val?.length > rule?.length)
                return rule.message || `Max length ${rule?.length}`;
            break;
        case "match":
        case "confirm":
            if (val !== all[rule.field]) return rule.message || `Must match ${String(rule.field)}`;
            break;
        case "custom":
            if (!rule.validate(val, all)) return rule.message || "Invalid";
            break;
    }
}

export const useGlobalFormsStore = create<GlobalFormsStore>((set, get) => ({
    forms: {},

    initializeForm: <T>(
        formId: string,
        initial: T,
        rules: Rules<T>,
        options: UseFormValidatorOptions = {}
    ) => {
        const confirmDependencyMap: Record<string, (keyof T)[]> = {};
        const matchDependencyMap: Record<string, (keyof T)[]> = {};

        for (const key in rules) {
            const fieldRules = rules[key];
            if (!fieldRules) continue;

            for (const rule of fieldRules) {
                if (rule.type === "confirm") {
                    const source = rule.field as string;
                    if (!confirmDependencyMap[source]) confirmDependencyMap[source] = [];
                    confirmDependencyMap[source].push(key as keyof T);
                }
                if (rule.type === "match") {
                    const source = rule.field as string;
                    if (!matchDependencyMap[source]) matchDependencyMap[source] = [];
                    matchDependencyMap[source].push(key as keyof T);
                }
            }
        }

        set((state) => ({
            forms: {
                ...state.forms,
                [formId]: {
                    values: initial,
                    initialValues: cloneDeep(initial),
                    errors: {},
                    rules,
                    options,
                    debounceTimers: {},
                    confirmDependencyMap,
                    matchDependencyMap,
                },
            },
        }));
    },

    setField: <T>(formId: string, key: keyof T, value: T[keyof T]) => {
        const form = get().forms[formId];
        if (!form) throw new Error(`Form ${formId} not initialized`);

        const newValues = setValueAtPath(form.values, key as string, value);

        set((state) => ({
            forms: {
                ...state.forms,
                [formId]: {
                    ...state.forms[formId],
                    values: newValues,
                },
            },
        }));

        if (form.options.validateOnChange) {
            const runValidation = () => {
                get().validateField(formId, key);
                const confirmDeps = form.confirmDependencyMap?.[key as string] || [];
                const matchDeps = form.matchDependencyMap?.[key as string] || [];
                confirmDeps.forEach(dep => get().validateField(formId, dep as keyof T));
                matchDeps.forEach((dep) => get().validateField(formId, dep as keyof T));
            };

            if (form.options.debounce) {
                clearTimeout(form.debounceTimers[key as string]);
                const timer = setTimeout(runValidation, form.options.debounce);
                set((state) => ({
                    forms: {
                        ...state.forms,
                        [formId]: {
                            ...state.forms[formId],
                            debounceTimers: {
                                ...state.forms[formId].debounceTimers,
                                [key as string]: timer,
                            },
                        },
                    },
                }));
            } else {
                runValidation();
            }
        }
    },

    setErrors: <T>(formId: string, errors: ErrorMap<T>) => {
        set((state) => ({
            forms: {
                ...state.forms,
                [formId]: {
                    ...state.forms[formId],
                    errors,
                },
            },
        }));
    },

    resetForm: <T>(formId: string) => {
        const form = get().forms[formId];
        if (!form) throw new Error(`Form ${formId} not initialized`);
        set((state) => ({
            forms: {
                ...state.forms,
                [formId]: {
                    ...state.forms[formId],
                    values: cloneDeep(form.initialValues),
                    errors: {},
                },
            },
        }));
    },

    validateField: <T>(formId: string, key: keyof T) => {
        const form = get().forms[formId];
        if (!form) throw new Error(`Form ${formId} not initialized`);
        const val = getValueAtPath(form.values, key as string);
        const rules = form.rules[key];
        if (!rules) return;

        for (const rule of rules) {
            const err = validateSingleRule(rule, val, form.values);
            if (err) {
                get().setErrors(formId, { ...form.errors, [key]: err });
                return err;
            }
        }
        get().setErrors(formId, { ...form.errors, [key]: undefined });
    },

    validateForm: <T>(formId: string, customValues?: T) => {
        const form = get().forms[formId];
        if (!form) throw new Error(`Form ${formId} not initialized`);

        const valuesToValidate = customValues ?? form.values;
        const newErrors: ErrorMap<T> = {};

        for (const key in form.rules) {
            const val = getValueAtPath(valuesToValidate, key);
            const rules = form.rules[key];
            if (!rules) continue;

            for (const rule of rules) {
                const err = validateSingleRule(rule, val, valuesToValidate);
                if (err) {
                    newErrors[key as keyof T] = err;
                    break;
                }
            }
        }

        if (Object.keys(newErrors)?.length) {
            get().setErrors(formId, newErrors);
            return { success: false, errors: newErrors };
        }

        return { success: true, data: valuesToValidate };
    },

    getValues: <T>(formId: string) => {
        const form = get().forms[formId];
        return form?.values as T | undefined;
    },

    getErrors: <T>(formId: string) => {
        const form = get().forms[formId];
        return form?.errors as ErrorMap<T> | undefined;
    },

   isValid: (formId: string) => {
  const form = get().forms[formId];
  if (!form) return false; 
  return Object.values(form.errors).every((err) => !err);
}
}));

export const isFormInitialized = (formId: string) => {
    const forms = useGlobalFormsStore.getState().forms;
    return formId in forms;
};