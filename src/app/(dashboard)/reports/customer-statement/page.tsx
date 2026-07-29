"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, UserCheck, Search, ChevronDown, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getCustomerStatement, type CustomerStatementData } from "@/lib/api/reports";
import { getCustomerList, type CustomerListItem } from "@/lib/api/customers";
import { useAuthStore } from "@/stores/auth-store";

export default function CustomerStatementPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canListCustomers = hasPermission("Customer List");
  const [data, setData] = useState<CustomerStatementData | null>(null);
  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);
  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);

  const hasFilters = selectedCustomer || dateFrom !== firstOfYear || dateTo !== today;

  useEffect(() => {
    if (!canListCustomers) return;
    async function fetchCustomers() {
      try {
        const res = await getCustomerList();
        if (res.status === "success") setCustomers(res.data);
      } catch { setCustomers([]); }
    }
    fetchCustomers();
  }, [canListCustomers]);

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
           c.code.toLowerCase().includes(customerSearch.toLowerCase()) ||
           c.phone.includes(customerSearch)
  );

  const handleSelectCustomer = (customer: CustomerListItem) => {
    setSelectedCustomer(customer);
    setCustomerDropdownOpen(false);
    setCustomerSearch("");
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setData(null);
  };

  const clearFilters = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setData(null);
    setDateFrom(firstOfYear);
    setDateTo(today);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) setCustomerDropdownOpen(false);
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

  const buildPrintHtml = () => {
    if (!data) return "";
    const badge = (t: string) => t === "sale"
      ? `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:600;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe">Sale</span>`
      : `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:600;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0">Payment</span>`;
    const rows = data.transactions.map((txn, i) => `<tr style="border-bottom:1px solid #f1f5f9;${i % 2 === 0 ? "" : "background:#f8fafc;"}">
      <td style="padding:7px 8px;font-size:10px;color:#475569;white-space:nowrap">${new Date(txn.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
      <td style="padding:7px 8px">${badge(txn.type)}</td>
      <td style="padding:7px 8px;font-size:10px;color:#334155">${txn.description}</td>
      <td style="padding:7px 8px;font-size:10px;color:#475569">${txn.reference}</td>
      <td style="padding:7px 8px;font-size:10px;font-weight:600;color:#334155;text-align:right">${txn.debit > 0 ? formatCurrency(txn.debit) : "\u2014"}</td>
      <td style="padding:7px 8px;font-size:10px;font-weight:600;color:#047857;text-align:right">${txn.credit > 0 ? formatCurrency(txn.credit) : "\u2014"}</td>
      <td style="padding:7px 8px;font-size:10px;font-weight:700;color:#0f172a;text-align:right">${formatCurrency(txn.balance)}</td>
    </tr>`).join("");
    const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const nowFull = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Customer Statement - ${data.customer.name}</title>
<style>
@page{size:A4;margin:10mm}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1e293b;font-size:11px;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact}
table{width:100%;border-collapse:collapse}
th{padding:8px 8px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;text-align:left;border-bottom:2px solid #10b981}
td{padding:7px 8px;font-size:10px}
</style></head><body style="padding:0;margin:0">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:750px;margin:0 auto">
<tr><td style="padding:0 0 12px 0;border-bottom:2px solid #10b981">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="50%" style="vertical-align:middle">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width:38px;height:38px;background:#10b981;border-radius:8px;text-align:center;vertical-align:middle;color:#fff;font-weight:bold;font-size:16px">M</td>
<td style="padding-left:10px;vertical-align:middle"><span style="font-size:15px;font-weight:700;color:#0f172a">Minal Ledger</span><br><span style="font-size:9px;color:#94a3b8">Financial Management System</span></td>
</tr></table>
</td>
<td width="50%" style="text-align:right;vertical-align:middle"><span style="font-size:9px;color:#94a3b8">Generated on</span><br><span style="font-size:10px;font-weight:600;color:#475569">${now}</span></td>
</tr></table>
</td></tr>
<tr><td style="padding:12px 0 0 0">
<div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px">Customer Statement</div>
<div style="font-size:10px;color:#64748b;margin-bottom:12px">Full transaction history</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Period: <b>${dateFrom} to ${dateTo}</b></td>
<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Customer: <b>${data.customer.name} (${data.customer.code})</b></td>
<td style="padding:0;font-size:10px;color:#475569">Phone: <b>${data.customer.phone}</b></td>
</tr></table>
</td></tr>
<tr><td style="padding:16px 0">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="33%" style="padding:0 5px 0 0"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#ecfdf5"><span style="font-size:9px;font-weight:600;color:#047857">Total Sales</span><br><span style="font-size:14px;font-weight:700;color:#047857">${formatCurrency(data.summary.total_sales)}</span></td></tr></table></td>
<td width="33%" style="padding:0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#eff6ff"><span style="font-size:9px;font-weight:600;color:#1d4ed8">Total Payments</span><br><span style="font-size:14px;font-weight:700;color:#1d4ed8">${formatCurrency(data.summary.total_payments)}</span></td></tr></table></td>
<td width="33%" style="padding:0 0 0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#f8fafc"><span style="font-size:9px;font-weight:600;color:#64748b">Net Balance</span><br><span style="font-size:14px;font-weight:700;color:#0f172a">${formatCurrency(data.summary.net_balance)}</span></td></tr></table></td>
</tr></table>
</td></tr>
<tr><td style="padding:0 0 20px 0">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<thead><tr>
<th style="text-align:left">Date</th><th style="text-align:left">Type</th><th style="text-align:left">Description</th><th style="text-align:left">Reference</th><th style="text-align:right">Debit</th><th style="text-align:right">Credit</th><th style="text-align:right">Balance</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
</td></tr>
<tr><td style="padding:10px 0 0 0;border-top:1px solid #e2e8f0">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="50%" style="font-size:9px;color:#94a3b8"><b style="color:#64748b">Minal Ledger</b><br>Financial Management System</td>
<td width="50%" style="text-align:right;font-size:9px;color:#94a3b8">Generated by: System<br>${nowFull}</td>
</tr></table>
</td></tr>
</table>
</body></html>`;
  };

  const handlePrint = () => {
    setPrintConfirmOpen(false);
    if (!data) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:0;height:0;border:none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open();
    doc.write(buildPrintHtml());
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 500);
    }, 400);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Customer Statement</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">Full transaction history for a customer.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 min-w-0" ref={customerDropdownRef}>
            <button type="button" onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)} className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm transition-all hover:border-slate-300 focus:border-emerald-500">
              <span className={`truncate ${selectedCustomer ? "text-slate-700 font-medium" : "text-slate-400"}`}>{selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.code})` : "Select a customer"}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${customerDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {customerDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="p-1.5"><input autoFocus value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search by name, code, or phone..." className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs outline-none focus:border-emerald-500" /></div>
                <div className="max-h-56 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                  {filteredCustomers.length === 0 ? (<div className="px-3 py-4 text-center"><p className="text-xs text-slate-500">No customers found</p></div>)
                  : (<>{selectedCustomer && <button type="button" onClick={handleClearCustomer} className="flex w-full items-center px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">Clear selection</button>}
                    {filteredCustomers.map((c) => (<button key={c.id} type="button" onClick={() => handleSelectCustomer(c)} className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 ${selectedCustomer?.id === c.id ? "bg-emerald-50" : ""}`}>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 shrink-0">{c.name.charAt(0).toUpperCase()}</div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-700 truncate">{c.name}</p><p className="text-[10px] text-slate-400">{c.code} &middot; {c.phone}</p></div>
                      {c.outstanding_balance > 0 && <span className="text-[10px] font-semibold text-red-600 shrink-0">{formatCurrency(c.outstanding_balance)}</span>}
                    </button>))}</>)}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11 w-full sm:w-auto sm:flex-none" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11 w-full sm:w-auto sm:flex-none" />
            {hasFilters && <button onClick={clearFilters} className="h-11 px-4 rounded-lg bg-red-50 text-xs font-medium text-red-500 hover:bg-red-100 transition-colors whitespace-nowrap">Clear</button>}
            {data && <button onClick={() => setPrintConfirmOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 whitespace-nowrap"><Printer className="h-4 w-4" />Print</button>}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div><h3 className="text-base font-bold text-slate-900">{data.customer.name}</h3><p className="text-sm text-slate-500">{data.customer.code} &middot; {data.customer.phone}</p></div>
              <div className="sm:text-right"><p className="text-xs text-slate-500">Outstanding Balance</p><p className="text-lg font-bold text-red-600">{formatCurrency(data.customer.outstanding_balance)}</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-600">Total Sales</p><p className="text-lg font-bold text-emerald-700">{formatCurrency(data.summary.total_sales)}</p></div>
              <div className="rounded-xl bg-blue-50 p-4"><p className="text-xs text-blue-600">Total Payments</p><p className="text-lg font-bold text-blue-700">{formatCurrency(data.summary.total_payments)}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Net Balance</p><p className="text-lg font-bold text-slate-900">{formatCurrency(data.summary.net_balance)}</p></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-700">Transactions</h3></div>
            <div className="hidden md:block overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[640px]">
                <thead><tr className="border-b border-slate-100 bg-slate-50/80">
                  {["Date","Type","Description","Ref","Debit","Credit","Balance"].map((h) => <th key={h} className={`px-4 sm:px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${["Debit","Credit","Balance"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {data.transactions.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-16 text-center"><UserCheck className="mx-auto h-10 w-10 text-slate-300 mb-3" /><p className="text-sm font-semibold text-slate-600">No transactions found</p></td></tr>
                  ) : data.transactions.map((txn, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 sm:px-5 py-3 text-sm text-slate-600 whitespace-nowrap">{new Date(txn.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="px-4 sm:px-5 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${txn.type === "sale" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>{txn.type === "sale" ? "Sale" : "Payment"}</span></td>
                      <td className="px-4 sm:px-5 py-3 text-sm text-slate-700 max-w-[200px] truncate">{txn.description}</td>
                      <td className="px-4 sm:px-5 py-3 text-sm font-mono text-slate-600">{txn.reference}</td>
                      <td className="px-4 sm:px-5 py-3 text-right text-sm font-semibold text-slate-700">{txn.debit > 0 ? formatCurrency(txn.debit) : "\u2014"}</td>
                      <td className="px-4 sm:px-5 py-3 text-right text-sm font-semibold text-emerald-600">{txn.credit > 0 ? formatCurrency(txn.credit) : "\u2014"}</td>
                      <td className="px-4 sm:px-5 py-3 text-right text-sm font-bold text-slate-900">{formatCurrency(txn.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-50">
              {data.transactions.length === 0 ? (
                <div className="px-4 py-16 text-center"><UserCheck className="mx-auto h-10 w-10 text-slate-300 mb-3" /><p className="text-sm font-semibold text-slate-600">No transactions found</p></div>
              ) : data.transactions.map((txn, i) => (
                <div key={i} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${txn.type === "sale" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>{txn.type === "sale" ? "Sale" : "Payment"}</span>
                    <span className="text-xs text-slate-400">{new Date(txn.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className="text-sm text-slate-700 truncate">{txn.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-slate-500 text-xs">{txn.reference}</span>
                    <div className="flex gap-3">
                      {txn.debit > 0 && <span className="font-semibold text-slate-700">Dr {formatCurrency(txn.debit)}</span>}
                      {txn.credit > 0 && <span className="font-semibold text-emerald-600">Cr {formatCurrency(txn.credit)}</span>}
                    </div>
                  </div>
                  <p className="text-right text-sm font-bold text-slate-900">Bal: {formatCurrency(txn.balance)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 sm:p-16 text-center">
          <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600">Select a customer to view their statement</p>
        </div>
      )}

      {printConfirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPrintConfirmOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-4 sm:p-6 shadow-2xl">
            <div className="mb-3 sm:mb-5 text-center">
              <div className="mx-auto mb-2 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-emerald-100">
                <Printer className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Print Statement</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">Do you want to print this report?</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button onClick={() => setPrintConfirmOpen(false)} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50">No</button>
              <button onClick={handlePrint} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
