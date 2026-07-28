"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowDownRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getPaymentReport, type PaymentReportData } from "@/lib/api/reports";

const METHOD_OPTIONS = [
  { value: "", label: "All Methods" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
];

const METHOD_BADGES: Record<string, string> = {
  cash: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  bank_transfer: "bg-blue-50 text-blue-700 border border-blue-200",
  cheque: "bg-amber-50 text-amber-700 border border-amber-200",
  card: "bg-purple-50 text-purple-700 border border-purple-200",
};

export default function PaymentReportPage() {
  const { toast } = useToast();
  const [data, setData] = useState<PaymentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (paymentMethod) params.payment_method = paymentMethod;
        const res = await getPaymentReport(params);
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load payment report", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [dateFrom, dateTo, paymentMethod, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Report</h1>
        <p className="mt-1 text-sm text-slate-500">Payments received by method, customer, and date range.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <p className="text-xs text-emerald-600">Total Payments</p>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(data.summary.total_amount)}</p>
              <p className="text-xs text-emerald-500">{data.summary.count} payments</p>
            </div>
          </div>

          {data.by_method.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">By Payment Method</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.by_method.map((m) => (
                  <div key={m.method} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${METHOD_BADGES[m.method] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>{m.method}</span>
                    <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(m.total_amount)}</p>
                    <p className="text-xs text-slate-500">{m.count} payments</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.by_customer.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">By Customer</h3>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Payments</th>
                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.by_customer.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-slate-700">{c.customer_name}</td>
                        <td className="px-5 py-3 text-right text-sm text-slate-600">{c.count}</td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(c.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Payment Details</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">ID</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Method</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.payments.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-16 text-center"><ArrowDownRight className="mx-auto h-10 w-10 text-slate-300 mb-3" /><p className="text-sm font-semibold text-slate-600">No payments found</p></td></tr>
                  ) : (
                    data.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-mono text-slate-600">PAY-{p.id}</td>
                        <td className="px-5 py-3 text-sm text-slate-700">{p.customer?.name || "—"}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{new Date(p.payment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-5 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${METHOD_BADGES[p.payment_method] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>{p.payment_method}</span></td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(p.total_amount)}</td>
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
