import api from "./axios-client";
import type { PaginatedResponse, ApiResponse } from "@/types";

export interface ExpenseItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  notes?: string;
}

export interface ExpenseCreator {
  id: number;
  name: string;
  username?: string;
}

export interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  receipt_image: string | null;
  bill_image: string | null;
  notes: string | null;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  creator?: ExpenseCreator;
  updater?: ExpenseCreator;
  items?: ExpenseItem[];
  expense_items?: ExpenseItem[];
}

export async function getExpenses(params?: Record<string, string | number | boolean>): Promise<ApiResponse<PaginatedResponse<Expense>>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Expense>>>("/expenses", { params });
  return data;
}

export async function getExpense(id: number): Promise<ApiResponse<Expense>> {
  const { data } = await api.get<ApiResponse<Expense>>(`/expenses/${id}`);
  return data;
}

export async function createExpense(payload: FormData): Promise<ApiResponse<Expense>> {
  const { data } = await api.post<ApiResponse<Expense>>("/expenses", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateExpense(id: number, payload: FormData): Promise<ApiResponse<Expense>> {
  payload.append("_method", "PUT");
  const { data } = await api.post<ApiResponse<Expense>>(`/expenses/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteExpense(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/expenses/${id}`);
  return data;
}
