"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSalesReport, type SalesReportData } from "@/lib/api/reports";
import { getCustomers, type Customer } from "@/lib/api/customers";

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "unpaid", label: "Unpaid" },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "service", label: "Service" },
];

export default function SalesReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);
  const [customerId, setCustomerId] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    getCustomers({ per_page: 1000 }).then((res) => {
      if (res.status === "success") setCustomers(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (customerId) params.customer_id = Number(customerId);
        if (businessType) params.business_type = businessType;
        if (paymentStatus) params.payment_status = paymentStatus;
        const res = await getSalesReport(params);
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load sales report", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [dateFrom, dateTo, customerId, businessType, paymentStatus, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  const STATUS_BADGES: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    partial: "bg-amber-50 text-amber-700 border border-amber-200",
    unpaid: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Report</h1>
          <p className="mt-1 text-sm text-slate-500">Detailed sales breakdown by date, customer, and status.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Customer</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="">All Customers</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Business Type</label>
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {BUSINESS_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Payment Status</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">Total Sales</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(data.summary.total_sales)}</p>
              <p className="text-xs text-slate-400">{data.summary.count} sales</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <p className="text-xs text-emerald-600">Total Paid</p>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(data.summary.total_paid)}</p>
              <p className="text-xs text-emerald-500">{data.summary.paid_count} sales</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <p className="text-xs text-amber-600">Partial</p>
              <p className="text-lg font-bold text-amber-700">{data.summary.count - data.summary.paid_count - data.summary.unpaid_count}</p>
              <p className="text-xs text-amber-500">sales</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
              <p className="text-xs text-red-600">Total Due</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(data.summary.total_due)}</p>
              <p className="text-xs text-red-500">{data.summary.unpaid_count} unpaid</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Sales Details</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Reference</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Total</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Paid</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Due</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.sales.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-16 text-center"><ShoppingCart className="mx-auto h-10 w-10 text-slate-300 mb-3" /><p className="text-sm font-semibold text-slate-600">No sales found</p></td></tr>
                  ) : (
                    data.sales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <button onClick={() => router.push(`/sales/${s.id}`)} className="text-sm font-mono font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">{s.reference_number}</button>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-700">{s.customer?.name || "—"}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{new Date(s.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 capitalize">{s.business_type}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-slate-700">{formatCurrency(s.total_amount)}</td>
                        <td className="px-5 py-3 text-right text-sm text-emerald-600">{formatCurrency(s.paid_amount)}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-red-600">{formatCurrency(s.due_amount)}</td>
                        <td className="px-5 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGES[s.payment_status] || ""}`}>{s.payment_status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
