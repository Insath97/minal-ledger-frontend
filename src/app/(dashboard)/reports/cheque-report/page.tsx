"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getChequeReport, type ChequeReportData } from "@/lib/api/reports";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "cleared", label: "Cleared" },
  { value: "bounced", label: "Bounced" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  cleared: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  bounced: "bg-red-50 text-red-700 border border-red-200",
  cancelled: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function ChequeReportPage() {
  const { toast } = useToast();
  const [data, setData] = useState<ChequeReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [bankName, setBankName] = useState("");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (status) params.status = status;
        if (bankName) params.bank_name = bankName;
        const res = await getChequeReport(params);
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load cheque report", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [dateFrom, dateTo, status, bankName, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cheque Report</h1>
        <p className="mt-1 text-sm text-slate-500">Cheque summary by status, bank, and date range.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Bank Name</label>
            <Input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Filter by bank..." className="h-11" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">Total Cheques</p>
              <p className="text-lg font-bold text-slate-900">{data.summary.total_count}</p>
              <p className="text-xs text-slate-400">{formatCurrency(data.summary.total_amount)}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <p className="text-xs text-amber-600">Pending</p>
              <p className="text-lg font-bold text-amber-700">{data.summary.pending_count}</p>
              <p className="text-xs text-amber-500">{formatCurrency(data.summary.pending_amount)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <p className="text-xs text-emerald-600">Cleared</p>
              <p className="text-lg font-bold text-emerald-700">{data.summary.cleared_count}</p>
              <p className="text-xs text-emerald-500">{formatCurrency(data.summary.cleared_amount)}</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
              <p className="text-xs text-red-600">Bounced</p>
              <p className="text-lg font-bold text-red-700">{data.summary.bounced_count}</p>
              <p className="text-xs text-red-500">{formatCurrency(data.summary.bounced_amount)}</p>
            </div>
          </div>

          {data.by_bank.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">By Bank</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.by_bank.map((b) => (
                  <div key={b.bank_name} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">{b.bank_name}</p>
                    <p className="text-xs text-slate-500">{b.count} cheques &middot; {formatCurrency(b.total_amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Cheque Details</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Cheque #</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Bank</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.cheques.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-16 text-center"><CreditCard className="mx-auto h-10 w-10 text-slate-300 mb-3" /><p className="text-sm font-semibold text-slate-600">No cheques found</p></td></tr>
                  ) : (
                    data.cheques.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-mono font-semibold text-slate-700">{c.cheque_number}</td>
                        <td className="px-5 py-3 text-sm text-slate-700">{c.customer?.name || "—"}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{c.bank_name}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{new Date(c.cheque_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-slate-900">{formatCurrency(c.amount)}</td>
                        <td className="px-5 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGES[c.status] || ""}`}>{c.status}</span></td>
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
