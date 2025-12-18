import React, { createContext, useEffect, useState, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import api from "@/src/lib/axios";
import { Policy } from "../utils/policiesUtils";

type UserRole = "admin" | "superadmin" | "supervisor" | null;

interface AuthContextType {
  role: UserRole;
  policies: Policy[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (role: UserRole, policies: Policy[]) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const data = await SecureStore.getItemAsync("newsync");

      if (data) {
        const parsed = JSON.parse(data);
        if (
          parsed.role === "admin" ||
          parsed.role === "superadmin" ||
          parsed.role === "supervisor"
        ) {
          setRole(parsed.role);
          setPolicies(parsed.policies ?? []);
        } else {
          setRole(null);
          setPolicies([]);
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (userRole: UserRole, userPolicies: Policy[]) => {
    await SecureStore.setItemAsync(
      "newsync",
      JSON.stringify({ role: userRole, policies: userPolicies })
    );

    setRole(userRole);
    setPolicies(userPolicies);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("newsync");
    await SecureStore.deleteItemAsync("metadata");
    delete api.defaults.headers.common["Authorization"];
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated: !!role,
        loading,
        login,
        logout,
        policies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
