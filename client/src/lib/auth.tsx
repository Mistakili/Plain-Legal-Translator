import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  isPremium: boolean;
  analysesUsedThisMonth: number;
  onboardingCompleted: boolean;
  createdAt: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, displayName?: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setUser(data);
    queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    return data;
  };

  const register = async (email: string, password: string, displayName?: string): Promise<AuthUser> => {
    const res = await apiRequest("POST", "/api/auth/register", { email, password, displayName });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setUser(data);
    queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    return data;
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    setUser(null);
    queryClient.clear();
    window.location.href = "/";
  };

  const updateUser = async (data: Partial<AuthUser>): Promise<AuthUser> => {
    const res = await apiRequest("PATCH", "/api/auth/user", data);
    const updated = await res.json();
    if (!res.ok) throw new Error(updated.error || "Update failed");
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
