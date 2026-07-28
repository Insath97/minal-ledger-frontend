import api from "./axios-client";
import type { ApiResponse } from "@/types";

export interface SalesReportSummary {
  total_sales: number;
  total_paid: number;
  total_due: number;
  count: number;
  paid_count: number;
  partial_count: number;
  unpaid_count: number;
}

export interface SalesReportData {
  date_range: { from: string; to: string };
  summary: SalesReportSummary;
  sales: Array<{
    id: number;
    reference_number: string;
    customer: { id: number; code: string; name: string; phone: string } | null;
    sale_date: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    payment_status: string;
    business_type: string;
  }>;
}

export interface CustomerStatementTransaction {
  type: "sale" | "payment";
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface CustomerStatementData {
  customer: { id: number; code: string; name: string; phone: string; outstanding_balance: number };
  summary: { total_sales: number; total_payments: number; net_balance: number };
  transactions: CustomerStatementTransaction[];
}

export interface ChequeReportSummary {
  total_count: number;
  total_amount: number;
  pending_count: number;
  pending_amount: number;
  cleared_count: number;
  cleared_amount: number;
  bounced_count: number;
  bounced_amount: number;
}

export interface ChequeReportData {
  summary: ChequeReportSummary;
  by_bank: Array<{ bank_name: string; count: number; total_amount: number }>;
  cheques: Array<{
    id: number;
    cheque_number: string;
    customer: { id: number; code: string; name: string } | null;
    bank_name: string;
    amount: number;
    cheque_date: string;
    status: string;
  }>;
}

export interface PaymentReportData {
  date_range: { from: string; to: string };
  summary: { total_amount: number; count: number };
  by_method: Array<{ method: string; count: number; total_amount: number }>;
  by_customer: Array<{ customer_name: string; count: number; total_amount: number }>;
  payments: Array<{
    id: number;
    customer: { id: number; code: string; name: string } | null;
    total_amount: number;
    payment_method: string;
    payment_date: string;
  }>;
}

export interface ExpenseSummaryData {
  year: number;
  grand_total: number;
  monthly: Array<{ month: string; total_amount: number; count: number }>;
  by_category: Array<{ category: string; total_amount: number; count: number }>;
}

export interface MonthlySummaryData {
  year: number;
  total_income: number;
  total_expense: number;
  total_profit: number;
  monthly: Array<{ month: string; income: number; expense: number; profit: number }>;
}

export async function getSalesReport(params?: {
  date_from?: string;
  date_to?: string;
  customer_id?: number;
  business_type?: string;
  payment_status?: string;
}): Promise<ApiResponse<SalesReportData>> {
  const { data } = await api.get<ApiResponse<SalesReportData>>("/reports/sales", { params });
  return data;
}

export async function getCustomerStatement(params: {
  customer_id: number;
  date_from?: string;
  date_to?: string;
  month?: number;
  year?: number;
}): Promise<ApiResponse<CustomerStatementData>> {
  const { data } = await api.get<ApiResponse<CustomerStatementData>>("/reports/customer-statement", { params });
  return data;
}

export async function getChequeReport(params?: {
  date_from?: string;
  date_to?: string;
  status?: string;
  bank_name?: string;
}): Promise<ApiResponse<ChequeReportData>> {
  const { data } = await api.get<ApiResponse<ChequeReportData>>("/reports/cheques", { params });
  return data;
}

export async function getPaymentReport(params?: {
  date_from?: string;
  date_to?: string;
  payment_method?: string;
  customer_id?: number;
}): Promise<ApiResponse<PaymentReportData>> {
  const { data } = await api.get<ApiResponse<PaymentReportData>>("/reports/payments", { params });
  return data;
}

export async function getExpenseSummary(params?: {
  year?: number;
  date_from?: string;
  date_to?: string;
}): Promise<ApiResponse<ExpenseSummaryData>> {
  const { data } = await api.get<ApiResponse<ExpenseSummaryData>>("/reports/expense-summary", { params });
  return data;
}

export async function getMonthlySummary(params?: {
  year?: number;
}): Promise<ApiResponse<MonthlySummaryData>> {
  const { data } = await api.get<ApiResponse<MonthlySummaryData>>("/reports/monthly-summary", { params });
  return data;
}
