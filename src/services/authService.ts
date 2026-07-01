import api from './api';

export interface UserProfile {
  id: number;
  fullname: string;
  email: string;
  photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  token?: string;  // Token bersifat optional (hanya ada saat login)
  user: Partial<UserProfile>;
}

export const authService = {
  async register(fullname: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', { fullname, email, password });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', { email, password });
    return response.data;
  },

  async getProfile(): Promise<UserProfile> {
    const response = await api.get<{ user: UserProfile }>('/profile');
    return response.data.user;
  },

  async updateProfile(fullname: string, email: string, photo: string | null): Promise<UserProfile> {
    const response = await api.put<{ user: UserProfile }>('/profile', { fullname, email, photo });
    return response.data.user;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/change-password', { oldPassword, newPassword });
    return response.data;
  }
};
