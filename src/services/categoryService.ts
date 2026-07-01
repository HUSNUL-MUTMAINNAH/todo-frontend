import api from './api';

export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<{ categories: Category[] }>('/categories');
    return response.data.categories;
  },

  async createCategory(categoryData: Omit<Category, 'id' | 'user_id'>): Promise<Category> {
    const response = await api.post<{ category: Category }>('/categories', categoryData);
    return response.data.category;
  },

  async updateCategory(id: number | string, categoryData: Partial<Category>): Promise<Category> {
    const response = await api.put<{ category: Category }>(`/categories/${id}`, categoryData);
    return response.data.category;
  },

  async deleteCategory(id: number | string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/categories/${id}`);
    return response.data;
  }
};
