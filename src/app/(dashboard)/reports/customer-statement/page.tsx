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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));

  const MONTH_OPTIONS = [
    { value: "", label: "All Months" },
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ];
  const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const searchCustomers = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await getCustomers({ search: query, per_page: 20, is_active: 1 });
      if (res.status === "success") setSearchResults(res.data.data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setDropdownOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCustomers(value), 300);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery(`${customer.name} (${customer.code})`);
    setDropdownOpen(false);
    setSearchResults([]);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setSearchQuery("");
    setSearchResults([]);
    setData(null);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
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
        const params: { customer_id: number; date_from?: string; date_to?: string; month?: number; year?: number } = { customer_id: selectedCustomer!.id };
        if (filterMonth && filterYear) {
          params.month = Number(filterMonth);
          params.year = Number(filterYear);
        } else {
          if (dateFrom) params.date_from = dateFrom;
          if (dateTo) params.date_to = dateTo;
        }
        const res = await getCustomerStatement(params);
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load customer statement", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [selectedCustomer, dateFrom, dateTo, filterMonth, filterYear, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Statement</h1>
        <p className="mt-1 text-sm text-slate-500">Full transaction history for a customer.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="relative" ref={dropdownRef}>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Customer *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => { if (searchQuery) setDropdownOpen(true); }}
                placeholder="Search by name, code, or phone..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-8 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button type="button" onClick={handleClearCustomer} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
              {!searchQuery && (
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              )}
            </div>
            {dropdownOpen && (searchResults.length > 0 || searching) && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto scrollbar-thin">
                {searching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                  </div>
                ) : (
                  searchResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCustomer(c)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.code} &middot; {c.phone}</p>
                      </div>
                      {c.outstanding_balance > 0 && (
                        <span className="text-xs font-semibold text-red-600">{formatCurrency(c.outstanding_balance)}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
            {dropdownOpen && !searching && searchQuery && searchResults.length === 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg p-4 text-center">
                <p className="text-sm text-slate-500">No customers found</p>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Month</label>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {MONTH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Year</label>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11" disabled={!!filterMonth} />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11" disabled={!!filterMonth} />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
