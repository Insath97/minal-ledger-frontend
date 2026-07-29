import api from "./axios-client";
import type { PaginatedResponse, ApiResponse } from "@/types";

export interface PaymentCustomer {
  id: number;
  code: string;
  name: string;
  phone: string;
  email?: string;
  outstanding_balance?: number;
}

export interface PaymentCreator {
  id: number;
  name: string;
  username?: string;
}

export interface PaymentSaleAllocation {
  id: number;
  payment_id: number;
  sale_id: number;
  allocated_amount: number;
  sale?: {
    id: number;
    reference_number: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    payment_status: string;
    sale_date?: string;
  };
}

export interface Payment {
  id: number;
  customer_id: number;
  cheque_id: number | null;
  total_amount: number;
  payment_method: "cash" | "credit_card" | "bank_transfer" | "cheque";
  payment_date: string;
  proof_image_path: string | null;
  notes: string | null;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  customer?: PaymentCustomer;
  cheque?: { id: number; cheque_number: string; bank_name: string };
  creator?: PaymentCreator;
  paymentSales?: PaymentSaleAllocation[];
  payment_sales?: PaymentSaleAllocation[];
}

export interface CreatePaymentPayload {
  customer_id: number;
  total_amount: number;
  payment_method: string;
  payment_date: string;
  sale_ids?: number[];
  cheque_id?: number;
  notes?: string;
  proof_image?: File | null;
}

export async function getPayments(params?: Record<string, string | number | boolean>): Promise<ApiResponse<PaginatedResponse<Payment>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Payment>>>("/payments", { params });
  return data;
}

export async function getPayment(id: number): Promise<ApiResponse<Payment>> {
  const { data } = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
  return data;
}

export async function createPayment(payload: CreatePaymentPayload): Promise<ApiResponse<Payment>> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v, i) => formData.append(`${key}[${i}]`, String(v)));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const { data } = await api.post<ApiResponse<Payment>>("/payments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deletePayment(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/payments/${id}`);
  return data;
}
