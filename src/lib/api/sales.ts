import api from "./axios-client";
import type { PaginatedResponse, ApiResponse } from "@/types";

export interface SaleCustomer {
  id: number;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address_line1?: string;
  city?: string;
  outstanding_balance?: number;
}

export interface SaleCreator {
  id: number;
  name: string;
  username?: string;
}

export interface SaleCheque {
  id: number;
  cheque_number: string;
  bank_name: string;
  cheque_date: string;
  amount: number;
  cheque_image: string | null;
  status: string;
}

export interface SalePayment {
  id: number;
  total_amount: number;
  payment_method: string;
  payment_date: string;
  notes: string | null;
}

export interface SalePaymentSale {
  id: number;
  payment_id: number;
  sale_id: number;
  allocated_amount: number;
  payment?: SalePayment;
}

export interface Sale {
  id: number;
  reference_number: string;
  invoice_number: string | null;
  customer_id: number | null;
  business_type: "retail" | "wholesale";
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_status: "paid" | "partial" | "unpaid";
  sale_date: string;
  bill_image: string | null;
  notes: string | null;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  customer?: SaleCustomer;
  creator?: SaleCreator;
  cheques?: SaleCheque[];
  payment_sales?: SalePaymentSale[];
}

export interface CreateSalePayload {
  business_type: "retail" | "wholesale";
  customer_id?: number | null;
  invoice_number?: string;
  total_amount: number;
  paid_amount?: number;
  sale_date: string;
  notes?: string;
  bill_image?: File | null;
  payment_method?: string;
  cheque_number?: string;
  bank_name?: string;
  cheque_date?: string;
  cheque_amount?: number;
  cheque_image?: File | null;
}

export interface UpdateSalePayload {
  invoice_number?: string;
  sale_date?: string;
  notes?: string;
  bill_image?: File | string | null;
}

export async function getSales(params?: Record<string, string | number | boolean>): Promise<ApiResponse<PaginatedResponse<Sale>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Sale>>>("/sales", { params });
  return data;
}

export async function getSale(id: number): Promise<ApiResponse<Sale>> {
  const { data } = await api.get<ApiResponse<Sale>>(`/sales/${id}`);
  return data;
}

export async function createSale(payload: CreateSalePayload): Promise<ApiResponse<Sale>> {
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
  const { data } = await api.post<ApiResponse<Sale>>("/sales", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateSale(id: number, payload: UpdateSalePayload): Promise<ApiResponse<Sale>> {
  const formData = new FormData();
  formData.append("_method", "PUT");
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "string" && key.endsWith("_image")) {
        // Skip string values for image fields (keep existing)
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const { data } = await api.post<ApiResponse<Sale>>(`/sales/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteSale(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/sales/${id}`);
  return data;
}

export async function getUnpaidSales(customerId?: number): Promise<ApiResponse<Sale[]>> {
  const params: Record<string, string | number> = {};
  if (customerId) params.customer_id = customerId;
  const { data } = await api.get<ApiResponse<Sale[]>>("/sales/list", { params });
  return data;
}
