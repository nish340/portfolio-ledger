import React, { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  email: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("jwt_token"));
  const [email, setEmail] = useState(() => localStorage.getItem("user_email") || "");

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem("user_email", data.email);
    setEmail(data.email);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_email");
    setIsAuthenticated(false);
    setEmail("");
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
