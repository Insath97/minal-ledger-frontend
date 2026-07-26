import api from "./axios-client";
import type { Permission, PaginatedResponse, ApiResponse } from "@/types";

export interface GetPermissionsParams {
  page?: number;
  per_page?: number;
  search?: string;
  group_name?: string;
  guard_name?: string;
}

export interface PermissionListParams {
  group_name?: string;
}

export async function getPermissions(params?: GetPermissionsParams): Promise<ApiResponse<PaginatedResponse<Permission>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Permission>>>("/permissions", { params });
  return data;
}

export async function getPermissionList(params?: PermissionListParams): Promise<ApiResponse<Permission[]>> {
  const { data } = await api.get<ApiResponse<Permission[]>>("/permissions/list", { params });
  return data;
}

export async function getPermission(id: number): Promise<ApiResponse<Permission>> {
  const { data } = await api.get<ApiResponse<Permission>>(`/permissions/${id}`);
  return data;
}

export async function createPermission(payload: { name: string; group_name: string }): Promise<ApiResponse<Permission>> {
  const { data } = await api.post<ApiResponse<Permission>>("/permissions", payload);
  return data;
}

export async function updatePermission(id: number, payload: { name?: string; group_name?: string }): Promise<ApiResponse<Permission>> {
  const { data } = await api.put<ApiResponse<Permission>>(`/permissions/${id}`, payload);
  return data;
}

export async function deletePermission(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/permissions/${id}`);
  return data;
}
