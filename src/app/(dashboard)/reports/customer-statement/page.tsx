"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, UserCheck, Search, ChevronDown, Printer, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getCustomerStatement, type CustomerStatementData } from "@/lib/api/reports";
import { getCustomers, type Customer } from "@/lib/api/customers";
import { ReportHeader } from "@/components/shared/report-header";
import { ReportFooter } from "@/components/shared/report-footer";
import { PrintModal } from "@/components/shared/print-modal";

export default function CustomerStatementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<CustomerStatementData | null>(null);
  const [loading, setLoading] = useState(false);

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

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const hasFilters = selectedCustomer || dateFrom !== firstOfYear || dateTo !== today;

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

  useEffect(() => { fetchCustomers(""); }, [fetchCustomers]);

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

  const clearFilters = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomers([]);
    setData(null);
    setDateFrom(firstOfYear);
    setDateTo(today);
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

  const handlePrint = () => {
    setPrintModalOpen(false);
    const el = printRef.current;
    if (!el) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Customer Statement - ${data?.customer?.name || ""}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; font-size: 11px; line-height: 1.4; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #10b981; }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .logo { width: 36px; height: 36px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; }
  .company-name { font-size: 15px; font-weight: 700; color: #0f172a; }
  .company-sub { font-size: 9px; color: #94a3b8; }
  .header-right { text-align: right; font-size: 9px; color: #94a3b8; }
  .header-right .date { font-size: 10px; font-weight: 600; color: #475569; }
  .title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
  .subtitle { font-size: 10px; color: #64748b; margin-bottom: 12px; }
  .meta { display: flex; gap: 20px; font-size: 10px; color: #475569; margin-bottom: 16px; flex-wrap: wrap; }
  .meta span { font-weight: 600; }
  .summary { display: flex; gap: 10px; margin-bottom: 16px; }
  .summary-card { flex: 1; padding: 8px 10px; border-radius: 6px; font-size: 10px; }
  .summary-card.sales { background: #ecfdf5; }
  .summary-card.payments { background: #eff6ff; }
  .summary-card.balance { background: #f8fafc; }
  .summary-card .label { font-weight: 600; }
  .summary-card .value { font-size: 13px; font-weight: 700; margin-top: 2px; }
  .summary-card.sales .label { color: #047857; }
  .summary-card.sales .value { color: #047857; }
  .summary-card.payments .label { color: #1d4ed8; }
  .summary-card.payments .value { color: #1d4ed8; }
  .summary-card.balance .label { color: #64748b; }
  .summary-card.balance .value { color: #0f172a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  thead th { background: #f8fafc; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; padding: 7px 8px; border-bottom: 2px solid #e2e8f0; text-align: left; }
  tbody td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 10px; }
  .text-right { text-align: right; }
  .badge { display: inline-block; padding: 1px 6px; border-radius: 9999px; font-size: 8px; font-weight: 600; }
  .badge-sale { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .badge-payment { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
  .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
  .footer .app-name { font-weight: 600; color: #64748b; }
</style></head><body>${el.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  const handleDownloadPdf = async () => {
    setPrintModalOpen(false);
    setShowPdfPreview(true);
    await new Promise((r) => setTimeout(r, 100));
    const el = printRef.current;
    if (!el) { setShowPdfPreview(false); return; }
    setDownloadingPdf(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentW = pageW - margin * 2;
      const imgH = (canvas.height * contentW) / canvas.width;
      let remaining = imgH;
      let srcY = 0;
      let page = 0;
      while (remaining > 0) {
        if (page > 0) pdf.addPage();
        const drawH = Math.min(remaining, pageH - margin * 2);
        const srcH = (drawH / imgH) * canvas.height;
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = srcH;
        const ctx = tmpCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
          pdf.addImage(tmpCanvas.toDataURL("image/png"), "PNG", margin, margin, contentW, drawH);
        }
        srcY += srcH;
        remaining -= drawH;
        page++;
      }
      const customerName = data?.customer?.name || "customer";
      pdf.save(`statement-${customerName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    } catch {
      toast("Failed to generate PDF", "error");
    } finally {
      setDownloadingPdf(false);
      setShowPdfPreview(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Customer Statement</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">Full transaction history for a customer.</p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Customer Select */}
          <div className="relative flex-1 min-w-0" ref={customerDropdownRef}>
            <button
              type="button"
              onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm transition-all hover:border-slate-300 focus:border-emerald-500"
            >
              <span className={`truncate ${selectedCustomer ? "text-slate-700 font-medium" : "text-slate-400"}`}>
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
                    <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 text-emerald-500 animate-spin" /></div>
                  ) : customers.length === 0 ? (
                    <div className="px-3 py-4 text-center"><p className="text-xs text-slate-500">No customers found</p></div>
                  ) : (
                    <>
                      {selectedCustomer && (
                        <button type="button" onClick={handleClearCustomer} className="flex w-full items-center px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">Clear selection</button>
                      )}
                      {customers.map((c) => (
                        <button key={c.id} type="button" onClick={() => handleSelectCustomer(c)} className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 ${selectedCustomer?.id === c.id ? "bg-emerald-50" : ""}`}>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 shrink-0">{c.name.charAt(0).toUpperCase()}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.code} &middot; {c.phone}</p>
                          </div>
                          {c.outstanding_balance > 0 && <span className="text-[10px] font-semibold text-red-600 shrink-0">{formatCurrency(c.outstanding_balance)}</span>}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date + Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11 w-full sm:w-auto sm:flex-none" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11 w-full sm:w-auto sm:flex-none" />
            {hasFilters && (
              <button onClick={clearFilters} className="h-11 px-4 rounded-lg bg-red-50 text-xs font-medium text-red-500 hover:bg-red-100 transition-colors whitespace-nowrap">
                Clear
              </button>
            )}
            {data && (
              <button onClick={() => setPrintModalOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 whitespace-nowrap">
                <Printer className="h-4 w-4" />
                Print
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          {/* Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{data.customer.name}</h3>
                <p className="text-sm text-slate-500">{data.customer.code} &middot; {data.customer.phone}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-slate-500">Outstanding Balance</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(data.customer.outstanding_balance)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          {/* Transactions */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Transactions</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Ref</th>
                    <th className="px-4 sm:px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Debit</th>
                    <th className="px-4 sm:px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Credit</th>
                    <th className="px-4 sm:px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.transactions.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-16 text-center"><UserCheck className="mx-auto h-10 w-10 text-slate-300 mb-3" /><p className="text-sm font-semibold text-slate-600">No transactions found</p></td></tr>
                  ) : (
                    data.transactions.map((txn, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 sm:px-5 py-3 text-sm text-slate-600 whitespace-nowrap">{new Date(txn.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-4 sm:px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${txn.type === "sale" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>{txn.type === "sale" ? "Sale" : "Payment"}</span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-sm text-slate-700 max-w-[200px] truncate">{txn.description}</td>
                        <td className="px-4 sm:px-5 py-3 text-sm font-mono text-slate-600">{txn.reference}</td>
                        <td className="px-4 sm:px-5 py-3 text-right text-sm font-semibold text-slate-700">{txn.debit > 0 ? formatCurrency(txn.debit) : "—"}</td>
                        <td className="px-4 sm:px-5 py-3 text-right text-sm font-semibold text-emerald-600">{txn.credit > 0 ? formatCurrency(txn.credit) : "—"}</td>
                        <td className="px-4 sm:px-5 py-3 text-right text-sm font-bold text-slate-900">{formatCurrency(txn.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 sm:p-16 text-center">
          <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600">Select a customer to view their statement</p>
        </div>
      )}

      {/* PDF Preview Overlay */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-[9998] bg-white flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* Hidden A4 Print Layout */}
      <div ref={printRef} style={{ position: "absolute", left: "-9999px", top: 0, width: "794px", background: "#fff", padding: "40px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#1e293b", fontSize: "11px", lineHeight: "1.5" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", paddingBottom: "14px", borderBottom: "2px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", background: "#10b981", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "16px" }}>M</div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Minal Ledger</div>
              <div style={{ fontSize: "9px", color: "#94a3b8" }}>Financial Management System</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "9px", color: "#94a3b8" }}>Generated on</div>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#475569" }}>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Customer Statement</div>
          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Full transaction history</div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: "24px", fontSize: "10px", color: "#475569", marginBottom: "16px", flexWrap: "wrap" }}>
          <div>Period: <span style={{ fontWeight: "600" }}>{dateFrom} to {dateTo}</span></div>
          <div>Customer: <span style={{ fontWeight: "600" }}>{data?.customer?.name || ""} ({data?.customer?.code || ""})</span></div>
          <div>Phone: <span style={{ fontWeight: "600" }}>{data?.customer?.phone || ""}</span></div>
        </div>

        {data && (
          <>
            {/* Summary Cards */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
              <div style={{ flex: 1, padding: "10px 12px", borderRadius: "6px", background: "#ecfdf5" }}>
                <div style={{ fontSize: "9px", fontWeight: "600", color: "#047857" }}>Total Sales</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#047857", marginTop: "2px" }}>{formatCurrency(data.summary.total_sales)}</div>
              </div>
              <div style={{ flex: 1, padding: "10px 12px", borderRadius: "6px", background: "#eff6ff" }}>
                <div style={{ fontSize: "9px", fontWeight: "600", color: "#1d4ed8" }}>Total Payments</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#1d4ed8", marginTop: "2px" }}>{formatCurrency(data.summary.total_payments)}</div>
              </div>
              <div style={{ flex: 1, padding: "10px 12px", borderRadius: "6px", background: "#f8fafc" }}>
                <div style={{ fontSize: "9px", fontWeight: "600", color: "#64748b" }}>Net Balance</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>{formatCurrency(data.summary.net_balance)}</div>
              </div>
            </div>

            {/* Transactions Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #10b981" }}>
                  {["Date", "Type", "Description", "Reference", "Debit", "Credit", "Balance"].map((h) => (
                    <th key={h} style={{ padding: "8px 8px", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", textAlign: h === "Debit" || h === "Credit" || h === "Balance" ? "right" : "left", borderBottom: "2px solid #10b981" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((txn, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "6px 8px", fontSize: "10px", color: "#475569" }}>{new Date(txn.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td style={{ padding: "6px 8px" }}>
                      <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "9999px", fontSize: "8px", fontWeight: "600", background: txn.type === "sale" ? "#eff6ff" : "#ecfdf5", color: txn.type === "sale" ? "#1d4ed8" : "#047857", border: `1px solid ${txn.type === "sale" ? "#bfdbfe" : "#a7f3d0"}` }}>{txn.type === "sale" ? "Sale" : "Payment"}</span>
                    </td>
                    <td style={{ padding: "6px 8px", fontSize: "10px", color: "#334155" }}>{txn.description}</td>
                    <td style={{ padding: "6px 8px", fontSize: "10px", color: "#475569" }}>{txn.reference}</td>
                    <td style={{ padding: "6px 8px", fontSize: "10px", fontWeight: "600", color: "#334155", textAlign: "right" }}>{txn.debit > 0 ? formatCurrency(txn.debit) : "—"}</td>
                    <td style={{ padding: "6px 8px", fontSize: "10px", fontWeight: "600", color: "#047857", textAlign: "right" }}>{txn.credit > 0 ? formatCurrency(txn.credit) : "—"}</td>
                    <td style={{ padding: "6px 8px", fontSize: "10px", fontWeight: "700", color: "#0f172a", textAlign: "right" }}>{formatCurrency(txn.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: "20px", paddingTop: "10px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#94a3b8" }}>
          <div>
            <div style={{ fontWeight: "600", color: "#64748b" }}>Minal Ledger</div>
            <div>Financial Management System</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div>Generated by: System</div>
            <div>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>
      </div>

      <PrintModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        onPrint={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        title="Customer Statement"
        downloading={downloadingPdf}
      />
    </div>
  );
}
