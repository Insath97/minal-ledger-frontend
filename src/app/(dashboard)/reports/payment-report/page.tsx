"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ArrowDownRight, ChevronDown, Printer, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getPaymentReport, type PaymentReportData } from "@/lib/api/reports";
import { getCustomerList, type CustomerListItem } from "@/lib/api/customers";
import { useAuthStore } from "@/stores/auth-store";
import * as XLSX from "xlsx";

const METHOD_OPTIONS = [
  { value: "", label: "All Methods" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
];

const METHOD_BADGES: Record<string, string> = {
  cash: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  bank_transfer: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  cheque: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  card: "bg-purple-50 text-purple-700 border border-purple-200",
};

export default function PaymentReportPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canListCustomers = hasPermission("Customer List");
  const [data, setData] = useState<PaymentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customerDropdownRef = useRef<HTMLDivElement>(null);

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
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) setCustomerDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasFilters = dateFrom !== firstOfYear || dateTo !== today || paymentMethod || selectedCustomer;

  const clearFilters = () => {
    setDateFrom(firstOfYear);
    setDateTo(today);
    setPaymentMethod("");
    setSelectedCustomer(null);
    setCustomerSearch("");
  };

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (paymentMethod) params.payment_method = paymentMethod;
        if (selectedCustomer) params.customer_id = selectedCustomer.id;
        const res = await getPaymentReport(params);
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load payment report", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [dateFrom, dateTo, paymentMethod, selectedCustomer, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);

  const buildPrintHtml = () => {
    if (!data) return "";
    const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const nowFull = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const rows = data.payments.map((p, i) => `<tr style="border-bottom:1px solid #f1f5f9;${i % 2 === 0 ? "" : "background:#f8fafc;"}">
      <td style="padding:7px 8px;font-size:10px;color:#475569;font-family:monospace">PAY-${p.id}</td>
      <td style="padding:7px 8px;font-size:10px;color:#334155">${p.customer?.name || "\u2014"}</td>
      <td style="padding:7px 8px;font-size:10px;color:#475569;white-space:nowrap">${new Date(p.payment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
      <td style="padding:7px 8px;font-size:10px;text-transform:capitalize;color:#334155">${p.payment_method}</td>
      <td style="padding:7px 8px;font-size:10px;font-weight:700;color:#047857;text-align:right">${formatCurrency(p.total_amount)}</td>
    </tr>`).join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Report</title>
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
<div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px">Payment Report</div>
<div style="font-size:10px;color:#64748b;margin-bottom:12px">Payments received by method, customer, and date range</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Period: <b>${dateFrom} to ${dateTo}</b></td>
${selectedCustomer ? `<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Customer: <b>${selectedCustomer.name}</b></td>` : ""}
${paymentMethod ? `<td style="padding:0;font-size:10px;color:#475569">Method: <b>${paymentMethod}</b></td>` : ""}
</tr></table>
</td></tr>
<tr><td style="padding:16px 0">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="33%" style="padding:0 5px 0 0"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#f8fafc"><span style="font-size:9px;font-weight:600;color:#64748b">Total Payments</span><br><span style="font-size:14px;font-weight:700;color:#0f172a">${data.summary.count}</span><br><span style="font-size:9px;color:#94a3b8">${formatCurrency(data.summary.total_amount)}</span></td></tr></table></td>
<td width="33%" style="padding:0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#ecfdf5"><span style="font-size:9px;font-weight:600;color:#047857">Customers</span><br><span style="font-size:14px;font-weight:700;color:#047857">${data.by_customer.length}</span></td></tr></table></td>
<td width="33%" style="padding:0 0 0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#f8fafc"><span style="font-size:9px;font-weight:600;color:#64748b">Total Amount</span><br><span style="font-size:14px;font-weight:700;color:#0f172a">${formatCurrency(data.summary.total_amount)}</span></td></tr></table></td>
</tr></table>
</td></tr>
<tr><td style="padding:0 0 20px 0">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<thead><tr>
<th style="text-align:left">ID</th><th style="text-align:left">Customer</th><th style="text-align:left">Date</th><th style="text-align:left">Method</th><th style="text-align:right">Amount</th>
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

  const handleDownloadExcel = () => {
    if (!data || data.payments.length === 0) { toast("No data to export", "error"); return; }
    const wsData: (string | number)[][] = [["ID", "Customer", "Date", "Method", "Amount"]];
    data.payments.forEach((p) => {
      wsData.push([`PAY-${p.id}`, p.customer?.name || "", new Date(p.payment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), p.payment_method, p.total_amount]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, "Payment Report");
    XLSX.writeFile(wb, `payment-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">Payments received by method, customer, and date range.</p>
        </div>
        {data && (
          <div className="flex flex-wrap items-center gap-2">
            {hasFilters && <button onClick={clearFilters} className="h-10 px-4 rounded-lg bg-red-500/10 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors whitespace-nowrap">Clear Filters</button>}
            <button onClick={handleDownloadExcel} className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground transition-all hover:bg-accent whitespace-nowrap"><Download className="h-3.5 w-3.5" />Excel</button>
            <button onClick={() => setPrintConfirmOpen(true)} className="flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 whitespace-nowrap"><Printer className="h-3.5 w-3.5" />Print</button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11" />
          </div>
          <div className="relative" ref={customerDropdownRef}>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Customer</label>
            <button type="button" onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)} className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm transition-all hover:border-border focus:border-emerald-500">
              <span className={`truncate ${selectedCustomer ? "text-foreground font-medium" : "text-muted-foreground"}`}>{selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.code})` : "All Customers"}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${customerDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {customerDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                <div className="p-1.5"><input autoFocus value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search by name, code, or phone..." className="h-8 w-full rounded-md border border-border bg-muted px-2.5 text-xs outline-none focus:border-emerald-500" /></div>
                <div className="max-h-56 overflow-y-auto border-t border-border scrollbar-thin">
                  {filteredCustomers.length === 0 ? (<div className="px-3 py-4 text-center"><p className="text-xs text-muted-foreground">No customers found</p></div>)
                  : (<>{selectedCustomer && <button type="button" onClick={handleClearCustomer} className="flex w-full items-center px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10">Clear selection</button>}
                    {filteredCustomers.map((c) => (<button key={c.id} type="button" onClick={() => handleSelectCustomer(c)} className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent ${selectedCustomer?.id === c.id ? "bg-emerald-500/10" : ""}`}>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 shrink-0">{c.name.charAt(0).toUpperCase()}</div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground truncate">{c.name}</p><p className="text-[10px] text-muted-foreground">{c.code} &middot; {c.phone}</p></div>
                    </button>))}</>)}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          {selectedCustomer && data.by_customer.length > 0 && (
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">By Customer</h3>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payments</th>
                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.by_customer.map((c, i) => (
                      <tr key={i} className="hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-foreground">{c.customer_name}</td>
                        <td className="px-5 py-3 text-right text-sm text-foreground">{c.count}</td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(c.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Payment Details</h3>
            </div>
            <div className="hidden md:block overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Method</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.payments.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-16 text-center"><ArrowDownRight className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" /><p className="text-sm font-semibold text-foreground">No payments found</p></td></tr>
                  ) : (
                    data.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-mono text-foreground">PAY-{p.id}</td>
                        <td className="px-5 py-3 text-sm text-foreground">{p.customer?.name || "—"}</td>
                        <td className="px-5 py-3 text-sm text-foreground">{new Date(p.payment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-5 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${METHOD_BADGES[p.payment_method] || "bg-muted text-foreground border border-border"}`}>{p.payment_method}</span></td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(p.total_amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-border">
              {data.payments.length === 0 ? (
                <div className="px-4 py-16 text-center"><ArrowDownRight className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" /><p className="text-sm font-semibold text-foreground">No payments found</p></div>
              ) : (
                data.payments.map((p) => (
                  <div key={p.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono text-foreground">PAY-{p.id}</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${METHOD_BADGES[p.payment_method] || "bg-muted text-foreground border border-border"}`}>{p.payment_method}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground">{p.customer?.name || "—"}</p>
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(p.total_amount)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(p.payment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}

      {printConfirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPrintConfirmOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-4 sm:p-6 shadow-2xl">
            <div className="mb-3 sm:mb-5 text-center">
              <div className="mx-auto mb-2 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Printer className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">Print Payment Report</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Do you want to print this report?</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button onClick={() => setPrintConfirmOpen(false)} className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent">No</button>
              <button onClick={handlePrint} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
