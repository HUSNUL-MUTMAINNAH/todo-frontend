import api from './api';

export interface Task {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  deadline_date: string;
  deadline_time: string;
  reminder_type: string;
  reminder_datetime: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  deadline_today: number;
  progress_percentage: number;
  upcoming_task: Task | null;
}

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  category_id?: string | number;
  deadlineRange?: 'today' | 'week' | 'month';
  date?: string;
  sortBy?: 'deadline_near' | 'deadline_far' | 'priority' | 'name' | 'created_at';
}

export const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    const response = await api.get<{ tasks: Task[] }>('/tasks', { params: filters });
    return response.data.tasks;
  },

  async getTaskById(id: number | string): Promise<Task> {
    const response = await api.get<{ task: Task }>(`/tasks/${id}`);
    return response.data.task;
  },

  async createTask(taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Task> {
    const response = await api.post<{ task: Task }>('/tasks', taskData);
    return response.data.task;
  },

  async updateTask(id: number | string, taskData: Partial<Task>): Promise<Task> {
    const response = await api.put<{ task: Task }>(`/tasks/${id}`, taskData);
    return response.data.task;
  },

  async toggleComplete(id: number | string, isCompleted: boolean): Promise<Task> {
    const response = await api.put<{ task: Task }>(`/tasks/${id}/toggle`, { isCompleted });
    return response.data.task;
  },

  async deleteTask(id: number | string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },

  async getStats(): Promise<TaskStats> {
    const response = await api.get<{ stats: TaskStats }>('/tasks/stats');
    return response.data.stats;
  }
};
