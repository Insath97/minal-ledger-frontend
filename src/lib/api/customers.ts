import api from "./axios-client";
import type { PaginatedResponse, ApiResponse } from "@/types";

export interface Customer {
  id: number;
  code: string;
  name: string;
  email: string | null;
  id_type: string | null;
  id_number: string | null;
  phone: string;
  phone_secondary: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  profile_image: string | null;
  nic_image: string | null;
  outstanding_balance: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerPayload {
  name: string;
  email?: string;
  id_type?: string;
  id_number?: string;
  phone: string;
  phone_secondary?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  profile_image?: File | null;
  nic_image?: File | null;
  notes?: string;
}

export interface CustomerListItem {
  id: number;
  name: string;
  code: string;
  phone: string;
  outstanding_balance: number;
}

export async function getCustomers(params?: Record<string, string | number | boolean>): Promise<ApiResponse<PaginatedResponse<Customer>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Customer>>>("/customers", { params });
  return data;
}

export async function getCustomerList(): Promise<ApiResponse<CustomerListItem[]>> {
  const { data } = await api.get<ApiResponse<CustomerListItem[]>>("/customers/list");
  return data;
}

export async function getCustomer(id: number): Promise<ApiResponse<Customer>> {
  const { data } = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
  return data;
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<ApiResponse<Customer>> {
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
  const { data } = await api.post<ApiResponse<Customer>>("/customers", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateCustomer(id: number, payload: FormData): Promise<ApiResponse<Customer>> {
  payload.append("_method", "PUT");
  const { data } = await api.post<ApiResponse<Customer>>(`/customers/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteCustomer(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/customers/${id}`);
  if (data.status !== "success") {
    throw new Error(data.message || "Failed to delete customer");
  }
  return data;
}

export async function toggleCustomerStatus(id: number): Promise<ApiResponse<{ id: number; is_active: boolean }>> {
  const { data } = await api.patch<ApiResponse<{ id: number; is_active: boolean }>>(`/customers/${id}/toggle-status`);
  return data;
}
