import React, { createContext, useContext, useState, useCallback } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => boolean;
  username: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PASS_KEY = "app_password";
const DEFAULT_PASS = "admin123";
const AUTH_KEY = "app_auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === "true";
  });

  const getPassword = () => localStorage.getItem(PASS_KEY) || DEFAULT_PASS;

  const login = useCallback((password: string) => {
    if (password === getPassword()) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, "true");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const changePassword = useCallback((oldPass: string, newPass: string) => {
    if (oldPass === getPassword()) {
      localStorage.setItem(PASS_KEY, newPass);
      return true;
    }
    return false;
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword, username: "Carmelo Curro" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
