import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("jwt_token") ||
      localStorage.getItem("ADMIN_SECRET_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
