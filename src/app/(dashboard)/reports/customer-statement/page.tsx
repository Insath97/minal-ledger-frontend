"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, UserCheck, Search, ChevronDown, Printer } from "lucide-react";
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

  // Print state
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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

  // Print handler
  const handlePrint = () => {
    setPrintModalOpen(false);
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Customer Statement</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #1e293b; }
        @page { size: A4; margin: 15mm; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f8fafc; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; padding: 8px 10px; border-bottom: 2px solid #e2e8f0; text-align: left; }
        th:last-child, td:last-child { text-align: right; }
        td { font-size: 11px; padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 600; }
        .badge-sale { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .badge-payment { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
      </style></head><body>${printContent.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  // PDF download handler
  const handleDownloadPdf = async () => {
    setPrintModalOpen(false);
    const el = printRef.current;
    if (!el) return;
    setDownloadingPdf(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let hLeft = pdfH;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pdfW, pdfH);
      hLeft -= pdf.internal.pageSize.getHeight();
      while (hLeft > 0) {
        position = hLeft - pdfH;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfW, pdfH);
        hLeft -= pdf.internal.pageSize.getHeight();
      }
      const customerName = data?.customer?.name || "customer";
      pdf.save(`statement-${customerName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    } catch {
      toast("Failed to generate PDF", "error");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Statement</h1>
        <p className="mt-1 text-sm text-slate-500">Full transaction history for a customer.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Customer Searchable Select */}
          <div className="relative flex-1" ref={customerDropdownRef}>
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

          <div className="w-[180px]">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11" />
          </div>
          <div className="w-[180px]">
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11" />
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="h-11 px-4 rounded-lg bg-red-50 text-xs font-medium text-red-500 hover:bg-red-100 transition-colors whitespace-nowrap">
              Clear
            </button>
          )}

          {data && (
            <button
              onClick={() => setPrintModalOpen(true)}
              className="flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 whitespace-nowrap"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          )}
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

      {/* Hidden A4 Print Layout */}
      <div ref={printRef} className="fixed top-0 left-[-9999px] w-[794px] bg-white p-[40px] text-slate-900" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>
        <ReportHeader
          title="Customer Statement"
          subtitle="Full transaction history"
          dateRange={{ from: dateFrom, to: dateTo }}
          extraInfo={[
            { label: "Customer", value: `${data?.customer?.name || ""} (${data?.customer?.code || ""})` },
            { label: "Phone", value: data?.customer?.phone || "" },
          ]}
        />

        {data && (
          <>
            <div className="mb-4 flex gap-4 text-xs">
              <div className="rounded-lg bg-emerald-50 p-3 flex-1">
                <p className="text-emerald-600 font-semibold">Total Sales</p>
                <p className="text-emerald-700 font-bold text-sm">{formatCurrency(data.summary.total_sales)}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 flex-1">
                <p className="text-blue-600 font-semibold">Total Payments</p>
                <p className="text-blue-700 font-bold text-sm">{formatCurrency(data.summary.total_payments)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 flex-1">
                <p className="text-slate-500 font-semibold">Net Balance</p>
                <p className="text-slate-900 font-bold text-sm">{formatCurrency(data.summary.net_balance)}</p>
              </div>
            </div>

            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b-2 border-emerald-600">
                  <th className="py-2 text-left font-bold text-slate-700">Date</th>
                  <th className="py-2 text-left font-bold text-slate-700">Type</th>
                  <th className="py-2 text-left font-bold text-slate-700">Description</th>
                  <th className="py-2 text-left font-bold text-slate-700">Reference</th>
                  <th className="py-2 text-right font-bold text-slate-700">Debit</th>
                  <th className="py-2 text-right font-bold text-slate-700">Credit</th>
                  <th className="py-2 text-right font-bold text-slate-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((txn, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-600">{new Date(txn.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="py-1.5">
                      <span className={`badge ${txn.type === "sale" ? "badge-sale" : "badge-payment"}`}>{txn.type}</span>
                    </td>
                    <td className="py-1.5 text-slate-700">{txn.description}</td>
                    <td className="py-1.5 text-slate-600">{txn.reference}</td>
                    <td className="py-1.5 text-right font-semibold text-slate-700">{txn.debit > 0 ? formatCurrency(txn.debit) : "—"}</td>
                    <td className="py-1.5 text-right font-semibold text-emerald-600">{txn.credit > 0 ? formatCurrency(txn.credit) : "—"}</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">{formatCurrency(txn.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <ReportFooter />
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
