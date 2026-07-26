import api from "./axios-client";
import type { PaginatedResponse, ApiResponse } from "@/types";

export interface Bank {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankList {
  id: number;
  name: string;
  code: string;
}

export interface GetBanksParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateBankPayload {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateBankPayload {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
}

export async function getBanks(params?: GetBanksParams): Promise<ApiResponse<PaginatedResponse<Bank>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Bank>>>("/banks", { params });
  return data;
}

export async function getBankList(): Promise<ApiResponse<BankList[]>> {
  const { data } = await api.get<ApiResponse<BankList[]>>("/banks/list");
  return data;
}

export async function getBank(id: number): Promise<ApiResponse<Bank>> {
  const { data } = await api.get<ApiResponse<Bank>>(`/banks/${id}`);
  return data;
}

export async function createBank(payload: CreateBankPayload): Promise<ApiResponse<Bank>> {
  const { data } = await api.post<ApiResponse<Bank>>("/banks", payload);
  return data;
}

export async function updateBank(id: number, payload: UpdateBankPayload): Promise<ApiResponse<Bank>> {
  const { data } = await api.put<ApiResponse<Bank>>(`/banks/${id}`, payload);
  return data;
}

export async function deleteBank(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/banks/${id}`);
  return data;
}

export async function toggleBankStatus(id: number): Promise<ApiResponse<{ id: number; is_active: boolean }>> {
  const { data } = await api.patch<ApiResponse<{ id: number; is_active: boolean }>>(`/banks/${id}/toggle-status`);
  return data;
}
