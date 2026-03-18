import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getCurrentUser } from "@/lib/gameApi";

export interface AuthUser {
  id: number;
  name: string;
  balance: number;
  mobileNumber: string;
  role: string;
  status?: string;
  canAddPlayerName?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (userData: AuthUser): AuthUser => {
    return {
      id: Number(userData.id),
      name: userData.name || "",
      mobileNumber: userData.mobileNumber,
      role: userData.role?.toUpperCase() || "USER",
      balance: Number(userData.balance ?? 0),
      status: userData.status,
      canAddPlayerName: userData.canAddPlayerName ?? false,
    };
  };

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser(token);
      const normalizedUser = normalizeUser(currentUser);

      localStorage.setItem("role", normalizedUser.role);
      localStorage.setItem("star_current_user", JSON.stringify(normalizedUser));

      setUser(normalizedUser);
    } catch (error) {
      console.error("Failed to load current user:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("star_current_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback((userData: AuthUser, token: string) => {
    const normalizedUser = normalizeUser(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("role", normalizedUser.role);
    localStorage.setItem("star_current_user", JSON.stringify(normalizedUser));

    setUser(normalizedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await getCurrentUser(token);
      const normalizedUser = normalizeUser(currentUser);

      localStorage.setItem("role", normalizedUser.role);
      localStorage.setItem("star_current_user", JSON.stringify(normalizedUser));

      setUser(normalizedUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("star_current_user");
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