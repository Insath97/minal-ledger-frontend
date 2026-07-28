import api from "./axios-client";
import type { ApiResponse } from "@/types";

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

export async function getPnL(params?: { year?: number }): Promise<ApiResponse<PnLData>> {
  const { data } = await api.get<ApiResponse<PnLData>>("/reports/pnl", { params });
  return data;
}

export async function getDuesAging(): Promise<ApiResponse<DuesAgingData>> {
  const { data } = await api.get<ApiResponse<DuesAgingData>>("/reports/dues-aging");
  return data;
}
