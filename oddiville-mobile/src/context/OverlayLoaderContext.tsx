import React, { createContext, useContext, useRef, useState } from "react";
import OverlayLoader from "@/src/components/ui/OverlayLoader";

/**
 * Why counter instead of boolean?
 * Because multiple APIs can run at same time.
 * First finishes should NOT hide loader of second.
 */

type LoaderContextType = {
  show: () => void;
  hide: () => void;
  bind: (loading: boolean) => void;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

export const OverlayLoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const counter = useRef(0);
  const last = useRef(false);

  const update = () => setVisible(counter.current > 0);

  const show = () => {
    counter.current += 1;
    update();
  };

  const hide = () => {
    counter.current = Math.max(0, counter.current - 1);
    update();
  };

  /**
   * React Query safe binding
   * Converts boolean → ref counted transitions
   */
  const bind = (loading: boolean) => {
    if (loading && !last.current) {
      counter.current += 1;
    }

    if (!loading && last.current) {
      counter.current = Math.max(0, counter.current - 1);
    }

    last.current = loading;
    update();
  };

  return (
    <LoaderContext.Provider value={{ show, hide, bind }}>
      {children}
      {visible && <OverlayLoader />}
    </LoaderContext.Provider>
  );
};

export const useOverlayLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useOverlayLoader must be used inside OverlayLoaderProvider");
  return ctx;
};