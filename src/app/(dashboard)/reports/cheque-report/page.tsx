"use client";

import * as XLSX from 'xlsx';
import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, CreditCard, ChevronDown, Printer, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { getChequeList, type Cheque } from "@/lib/api/cheques";
import { getChequeReport, type ChequeReportData } from "@/lib/api/reports";
import { BankSelect } from "@/components/shared/bank-select";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "cleared", label: "Cleared" },
  { value: "bounced", label: "Bounced" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  cleared: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  bounced: "bg-red-500/10 text-red-600 border border-red-500/20",
  cancelled: "bg-muted text-foreground border border-border",
};

export default function ChequeReportPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canListCheques = hasPermission("Cheque List");

  const [data, setData] = useState<ChequeReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [dateFrom, setDateFrom] = useState(firstOfYear);
  const [dateTo, setDateTo] = useState(today);
  const [status, setStatus] = useState("");
  const [bankName, setBankName] = useState("");

  const [chequeList, setChequeList] = useState<Cheque[]>([]);
  const [selectedCheque, setSelectedCheque] = useState<Cheque | null>(null);
  const [chequeDropdownOpen, setChequeDropdownOpen] = useState(false);
  const [chequeSearch, setChequeSearch] = useState("");
  const chequeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canListCheques) return;
    async function fetchChequeList() {
      try {
        const res = await getChequeList();
        if (res.status === "success") setChequeList(res.data);
      } catch { setChequeList([]); }
    }
    fetchChequeList();
  }, [canListCheques]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (chequeDropdownRef.current && !chequeDropdownRef.current.contains(e.target as Node)) setChequeDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredChequeList = chequeList.filter(
    (c) => c.cheque_number.toLowerCase().includes(chequeSearch.toLowerCase()) ||
           c.bank_name.toLowerCase().includes(chequeSearch.toLowerCase())
  );

  const handleSelectCheque = (cheque: Cheque) => {
    setSelectedCheque(cheque);
    setChequeDropdownOpen(false);
    setChequeSearch("");
  };

  const handleClearCheque = () => {
    setSelectedCheque(null);
    setChequeSearch("");
  };

  const hasFilters = selectedCheque || dateFrom !== firstOfYear || dateTo !== today || status || bankName;

  const clearFilters = () => {
    setSelectedCheque(null);
    setChequeSearch("");
    setDateFrom(firstOfYear);
    setDateTo(today);
    setStatus("");
    setBankName("");
  };

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (status) params.status = status;
        if (bankName) params.bank_name = bankName;
        if (selectedCheque) params.search = selectedCheque.cheque_number;
        const res = await getChequeReport(params);
        if (res.status === "success") setData(res.data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast(error.response?.data?.message || "Failed to load cheque report", "error");
      } finally { setLoading(false); }
    }
    fetch();
  }, [dateFrom, dateTo, status, bankName, selectedCheque, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);

  const buildPrintHtml = () => {
    if (!data) return "";
    const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const nowFull = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const rows = data.cheques.map((c, i) => `<tr style="border-bottom:1px solid #f1f5f9;${i % 2 === 0 ? "" : "background:#f8fafc;"}">
      <td style="padding:7px 8px;font-size:10px;color:#334155;font-family:monospace">${c.cheque_number}</td>
      <td style="padding:7px 8px;font-size:10px;color:#334155">${c.customer?.name || "\u2014"}</td>
      <td style="padding:7px 8px;font-size:10px;color:#475569">${c.bank_name}</td>
      <td style="padding:7px 8px;font-size:10px;color:#475569;white-space:nowrap">${new Date(c.cheque_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
      <td style="padding:7px 8px;font-size:10px;font-weight:700;color:#0f172a;text-align:right">${formatCurrency(c.amount)}</td>
      <td style="padding:7px 8px;font-size:10px;text-transform:capitalize;color:${c.status === "cleared" ? "#047857" : c.status === "pending" ? "#d97706" : "#dc2626"};font-weight:600">${c.status}</td>
    </tr>`).join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cheque Report</title>
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
<div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px">Cheque Report</div>
<div style="font-size:10px;color:#64748b;margin-bottom:12px">Cheque summary by status, bank, and date range</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Period: <b>${dateFrom} to ${dateTo}</b></td>
${status ? `<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Status: <b>${status}</b></td>` : ""}
${bankName ? `<td style="padding:0 20px 0 0;font-size:10px;color:#475569">Bank: <b>${bankName}</b></td>` : ""}
${chequeSearch ? `<td style="padding:0;font-size:10px;color:#475569">Cheque: <b>${chequeSearch}</b></td>` : ""}
</tr></table>
</td></tr>
<tr><td style="padding:16px 0">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="25%" style="padding:0 5px 0 0"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#f8fafc"><span style="font-size:9px;font-weight:600;color:#64748b">Total Cheques</span><br><span style="font-size:14px;font-weight:700;color:#0f172a">${data.summary.total_count}</span><br><span style="font-size:9px;color:#94a3b8">${formatCurrency(data.summary.total_amount)}</span></td></tr></table></td>
<td width="25%" style="padding:0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#fef3c7"><span style="font-size:9px;font-weight:600;color:#d97706">Pending</span><br><span style="font-size:14px;font-weight:700;color:#d97706">${data.summary.pending_count}</span><br><span style="font-size:9px;color:#b45309">${formatCurrency(data.summary.pending_amount)}</span></td></tr></table></td>
<td width="25%" style="padding:0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#ecfdf5"><span style="font-size:9px;font-weight:600;color:#047857">Cleared</span><br><span style="font-size:14px;font-weight:700;color:#047857">${data.summary.cleared_count}</span><br><span style="font-size:9px;color:#059669">${formatCurrency(data.summary.cleared_amount)}</span></td></tr></table></td>
<td width="25%" style="padding:0 0 0 5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:10px 12px;border-radius:6px;background-color:#fef2f2"><span style="font-size:9px;font-weight:600;color:#dc2626">Bounced</span><br><span style="font-size:14px;font-weight:700;color:#dc2626">${data.summary.bounced_count}</span><br><span style="font-size:9px;color:#b91c1c">${formatCurrency(data.summary.bounced_amount)}</span></td></tr></table></td>
</tr></table>
</td></tr>
<tr><td style="padding:0 0 20px 0">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<thead><tr>
<th style="text-align:left">Cheque #</th><th style="text-align:left">Customer</th><th style="text-align:left">Bank</th><th style="text-align:left">Date</th><th style="text-align:right">Amount</th><th style="text-align:left">Status</th>
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
    if (!data || data.cheques.length === 0) { toast("No data to export", "error"); return; }
    const wsData: (string | number)[][] = [["Cheque #", "Customer", "Bank", "Date", "Amount", "Status"]];
    data.cheques.forEach((c) => {
      wsData.push([c.cheque_number, c.customer?.name || "", c.bank_name, new Date(c.cheque_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), c.amount, c.status]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, "Cheque Report");
    XLSX.writeFile(wb, `cheque-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cheque Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cheque summary by status, bank, and date range.</p>
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Date From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11" />
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Date To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11" />
          </div>
          <div className="relative sm:col-span-1" ref={chequeDropdownRef}>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Cheque #</label>
            <button type="button" onClick={() => setChequeDropdownOpen(!chequeDropdownOpen)} className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm transition-all hover:border-border focus:border-emerald-500">
              <span className={`truncate ${selectedCheque ? "text-foreground font-medium" : "text-muted-foreground"}`}>{selectedCheque ? `${selectedCheque.cheque_number} (${selectedCheque.bank_name})` : "All Cheques"}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${chequeDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {chequeDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                <div className="p-1.5"><input autoFocus value={chequeSearch} onChange={(e) => setChequeSearch(e.target.value)} placeholder="Search by cheque # or bank..." className="h-8 w-full rounded-md border border-border bg-muted px-2.5 text-xs outline-none focus:border-emerald-500" /></div>
                <div className="max-h-56 overflow-y-auto border-t border-border scrollbar-thin">
                  {filteredChequeList.length === 0 ? (<div className="px-3 py-4 text-center"><p className="text-xs text-muted-foreground">No cheques found</p></div>)
                  : (<>{selectedCheque && <button type="button" onClick={handleClearCheque} className="flex w-full items-center px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10">Clear selection</button>}
                    {filteredChequeList.map((c) => (<button key={c.id} type="button" onClick={() => handleSelectCheque(c)} className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent ${selectedCheque?.id === c.id ? "bg-emerald-500/10" : ""}`}>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-600 shrink-0"><CreditCard className="h-3.5 w-3.5" /></div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground font-mono">{c.cheque_number}</p><p className="text-[10px] text-muted-foreground">{c.bank_name} &middot; Rs. {Number(c.amount).toLocaleString("en-US")}</p></div>
                    </button>))}</>)}
                </div>
              </div>
            )}
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Bank Name</label>
            <BankSelect
              value={bankName}
              onChange={setBankName}
              placeholder="All Banks"
              className="h-11"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-3 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Total Cheques</p>
              <p className="text-base sm:text-lg font-bold text-foreground">{data.summary.total_count}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">{formatCurrency(data.summary.total_amount)}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs text-amber-600">Pending</p>
              <p className="text-base sm:text-lg font-bold text-amber-600">{data.summary.pending_count}</p>
              <p className="text-[11px] sm:text-xs text-amber-500">{formatCurrency(data.summary.pending_amount)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs text-emerald-600">Cleared</p>
              <p className="text-base sm:text-lg font-bold text-emerald-600">{data.summary.cleared_count}</p>
              <p className="text-[11px] sm:text-xs text-emerald-500">{formatCurrency(data.summary.cleared_amount)}</p>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs text-red-600">Bounced</p>
              <p className="text-base sm:text-lg font-bold text-red-600">{data.summary.bounced_count}</p>
              <p className="text-[11px] sm:text-xs text-red-500">{formatCurrency(data.summary.bounced_amount)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Cheque Details</h3>
            </div>
            <div className="hidden md:block overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cheque #</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bank</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.cheques.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-16 text-center"><CreditCard className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" /><p className="text-sm font-semibold text-foreground">No cheques found</p></td></tr>
                  ) : (
                    data.cheques.map((c) => (
                      <tr key={c.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-mono font-semibold text-foreground">{c.cheque_number}</td>
                        <td className="px-5 py-3 text-sm text-foreground">{c.customer?.name || "—"}</td>
                        <td className="px-5 py-3 text-sm text-foreground">{c.bank_name}</td>
                        <td className="px-5 py-3 text-sm text-foreground">{new Date(c.cheque_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-foreground">{formatCurrency(c.amount)}</td>
                        <td className="px-5 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGES[c.status] || ""}`}>{c.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-border">
              {data.cheques.length === 0 ? (
                <div className="px-4 py-16 text-center"><CreditCard className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" /><p className="text-sm font-semibold text-foreground">No cheques found</p></div>
              ) : (
                data.cheques.map((c) => (
                  <div key={c.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-semibold text-foreground">{c.cheque_number}</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGES[c.status] || ""}`}>{c.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground">{c.customer?.name || "—"}</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(c.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{c.bank_name}</span>
                      <span>{new Date(c.cheque_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
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
              <h3 className="text-sm sm:text-base font-bold text-foreground">Print Cheque Report</h3>
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
