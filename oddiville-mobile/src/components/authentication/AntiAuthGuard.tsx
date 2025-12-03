import { useAuth } from "@/src/context/AuthContext";
import React, { useEffect } from "react";
import Loader from "../ui/Loader";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";

export const AntiAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, role } = useAuth();
  const {resetTo} = useAppNavigation();

  useEffect(() => {
    if (isAuthenticated && role) {
      resetTo("Main");
    }
  }, [isAuthenticated, role]);

  if (loading) return <Loader />;

  if (isAuthenticated && role) {
    return <Loader />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};
