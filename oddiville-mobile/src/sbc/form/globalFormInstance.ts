import { useStore } from "zustand";
import { ErrorMap, useGlobalFormsStore } from "./useGlobalFormsStore";

export function useGlobalFormValidator<T>(formId: string) {
    const store = useGlobalFormsStore;

    const values = useStore(store, (s) => s.forms[formId]?.values);
    const errors = useStore(store, (s) => s.forms[formId]?.errors);

    return {
        values: values || {} as T,
        errors: errors || {},
        setField: (key: keyof T, value: T[keyof T]) => store.getState().setField(formId, key, value),
        setErrors: (errs: ErrorMap<T>) => store.getState().setErrors(formId, errs),
        validateField: (key: keyof T) => store.getState().validateField(formId, key),
        validateForm: (customValues?: T) => store.getState().validateForm<T>(formId, customValues),
        resetForm: () => store.getState().resetForm(formId),
    };
}