import api from "./axios-client";

export interface DashboardStats {
  total_sales: number;
  sales_change: number;
  total_expenses: number;
  expenses_change: number;
  total_received: number;
  received_change: number;
  total_outstanding: number;
  outstanding_change: number;
}

export interface AnalyticsDataPoint {
  label: string;
  income: number;
  expense: number;
}

export interface AnalyticsResponse {
  type: "monthly" | "daily";
  year: number;
  month?: number;
  labels: AnalyticsDataPoint[];
}

export interface RecentSale {
  id: number;
  reference_number: string;
  customer_name: string;
  total_amount: number;
  due_amount: number;
  payment_status: string;
  sale_date: string;
}

export interface PendingCheque {
  id: number;
  cheque_number: string;
  customer_name: string;
  amount: number;
  bank_name: string;
  cheque_date: string;
}

export interface TopCustomer {
  id: number;
  name: string;
  code: string;
  outstanding_balance: number;
  phone: string;
}

export interface DashboardActivity {
  recent_sales: RecentSale[];
  pending_cheques: PendingCheque[];
  top_customers: TopCustomer[];
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const { data } = await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
  return data;
}

export async function getDashboardAnalytics(year: number, month?: number): Promise<ApiResponse<AnalyticsResponse>> {
  const params: Record<string, string | number> = { year };
  if (month) params.month = month;
  const { data } = await api.get<ApiResponse<AnalyticsResponse>>("/dashboard/analytics", { params });
  return data;
}

export async function getDashboardActivity(): Promise<ApiResponse<DashboardActivity>> {
  const { data } = await api.get<ApiResponse<DashboardActivity>>("/dashboard/activity");
  return data;
}
