"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  user: null,
  loading: true,
});

// Configure default axios settings
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Silent refresh handler
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newAccessToken = response.data.accessToken;
      setToken(newAccessToken);
      localStorage.setItem("rentiq_token", newAccessToken);
      return newAccessToken;
    } catch {
      setToken(null);
      localStorage.removeItem("rentiq_token");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // On initial mount, attempt silent refresh via HttpOnly cookie
    const storedToken = localStorage.getItem("rentiq_token");
    if (storedToken) {
      setToken(storedToken);
      setLoading(false);
    } else {
      refreshToken();
    }
  }, [refreshToken]);

  // Axios response interceptor to handle 401 token expiration silently
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/auth/refresh") &&
          !originalRequest.url?.includes("/auth/login")
        ) {
          originalRequest._retry = true;
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  const login = (newToken: string) => {
    localStorage.setItem("rentiq_token", newToken);
    setToken(newToken);
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
      }
    } catch {
      // Ignore logout errors if session expired
    } finally {
      localStorage.removeItem("rentiq_token");
      setToken(null);
    }
  };

  const getUserFromToken = (token: string | null) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  };

  const user = getUserFromToken(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
