import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";
import { getToken, removeToken } from "./secureStore";

// Hardcode backend URL - bukan menggunakan process.env karena Expo export tidak mendukungnya
const BACKEND_URL = "https://todo-backend-eight-woad.vercel.app";

console.log('🔧 API Configuration:', { BACKEND_URL, platform: Platform.OS, NODE_ENV: process.env.NODE_ENV });

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject JWT token in outgoing requests
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor to handle global response errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log('📡 Response interceptor caught error:', error.response?.status);
    
    if (error.response && error.response.status === 401) {
      console.log('🔴 401 Unauthorized - token is invalid or expired');
      // Clear token and redirect to login if unauthorized (expired/invalid token)
      await removeToken();
      console.log('✅ Token cleared');
      
      // Ensure we redirect to login route
      setTimeout(() => {
        console.log('🔀 Redirecting to login...');
        router.replace("/(auth)/login");
      }, 500);
    }
    return Promise.reject(error);
  },
);

export default api;
