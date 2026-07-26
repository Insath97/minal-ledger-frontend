import api from "./axios-client";
import type { ApiResponse } from "@/types";

export interface FinancialDashboard {
  date_range: { from: string; to: string };
  total_income: number;
  total_expenses: number;
  net_profit: number;
  total_receivable: number;
  pending_cheques: { count: number; total_amount: number };
}

export interface PnLMonthly {
  month_number: number;
  month_name: string;
  income: number;
  expense: number;
  net_profit: number;
}

export interface PnLData {
  year: number;
  monthly: PnLMonthly[];
}

export interface IncomeBreakdown {
  date_range: { from: string; to: string };
  grand_total: number;
  by_method: Array<{ payment_method: string; total_amount: number; total_count: number }>;
}

export interface ExpenseBreakdown {
  date_range: { from: string; to: string };
  grand_total: number;
  by_category: Array<{ category: string; total_amount: number; total_count: number }>;
}

export interface DuesAgingSummary {
  current_0_30: number;
  aging_31_60: number;
  aging_61_90: number;
  over_90: number;
  total_due: number;
}

export interface DuesAgingSale {
  sale_id: number;
  reference_number: string;
  customer: { id: number; code: string; name: string; phone: string } | null;
  sale_date: string;
  days_outstanding: number;
  due_amount: number;
  aging_bucket: string;
}

export interface DuesAgingData {
  summary: DuesAgingSummary;
  sales: DuesAgingSale[];
}

export async function getFinanceDashboard(params?: { date_from?: string; date_to?: string }): Promise<ApiResponse<FinancialDashboard>> {
  const { data } = await api.get<ApiResponse<FinancialDashboard>>("/finance/dashboard", { params });
  return data;
}

export async function getPnL(params?: { year?: number }): Promise<ApiResponse<PnLData>> {
  const { data } = await api.get<ApiResponse<PnLData>>("/finance/pnl", { params });
  return data;
}

export async function getIncomeBreakdown(params?: { date_from?: string; date_to?: string }): Promise<ApiResponse<IncomeBreakdown>> {
  const { data } = await api.get<ApiResponse<IncomeBreakdown>>("/finance/income-breakdown", { params });
  return data;
}

export async function getExpenseBreakdown(params?: { date_from?: string; date_to?: string }): Promise<ApiResponse<ExpenseBreakdown>> {
  const { data } = await api.get<ApiResponse<ExpenseBreakdown>>("/finance/expense-breakdown", { params });
  return data;
}

export async function getDuesAging(): Promise<ApiResponse<DuesAgingData>> {
  const { data } = await api.get<ApiResponse<DuesAgingData>>("/finance/dues-aging");
  return data;
}
