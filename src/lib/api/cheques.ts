import api from "./axios-client";
import type { PaginatedResponse, ApiResponse } from "@/types";

export interface ChequeCustomer {
  id: number;
  code: string;
  name: string;
  phone: string;
  email?: string;
  outstanding_balance?: number;
}

export interface ChequeSale {
  id: number;
  reference_number: string;
  total_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  payment_status?: string;
}

export interface ChequeCreator {
  id: number;
  name: string;
  username?: string;
}

export interface Cheque {
  id: number;
  customer_id: number;
  sale_id: number | null;
  cheque_number: string;
  bank_name: string;
  cheque_date: string;
  amount: number;
  cheque_image: string | null;
  status: "pending" | "cleared" | "bounced" | "cancelled";
  clearance_date: string | null;
  notes: string | null;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  customer?: ChequeCustomer;
  sale?: ChequeSale;
  creator?: ChequeCreator;
  updater?: ChequeCreator;
}

export interface CreateChequePayload {
  customer_id: number;
  sale_id?: number | null;
  cheque_number: string;
  bank_name: string;
  cheque_date: string;
  amount: number;
  cheque_image?: File | null;
  notes?: string;
}

export interface UpdateChequeStatusPayload {
  status: "cleared" | "bounced" | "cancelled";
  clearance_date?: string;
  notes?: string;
}

export async function getCheques(params?: Record<string, string | number | boolean>): Promise<ApiResponse<PaginatedResponse<Cheque>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Cheque>>>("/cheques", { params });
  return data;
}

export async function getCheque(id: number): Promise<ApiResponse<Cheque>> {
  const { data } = await api.get<ApiResponse<Cheque>>(`/cheques/${id}`);
  return data;
}

export async function createCheque(payload: CreateChequePayload): Promise<ApiResponse<Cheque>> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const { data } = await api.post<ApiResponse<Cheque>>("/cheques", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateChequeStatus(id: number, payload: UpdateChequeStatusPayload): Promise<ApiResponse<Cheque>> {
  const { data } = await api.patch<ApiResponse<Cheque>>(`/cheques/${id}/status`, payload);
  return data;
}

export async function deleteCheque(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/cheques/${id}`);
  return data;
}

export async function getPendingCheques(customerId?: number): Promise<ApiResponse<Cheque[]>> {
  const params: Record<string, string | number> = {};
  if (customerId) params.customer_id = customerId;
  const { data } = await api.get<ApiResponse<Cheque[]>>("/cheques/list", { params });
  return data;
}
