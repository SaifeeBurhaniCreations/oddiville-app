import { useStore } from "zustand";
import { useGlobalFormsStore } from "@/src/sbc/form";

export function useIsFormValid(formId: string): boolean {
    return useStore(useGlobalFormsStore, (s) => s.isValid(formId));
}

export function isFormValid(formId: string): boolean {
    return useGlobalFormsStore.getState().isValid(formId);
}