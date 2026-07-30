"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart, ChevronDown, Printer, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSalesReport, type SalesReportData } from "@/lib/api/reports";
import { getCustomerList, type CustomerListItem } from "@/lib/api/customers";
import { useAuthStore } from "@/stores/auth-store";
import * as XLSX from "xlsx";

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "unpaid", label: "Unpaid" },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "retail", label: "Retail" },
  { value: "wholesale", label: "Wholesale" },
];

export default function SalesReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canListCustomers = hasPermission("Customer List");
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);
  const [businessType, setBusinessType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

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

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (selectedCustomer) params.customer_id = selectedCustomer.id;
        if (businessType) params.business_type = businessType;
        if (paymentStatus) params.payment_status = paymentStatus;
        const res = await getSalesReport(params);
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load sales report", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [dateFrom, dateTo, selectedCustomer, businessType, paymentStatus, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  const hasFilters = selectedCustomer || dateFrom !== firstOfYear || dateTo !== today || businessType || paymentStatus;

  const clearFilters = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setDateFrom(firstOfYear);
    setDateTo(today);
    setBusinessType("");
    setPaymentStatus("");
  };

  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);

  const buildPrintHtml = () => {
    if (!data) return "";
    const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const nowFull = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const rows = data.sales.map((s, i) => `<tr style="border-bottom:1px solid #f1f5f9;${i % 2 === 0 ? "" : "background:#f8fafc;"}">
      <td style="padding:7px 8px;font-size:10px;color:#475569">${s.reference_number}</td>
      <td style="padding:7px 8px;font-size:10px;color:#334155">${s.customer?.name || "\u2014"}</td>
      <td style="padding:7px 8px;font-size:10px;color:#475569;white-space:nowrap">${new Date(s.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
      <td style="padding:7px 8px;font-size:10px;color:#475569;text-transform:capitalize">${s.business_type}</td>
      <td style="padding:7px 8px;font-size:10px;font-weight:600;color:#334155;text-align:right">${formatCurrency(s.total_amount)}</td>
      <td style="padding:7px 8px;font-size:10px;font-weight:600;color:#047857;text-align:right">${formatCurrency(s.paid_amount)}</td>
      <td style="padding:7px 8px;font-size:10px;font-weight:600;color:#dc2626;text-align:right">${formatCurrency(s.due_amount)}</td>
      <td style="padding:7px 8px;font-size:10px;text-transform:capitalize;color:${s.payment_status === "paid" ? "#047857" : s.payment_status === "partial" ? "#d97706" : "#dc2626"};font-weight:600">${s.payment_status}</td>
    </tr>`).join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sales Report</title>
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
<div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px">Sales Report</div>
<div style="font-size:10px;color:#64748b;margin-bottom:12px">Detailed sales breakdown by date, customer, and status</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Period: <b>${dateFrom} to ${dateTo}</b></td>
${selectedCustomer ? `<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Customer: <b>${selectedCustomer.name}</b></td>` : ""}
${businessType ? `<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Type: <b>${businessType}</b></td>` : ""}
${paymentStatus ? `<td style="padding:0;font-size:10px;color:#475569">Status: <b>${paymentStatus}</b></td>` : ""}
</tr></table>
</td></tr>
<tr><td style="padding:16px 0">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="25%" style="padding:0 5px 0 0"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#f8fafc"><span style="font-size:9px;font-weight:600;color:#64748b">Total Sales</span><br><span style="font-size:14px;font-weight:700;color:#0f172a">${formatCurrency(data.summary.total_sales)}</span><br><span style="font-size:9px;color:#94a3b8">${data.summary.count} sales</span></td></tr></table></td>
<td width="25%" style="padding:0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#ecfdf5"><span style="font-size:9px;font-weight:600;color:#047857">Total Paid</span><br><span style="font-size:14px;font-weight:700;color:#047857">${formatCurrency(data.summary.total_paid)}</span><br><span style="font-size:9px;color:#059669">${data.summary.paid_count} sales</span></td></tr></table></td>
<td width="25%" style="padding:0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#fef3c7"><span style="font-size:9px;font-weight:600;color:#d97706">Partial</span><br><span style="font-size:14px;font-weight:700;color:#d97706">${data.summary.count - data.summary.paid_count - data.summary.unpaid_count}</span><br><span style="font-size:9px;color:#b45309">sales</span></td></tr></table></td>
<td width="25%" style="padding:0 0 0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#fef2f2"><span style="font-size:9px;font-weight:600;color:#dc2626">Total Due</span><br><span style="font-size:14px;font-weight:700;color:#dc2626">${formatCurrency(data.summary.total_due)}</span><br><span style="font-size:9px;color:#b91c1c">${data.summary.unpaid_count} unpaid</span></td></tr></table></td>
</tr></table>
</td></tr>
<tr><td style="padding:0 0 20px 0">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<thead><tr>
<th style="text-align:left">Reference</th><th style="text-align:left">Customer</th><th style="text-align:left">Date</th><th style="text-align:left">Type</th><th style="text-align:right">Total</th><th style="text-align:right">Paid</th><th style="text-align:right">Due</th><th style="text-align:left">Status</th>
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
    if (!data || data.sales.length === 0) { toast("No data to export", "error"); return; }
    const wsData: (string | number)[][] = [["Reference", "Customer", "Date", "Type", "Total", "Paid", "Due", "Status"]];
    data.sales.forEach((s) => {
      wsData.push([s.reference_number, s.customer?.name || "", new Date(s.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), s.business_type, s.total_amount, s.paid_amount, s.due_amount, s.payment_status]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `sales-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const STATUS_BADGES: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    partial: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    unpaid: "bg-red-500/10 text-red-600 border border-red-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">Detailed sales breakdown by date, customer, and status.</p>
        </div>
        {data && (
          <div className="flex flex-wrap items-center gap-2">
            {hasFilters && <button onClick={clearFilters} className="h-10 px-4 rounded-lg bg-red-500/10 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors whitespace-nowrap">Clear Filters</button>}
            <button onClick={handleDownloadExcel} className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-xs font-semibold text-foreground transition-all hover:bg-accent whitespace-nowrap"><Download className="h-3.5 w-3.5" />Excel</button>
            <button onClick={() => setPrintConfirmOpen(true)} className="flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 whitespace-nowrap"><Printer className="h-3.5 w-3.5" />Print</button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11" />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11" />
          </div>
          <div className="relative lg:col-span-4" ref={customerDropdownRef}>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Customer</label>
            <button type="button" onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)} className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-all hover:border-border focus:border-emerald-500">
              <span className={`truncate ${selectedCustomer ? "text-foreground font-medium" : "text-muted-foreground"}`}>{selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.code})` : "All Customers"}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${customerDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {customerDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-xl">
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
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Business Type</label>
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {BUSINESS_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Payment Status</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background p-3 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Total Sales</p>
              <p className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(data.summary.total_sales)}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">{data.summary.count} sales</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs text-emerald-600">Total Paid</p>
              <p className="text-base sm:text-lg font-bold text-emerald-600">{formatCurrency(data.summary.total_paid)}</p>
              <p className="text-[11px] sm:text-xs text-emerald-500">{data.summary.paid_count} sales</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs text-amber-600">Partial</p>
              <p className="text-base sm:text-lg font-bold text-amber-600">{data.summary.count - data.summary.paid_count - data.summary.unpaid_count}</p>
              <p className="text-[11px] sm:text-xs text-amber-500">sales</p>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs text-red-600">Total Due</p>
              <p className="text-base sm:text-lg font-bold text-red-600">{formatCurrency(data.summary.total_due)}</p>
              <p className="text-[11px] sm:text-xs text-red-500">{data.summary.unpaid_count} unpaid</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Sales Details</h3>
            </div>
            <div className="hidden md:block overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Reference</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paid</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Due</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.sales.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-16 text-center"><ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" /><p className="text-sm font-semibold text-foreground">No sales found</p></td></tr>
                  ) : (
                    data.sales.map((s) => (
                      <tr key={s.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-3">
                          <button onClick={() => router.push(`/sales/${s.id}`)} className="text-sm font-mono font-semibold text-emerald-600 hover:text-emerald-600 hover:underline">{s.reference_number}</button>
                        </td>
                        <td className="px-5 py-3 text-sm text-foreground">{s.customer?.name || "—"}</td>
                        <td className="px-5 py-3 text-sm text-foreground">{new Date(s.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-5 py-3 text-sm text-foreground capitalize">{s.business_type}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-foreground">{formatCurrency(s.total_amount)}</td>
                        <td className="px-5 py-3 text-right text-sm text-emerald-600">{formatCurrency(s.paid_amount)}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-red-600">{formatCurrency(s.due_amount)}</td>
                        <td className="px-5 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGES[s.payment_status] || ""}`}>{s.payment_status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-border">
              {data.sales.length === 0 ? (
                <div className="px-4 py-16 text-center"><ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" /><p className="text-sm font-semibold text-foreground">No sales found</p></div>
              ) : (
                data.sales.map((s) => (
                  <div key={s.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <button onClick={() => router.push(`/sales/${s.id}`)} className="text-sm font-mono font-semibold text-emerald-600 hover:text-emerald-600 hover:underline">{s.reference_number}</button>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGES[s.payment_status] || ""}`}>{s.payment_status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.customer?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground capitalize">{s.business_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(s.total_amount)}</p>
                        <p className="text-xs text-red-600">Due: {formatCurrency(s.due_amount)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(s.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
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
              <h3 className="text-sm sm:text-base font-bold text-foreground">Print Sales Report</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Do you want to print this report?</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button onClick={() => setPrintConfirmOpen(false)} className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent">No</button>
              <button onClick={handlePrint} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
