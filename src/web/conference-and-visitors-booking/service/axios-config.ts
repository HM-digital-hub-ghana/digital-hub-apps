import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { navigate } from "@/lib/navigation";
import { routes } from "../constants/routes";

export const baseUrl = process.env.EXPO_PUBLIC_API_URL

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true, // Required to send HTTP-only cookies
});

apiClient.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always true for cookie-based auth
    config.withCredentials = true;
    
    // Don't send Bearer token for refresh endpoint - it only needs the refresh token cookie
    const isRefreshEndpoint = config.url?.includes("auth/refresh");
    
    if (!isRefreshEndpoint) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log refresh requests for debugging
    if (isRefreshEndpoint) {
      console.log("[Axios] Refresh token request interceptor:", {
        url: config.url,
        withCredentials: config.withCredentials,
        hasAuthHeader: false,
        note: "Refresh endpoint only uses refresh_token_cookie (HTTP-only cookie), no Bearer token sent",
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const statusText = error.response?.statusText;
    const errorData = error.response?.data;
    
    // Extract error message
    const errorDataObj = errorData as { message?: string; error?: string; detail?: string } | undefined;
    const errorMessage = 
      errorDataObj?.message || 
      errorDataObj?.error || 
      errorDataObj?.detail || 
      error.message || 
      "Unknown error";
    
    // Log error with status code and message
    console.error("API Request Failed:", {
      status,
      statusText,
      message: errorMessage,
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      responseData: errorData,
    });
    
    // Skip refresh logic for auth endpoints (login, register, refresh, forgot-password, reset-password) - they don't use refresh tokens
    const isAuthEndpoint = originalRequest?.url?.includes("auth/login") || 
                          originalRequest?.url?.includes("auth/register") || 
                          originalRequest?.url?.includes("auth/refresh") ||
                          originalRequest?.url?.includes("auth/forgot-password") ||
                          originalRequest?.url?.includes("auth/reset-password");
    
    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log("[Axios] 401 - Token refresh in progress, queueing request");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("[Axios] 401 - Attempting to refresh token using HTTP-only cookie");
        console.log("[Axios] Refresh endpoint URL:", `${baseUrl}/auth/refresh`);
        console.log("[Axios] Cookie name expected: refresh_token_cookie");
        console.log("[Axios] Request config:", {
          withCredentials: true,
          url: `${baseUrl}/auth/refresh`,
        });
        
        const response = await apiClient.post(
          "auth/refresh",
          {},
          {
            withCredentials: true, // Ensure httpOnly cookies are sent
          }
        );
        console.log("[Axios] Refresh response:", {
          status: response.status,
          data: response.data,
        });
        const { access_token } = response.data;
        
        console.log("[Axios] Token refresh successful");
        
        // Update token in localStorage
        localStorage.setItem("token", access_token);
        
        // Notify AuthContext to update its state
        window.dispatchEvent(new CustomEvent("tokenRefreshed", { detail: { token: access_token } }));
        
        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        
        // Process queued requests
        processQueue(null, access_token);
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        const refreshAxiosError = refreshError as AxiosError;
        console.error("[Axios] Token refresh failed:", refreshError);
        console.error("[Axios] Refresh error details:", {
          status: refreshAxiosError.response?.status,
          statusText: refreshAxiosError.response?.statusText,
          data: refreshAxiosError.response?.data,
          message: refreshAxiosError.message,
        });
        console.warn("[Axios] NOTE: Check Network tab → POST /auth/refresh → Request Headers → Cookie header");
        console.warn("[Axios] The refresh_token_cookie should be present in the Cookie header");
        console.warn("[Axios] If missing, check backend CORS settings (supports_credentials=True) and cookie SameSite settings");
        
        // Process queued requests with error
        processQueue(refreshAxiosError, null);
        
        // Clear all tokens and redirect to login
        console.log("[Axios] Refresh failed - clearing auth and redirecting to login");
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate(routes.login);
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);