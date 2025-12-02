import { apiClient } from "./axios-config";

export const apiLogin = async (payload: {
  staff_id: string;
  password: string;
}) => {
  return apiClient.post("auth/login", payload);
};


export const apiRegister = async (payload:{
     staff_id: string;
     password: string;
}) => {
  return apiClient.post("auth/register", payload);
};

export const apiLogout = async () => {
  return apiClient.post("auth/logout", {});
};

export const apiRefreshToken = async () => {
  return apiClient.post(
    "auth/refresh",
    {},
    {
      withCredentials: true,//ensure httpOnly cookies are sent
    }
  );
};

export const apiForgot = async (payload:{
     email: string;
}) => {
  return apiClient.post("auth/forgot-password", payload);
};


export const apiResetPassword = async (payload: {
  token: string;
  password: string;
}) => {
  return apiClient.post("auth/reset-password", payload);
};
