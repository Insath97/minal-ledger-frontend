"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, UserCheck, Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getCustomerStatement, type CustomerStatementData } from "@/lib/api/reports";
import { getCustomers, type Customer } from "@/lib/api/customers";

export default function CustomerStatementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<CustomerStatementData | null>(null);
  const [loading, setLoading] = useState(false);

  // Customer searchable select
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const customerDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);

  const fetchCustomers = useCallback(async (query: string) => {
    setSearchingCustomers(true);
    try {
      const params: Record<string, string | number> = { per_page: 20, is_active: 1 };
      if (query) params.search = query;
      const res = await getCustomers(params);
      if (res.status === "success") setCustomers(res.data.data);
    } catch {
      setCustomers([]);
    } finally {
      setSearchingCustomers(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers("");
  }, [fetchCustomers]);

  const handleCustomerSearch = (value: string) => {
    setCustomerSearch(value);
    if (customerDebounceRef.current) clearTimeout(customerDebounceRef.current);
    customerDebounceRef.current = setTimeout(() => fetchCustomers(value), 300);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerDropdownOpen(false);
    setCustomerSearch("");
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomers([]);
    setData(null);
    fetchCustomers("");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedCustomer) return;
    async function fetch() {
      setLoading(true);
      try {
        const params: { customer_id: number; date_from?: string; date_to?: string } = { customer_id: selectedCustomer!.id };
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const res = await getCustomerStatement(params);
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load customer statement", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [selectedCustomer, dateFrom, dateTo, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Statement</h1>
        <p className="mt-1 text-sm text-slate-500">Full transaction history for a customer.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Customer Searchable Select */}
          <div className="relative" ref={customerDropdownRef}>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Customer *</label>
            <button
              type="button"
              onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm transition-all hover:border-slate-300 focus:border-emerald-500"
            >
              <span className={selectedCustomer ? "text-slate-700 font-medium" : "text-slate-400"}>
                {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.code})` : "Select a customer"}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${customerDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {customerDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="p-1.5">
                  <input
                    autoFocus
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    placeholder="Search by name, code, or phone..."
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                  {searchingCustomers ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="px-3 py-4 text-center">
                      <p className="text-xs text-slate-500">No customers found</p>
                    </div>
                  ) : (
                    <>
                      {selectedCustomer && (
                        <button
                          type="button"
                          onClick={handleClearCustomer}
                          className="flex w-full items-center px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                        >
                          Clear selection
                        </button>
                      )}
                      {customers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 ${selectedCustomer?.id === c.id ? "bg-emerald-50" : ""}`}
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.code} &middot; {c.phone}</p>
                          </div>
                          {c.outstanding_balance > 0 && (
                            <span className="text-[10px] font-semibold text-red-600 shrink-0">{formatCurrency(c.outstanding_balance)}</span>
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
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
