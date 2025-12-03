import { useAuth } from "../context/AuthContext";

export const useIsAuthorized = (allowed: string[]) => {
    const { role } = useAuth();
    return allowed.includes(role ?? "");
  };