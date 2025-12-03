import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export function useSecureStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedValue = await SecureStore.getItemAsync(key);
      if (storedValue !== null) {
        try {
          setValue(JSON.parse(storedValue));
        } catch {
          setValue(storedValue as unknown as T);
        }
      }
      setLoading(false);
    })();
  }, [key]);

  const setStoredValue = async (newValue: T) => {
    setValue(newValue);
    await SecureStore.setItemAsync(key, JSON.stringify(newValue));
  };

  const removeStoredValue = async () => {
    await SecureStore.deleteItemAsync(key);
    setValue(initialValue);
  };

  return [value, setStoredValue, removeStoredValue, loading] as const;
}

