  import React, { createContext, useContext } from 'react';

  import { useToggle, UseToggleResult } from './useToggle';

  interface TogglesMap {
    packageProductLoadingState: UseToggleResult;
  }

  const MultiToggleContext = createContext<TogglesMap | undefined>(undefined);

  export function MultiToggleProvider({ children }: { children: React.ReactNode }) {
    const packageProductLoadingState = useToggle();
    return (
      <MultiToggleContext.Provider value={{ packageProductLoadingState }}>
        {children}
      </MultiToggleContext.Provider>
    );
  }

  export function useMultiToggle() {
    const context = useContext(MultiToggleContext);
    if (!context) throw new Error('useMultiToggle must be used within MultiToggleProvider');
    return context;
  }