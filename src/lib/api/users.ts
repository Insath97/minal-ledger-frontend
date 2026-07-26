import api from "./axios-client";
import type { RoleList, PaginatedResponse, ApiResponse } from "@/types";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  profile_image: string | null;
  user_type: string;
  is_active: boolean;
  can_login: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: RoleList[];
}

export interface GetUsersParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  role?: string;
}

export interface CreateUserPayload {
  name: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  is_active?: boolean;
  can_login?: boolean;
  roles?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  is_active?: boolean;
  can_login?: boolean;
  roles?: string[];
}

export async function getUsers(params?: GetUsersParams): Promise<ApiResponse<PaginatedResponse<User>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<User>>>("/users", { params });
  return data;
}

export async function getUserList(): Promise<ApiResponse<User[]>> {
  const { data } = await api.get<ApiResponse<User[]>>("/users/list");
  return data;
}

export async function getUser(id: number): Promise<ApiResponse<User>> {
  const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "roles" && Array.isArray(value)) {
        value.forEach((role) => formData.append("roles[]", role));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const { data } = await api.post<ApiResponse<User>>("/users", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
  const formData = new FormData();
  formData.append("_method", "PUT");
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "roles" && Array.isArray(value)) {
        value.forEach((role) => formData.append("roles[]", role));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const { data } = await api.post<ApiResponse<User>>(`/users/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteUser(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/users/${id}`);
  return data;
}

export async function toggleUserStatus(id: number): Promise<ApiResponse<{ id: number; is_active: boolean }>> {
  const { data } = await api.patch<ApiResponse<{ id: number; is_active: boolean }>>(`/users/${id}/toggle-status`);
  return data;
}

export async function toggleCanLogin(id: number): Promise<ApiResponse<{ id: number; can_login: boolean }>> {
  const { data } = await api.patch<ApiResponse<{ id: number; can_login: boolean }>>(`/users/${id}/toggle-can-login`);
  return data;
}
