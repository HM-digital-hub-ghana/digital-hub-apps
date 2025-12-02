import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiLogout } from "../service/auths";
import { logApiError } from "@/lib/utils";
import { routes } from "../constants/routes";

type AuthUser = {
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
} | null;

type AuthContextValue = {
  user: AuthUser;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean;
  isAdmin: boolean;
  isLoggingOut: boolean;
  login: (args: { token: string; user: AuthUser }) => void;
  logout: (options?: { redirectTo?: string; navigate?: (path: string) => void }) => void;
  setToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  //initialize localStorage synchronously
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token") || localStorage.getItem("access_token"));
  const [user, setUser] = useState<AuthUser>(() => {
    const raw = localStorage.getItem("user");
    try {
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [initializing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  //listen for token refresh using interceptor
  useEffect(() => {
    const handleTokenRefresh = (event: CustomEvent<{ token: string }>) => {
      console.log("[Auth] Token refresh event received");
      setToken(event.detail.token);
    };

    const handleUserProfileUpdated = (
      event: CustomEvent<Record<string, unknown>>
    ) => {
      console.log("[Auth] User profile updated event received");
      setUser((prev) => {
        const previousValue = prev ?? {};
        const nextValue = {
          ...previousValue,
          ...event.detail,
        } as AuthUser;
        return nextValue;
      });
    };

    window.addEventListener("tokenRefreshed", handleTokenRefresh as EventListener);
    window.addEventListener(
      "userProfileUpdated",
      handleUserProfileUpdated as EventListener
    );
    return () => {
      window.removeEventListener("tokenRefreshed", handleTokenRefresh as EventListener);
      window.removeEventListener(
        "userProfileUpdated",
        handleUserProfileUpdated as EventListener
      );
    };
  }, []);

  const login = useCallback(({ token, user }: { token: string; user: AuthUser }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));
  }, []);

  const updateToken = useCallback((newToken: string) => {
    console.log("[Auth] Updating token from refresh");
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }, []);

  const logout = useCallback(async (options?: { redirectTo?: string; navigate?: (path: string) => void }) => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    console.log("[Auth] Logout invoked with options:", options);
    
    try {
      console.log("[Auth] Step 1: Checking localStorage before clear:", {
        tokenBefore: localStorage.getItem("token"),
        accessTokenBefore: localStorage.getItem("access_token"),
        userBefore: localStorage.getItem("user"),
      });

      console.log("[Auth] Step 2: Calling server logout endpoint...");
      try {
        const response = await apiLogout();
        console.log("[Auth] Step 2.1: Server logout successful", {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        });
      } catch (error) {
        console.warn("[Auth] Step 2.1: Server logout failed, continuing with local logout");
        const axiosError = error as {
          response?: {
            data?: unknown;
            status?: number;
            statusText?: string;
          };
        };
        console.log("[Auth] Step 2.2: Full error details:", {
          status: axiosError?.response?.status,
          statusText: axiosError?.response?.statusText,
          responseData: axiosError?.response?.data,
        });
        logApiError(error, "AuthContext.logout");
      }

      console.log("[Auth] Step 3: Clearing localStorage and state...");
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);

      console.log("[Auth] Step 4: Verification after clear:", {
        tokenAfter: localStorage.getItem("token"),
        accessTokenAfter: localStorage.getItem("access_token"),
        userAfter: localStorage.getItem("user"),
      });

      console.log("[Auth] Step 5: Navigating to login page...");
      const to = options?.redirectTo ?? routes.login;
      
      if (options?.navigate) {
        console.log("[Auth] Using React Router navigation (no page reload)");
        options.navigate(to);
      } else {
        console.warn("[Auth] No navigate function provided, using window.location.replace (will cause page reload)");
        window.location.replace(to);
      }
      
      console.log("[Auth] ===== LOGOUT FLOW COMPLETE =====");
    } catch (error) {
      console.error("[Auth] Unexpected error during logout:", error);
      const to = options?.redirectTo ?? routes.login;
      if (options?.navigate) {
        options.navigate(to);
      } else {
        window.location.replace(to);
      }
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  const isAdmin = useMemo(() => {
    return user?.isAdmin ?? false;
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    initializing,
    isAdmin,
    isLoggingOut,
    login,
    logout,
    setToken: updateToken,
  }), [user, token, initializing, isAdmin, isLoggingOut, login, logout, updateToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}


