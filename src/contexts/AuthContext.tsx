import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  User,
  initializeStorage,
  getUserByPhone,
  addUser as storageAddUser,
  setCurrentUser,
  getCurrentUser,
  logout as storageLogout,
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => { success: boolean; pending?: boolean };
  register: (name: string, phone: string, password: string) => { success: boolean };
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeStorage();
    const current = getCurrentUser();
    if (current) {
      // Refresh from storage to get latest data
      const fresh = getUserByPhone(current.phone);
      if (fresh) {
        setUser(fresh);
        setCurrentUser(fresh);
      }
    }
    setLoading(false);
  }, []);

  const refreshUser = useCallback(() => {
    const current = getCurrentUser();
    if (current) {
      const fresh = getUserByPhone(current.phone);
      if (fresh) {
        setUser(fresh);
        setCurrentUser(fresh);
      }
    }
  }, []);

  const login = (phone: string, password: string) => {
    const found = getUserByPhone(phone);
    if (!found) {
      toast({ title: "Error", description: "User not found. Please register first.", variant: "destructive" });
      return { success: false };
    }
    if (found.password !== password) {
      toast({ title: "Error", description: "Invalid password.", variant: "destructive" });
      return { success: false };
    }
    if (found.status === "pending") {
      return { success: false, pending: true };
    }
    if (found.status === "rejected") {
      toast({ title: "Error", description: "Your account has been rejected.", variant: "destructive" });
      return { success: false };
    }
    setUser(found);
    setCurrentUser(found);
    return { success: true };
  };

  const register = (name: string, phone: string, password: string) => {
    const existing = getUserByPhone(phone);
    if (existing) {
      toast({ title: "Error", description: "Phone number already registered.", variant: "destructive" });
      return { success: false };
    }
    storageAddUser({ name, phone, password, role: "user", status: "pending", balance: 0 });
    toast({ title: "Success", description: "Registration successful! Please wait for admin approval." });
    return { success: true };
  };

  const handleLogout = () => {
    storageLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout: handleLogout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
