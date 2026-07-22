import axios from "axios";

/**
 * Centralized Axios client for ContainerOps.
 * All table views and form submissions should import { api } from "@/lib/api".
 * Base URL defaults to the Spring Boot backend at http://localhost:8081.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      window.localStorage.removeItem("jwt_token");
      window.localStorage.removeItem("co_role");
    }
    return Promise.reject(error);
  },
);
