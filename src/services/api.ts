import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";
import { getToken, removeToken } from "./secureStore";

// Hardcode backend URL - bukan menggunakan process.env karena Expo export tidak mendukungnya
const BACKEND_URL = "https://todo-backend-eight-woad.vercel.app";

console.log('🔧 API Configuration:', { BACKEND_URL, platform: Platform.OS, NODE_ENV: process.env.NODE_ENV });

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,  // ✅ INCREASED from 10000 for Vercel serverless latency
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
    
    // ✅ ADD RETRY LOGIC for network errors
    const config = error.config;
    if (config && !config.retry) {
      config.retry = 0;
    }
    
    // Retry for network timeout (ECONNABORTED) or 5xx errors
    if ((error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500)) && config.retry < 3) {
      config.retry += 1;
      const delayMs = 1000 * config.retry; // exponential backoff
      console.log(`⏳ Retrying request (attempt ${config.retry}/3) after ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return api(config);
    }
    
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
