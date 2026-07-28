"use client";

import { useState, useEffect } from "react";
import { Loader2, UserCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getCustomerStatement, type CustomerStatementData } from "@/lib/api/reports";
import { getCustomers, type Customer } from "@/lib/api/customers";

export default function CustomerStatementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<CustomerStatementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);

  useEffect(() => {
    getCustomers({ per_page: 1000 }).then((res) => {
      if (res.status === "success") setCustomers(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!customerId) return;
    async function fetch() {
      setLoading(true);
      try {
        const res = await getCustomerStatement({ customer_id: Number(customerId), date_from: dateFrom || undefined, date_to: dateTo || undefined });
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load customer statement", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [customerId, dateFrom, dateTo, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Statement</h1>
        <p className="mt-1 text-sm text-slate-500">Full transaction history for a customer.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Customer *</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="">Select a customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{data.customer.name}</h3>
                <p className="text-sm text-slate-500">{data.customer.code} &middot; {data.customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Outstanding Balance</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(data.customer.outstanding_balance)}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600">Total Sales</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(data.summary.total_sales)}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs text-blue-600">Total Payments</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(data.summary.total_payments)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Net Balance</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(data.summary.net_balance)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Transactions</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Reference</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Debit</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Credit</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.transactions.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-16 text-center"><UserCheck className="mx-auto h-10 w-10 text-slate-300 mb-3" /><p className="text-sm font-semibold text-slate-600">No transactions found</p></td></tr>
                  ) : (
                    data.transactions.map((txn, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm text-slate-600">{new Date(txn.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${txn.type === "sale" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>{txn.type}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-700">{txn.description}</td>
                        <td className="px-5 py-3 text-sm font-mono text-slate-600">{txn.reference}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-slate-700">{txn.debit > 0 ? formatCurrency(txn.debit) : "—"}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-emerald-600">{txn.credit > 0 ? formatCurrency(txn.credit) : "—"}</td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-slate-900">{formatCurrency(txn.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600">Select a customer to view their statement</p>
        </div>
      )}
    </div>
  );
}
