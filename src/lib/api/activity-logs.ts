import api from "./axios-client";
import type { PaginatedResponse, ApiResponse } from "@/types";

export interface ActivityLogUser {
  id: number;
  name: string;
  username: string;
  email: string | null;
}

export interface ActivityLog {
  id: number;
  user_id: number | null;
  action: string;
  module: string;
  description: string | null;
  payload: Record<string, unknown> | null;
  level: string;
  ip_address: string | null;
  user_agent: string | null;
  url: string | null;
  method: string | null;
  created_at: string;
  updated_at: string;
  user?: ActivityLogUser;
}

export interface GetActivityLogsParams {
  page?: number;
  per_page?: number;
  search?: string;
  module?: string;
  action?: string;
  level?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

export async function getActivityLogs(params?: GetActivityLogsParams): Promise<ApiResponse<PaginatedResponse<ActivityLog>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<ActivityLog>>>("/activity-logs", { params });
  return data;
}

export async function getActivityLog(id: number): Promise<ApiResponse<ActivityLog>> {
  const { data } = await api.get<ApiResponse<ActivityLog>>(`/activity-logs/${id}`);
  return data;
}

export async function getActivityLogModules(): Promise<ApiResponse<string[]>> {
  const { data } = await api.get<ApiResponse<string[]>>("/activity-logs/modules");
  return data;
}

export async function getActivityLogActions(): Promise<ApiResponse<string[]>> {
  const { data } = await api.get<ApiResponse<string[]>>("/activity-logs/actions");
  return data;
}
