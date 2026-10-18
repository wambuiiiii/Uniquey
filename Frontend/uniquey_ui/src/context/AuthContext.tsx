import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axiosInstance from "@/api/axios";

export type User = {
  id: string;
  email: string;
  role: "admin" | "customer";
  first_name: string;
  last_name: string;
} | null;

export interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  // Instantly check if EITHER token exists in the browser to prevent login flashes
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => typeof window !== "undefined" && (!!localStorage.getItem("access_token") || !!localStorage.getItem("refresh_token"))
  );

  // Start the app in a loading state only if a token was found
  const [isLoading, setIsLoading] = useState<boolean>(
    () => typeof window !== "undefined" && (!!localStorage.getItem("access_token") || !!localStorage.getItem("refresh_token"))
  );

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const access = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const refresh = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;

      // If absolutely no tokens exist, stop loading immediately (allows public pages to render instantly)
      if (!access && !refresh) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        // This will automatically trigger the Axios interceptor to use the Refresh Token if the Access Token is dead
        const res = await axiosInstance.get("accounts/me/");
        if (isMounted) {
          setUser(res.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // If the Refresh Token is also dead, completely wipe the session
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
