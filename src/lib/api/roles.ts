import api from "./axios-client";
import type { Role, RoleList, Permission, PaginatedResponse, ApiResponse } from "@/types";

export interface GetRolesParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateRolePayload {
  name: string;
  permissions: number[];
  is_protected?: boolean;
}

export interface UpdateRolePayload {
  name?: string;
  permissions?: number[];
  is_protected?: boolean;
}

export async function getRoles(params?: GetRolesParams): Promise<ApiResponse<PaginatedResponse<Role>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Role>>>("/roles", { params });
  return data;
}

export async function getRoleList(): Promise<ApiResponse<RoleList[]>> {
  const { data } = await api.get<ApiResponse<RoleList[]>>("/roles/list");
  return data;
}

export async function getRole(id: number): Promise<ApiResponse<Role>> {
  const { data } = await api.get<ApiResponse<Role>>(`/roles/${id}`);
  return data;
}

export async function createRole(payload: CreateRolePayload): Promise<ApiResponse<Role>> {
  const { data } = await api.post<ApiResponse<Role>>("/roles", payload);
  return data;
}

export async function updateRole(id: number, payload: UpdateRolePayload): Promise<ApiResponse<Role>> {
  const { data } = await api.put<ApiResponse<Role>>(`/roles/${id}`, payload);
  return data;
}

export async function deleteRole(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/roles/${id}`);
  return data;
}
