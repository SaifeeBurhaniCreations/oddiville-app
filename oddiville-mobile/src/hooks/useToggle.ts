import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseToggleOptions {
    /**
     * Fires only once when toggled the first time
     */
    once?: boolean;

    /**
     * Optional callback triggered on every toggle
     */
    onChange?: (newValue: boolean) => void;

    /**
     * Optional mount-safe update (prevent updates after unmount)
     */
    safeUpdate?: boolean;
}

export interface UseToggleResult {
    value: boolean;
    toggle: () => void;
    setOn: () => void;
    setOff: () => void;
    set: (val: boolean) => void;
    hasToggled: boolean;
}

export function useToggle(
    initialValue: boolean = false,
    options: UseToggleOptions = {}
): UseToggleResult {
    const { once = false, onChange, safeUpdate = true } = options;

    const isMounted = useRef(true);
    const [value, setValue] = useState<boolean>(initialValue);
    const hasToggledRef = useRef(false);

    useEffect(() => {
        if (!safeUpdate) return;

        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, [safeUpdate]);

    const update = useCallback(
        (val: boolean) => {
            if (safeUpdate && !isMounted.current) return;

            if (once && hasToggledRef.current) return;

            if (val !== value) {
                setValue(val);
                hasToggledRef.current = true;
                onChange?.(val);
            }
        },
        [once, onChange, safeUpdate, value]
    );

    const toggle = useCallback(() => update(!value), [update, value]);
    const setOn = useCallback(() => update(true), [update]);
    const setOff = useCallback(() => update(false), [update]);
    const set = useCallback((val: boolean) => update(val), [update]);

    return {
        value,
        toggle,
        setOn,
        setOff,
        set,
        hasToggled: hasToggledRef.current,
    };
}