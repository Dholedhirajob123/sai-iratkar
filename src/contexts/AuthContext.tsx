import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AuthUser {
  mobileNumber: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("star_current_user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        const parsedUser: AuthUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("star_current_user");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback((userData: AuthUser, token: string) => {
    const normalizedUser: AuthUser = {
      mobileNumber: userData.mobileNumber,
      role: userData.role.toUpperCase(),
    };

    localStorage.setItem("token", token);
    localStorage.setItem("role", normalizedUser.role);
    localStorage.setItem("star_current_user", JSON.stringify(normalizedUser));

    setUser(normalizedUser);
  }, []);

  const refreshUser = useCallback(() => {
    const savedUser = localStorage.getItem("star_current_user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        const parsedUser: AuthUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to refresh user:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("star_current_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};