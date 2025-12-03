import React, { createContext, useEffect, useState, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import api from "@/src/lib/axios";

type UserRole = "admin" | "superadmin" | null;

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const data = await SecureStore.getItemAsync("newsync");

      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.role === "admin" || parsed.role === "superadmin") {
          setRole(parsed.role);
        } else {
          setRole(null); 
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (userRole: UserRole) => {
    await SecureStore.setItemAsync("newsync", JSON.stringify({ role: userRole }));
    setRole(userRole);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("newsync");
    await SecureStore.deleteItemAsync("metadata");
    delete api.defaults.headers.common["Authorization"];
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, isAuthenticated: !!role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;