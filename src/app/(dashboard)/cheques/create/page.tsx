"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ChevronRight as BreadcrumbSep, Upload, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createCheque, type CreateChequePayload } from "@/lib/api/cheques";
import { handleServerErrors } from "@/lib/api/handle-server-errors";
import { getCustomerList, type CustomerListItem } from "@/lib/api/customers";
import { getUnpaidSales, type Sale } from "@/lib/api/sales";
import { useAuthStore } from "@/stores/auth-store";
import { BankSelect } from "@/components/shared/bank-select";

const chequeSchema = z.object({
  customer_id: z.number().min(1, "Customer is required"),
  sale_id: z.number().optional().nullable(),
  cheque_number: z.string().min(1, "Cheque number is required").max(50),
  bank_name: z.string().min(1, "Bank name is required").max(100),
  cheque_date: z.string().min(1, "Cheque date is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  notes: z.string().optional().or(z.literal("")),
});

type ChequeInput = z.infer<typeof chequeSchema>;

export default function CreateChequePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const canListCustomers = hasPermission("Customer List");
  const canListSales = hasPermission("Sale List");
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [chequeImage, setChequeImage] = useState<File | null>(null);
  const [chequeImagePreview, setChequeImagePreview] = useState<string | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [saleDropdownOpen, setSaleDropdownOpen] = useState(false);
  const [saleSearch, setSaleSearch] = useState("");
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const saleDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ChequeInput>({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      customer_id: 0,
      sale_id: null,
      cheque_number: "",
      bank_name: "",
      cheque_date: new Date().toISOString().split("T")[0],
      amount: 0,
      notes: "",
    },
  });

  const selectedCustomerId = watch("customer_id");
  const selectedSaleId = watch("sale_id");
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedSale = sales.find((s) => s.id === selectedSaleId);

  useEffect(() => {
    if (!canListCustomers) return;
    async function fetchCustomers() {
      try {
        const res = await getCustomerList();
        if (res.status === "success") setCustomers(res.data);
      } catch { /* silent */ }
    }
    fetchCustomers();
  }, [canListCustomers]);

  useEffect(() => {
    if (!canListSales) return;
    async function fetchSales() {
      if (!selectedCustomerId) { setSales([]); return; }
      try {
        const res = await getUnpaidSales(selectedCustomerId);
        if (res.status === "success") setSales(res.data);
      } catch { /* silent */ }
    }
    fetchSales();
  }, [selectedCustomerId, canListSales]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setCustomerDropdownOpen(false);
        setCustomerSearch("");
      }
      if (saleDropdownRef.current && !saleDropdownRef.current.contains(e.target as Node)) {
        setSaleDropdownOpen(false);
        setSaleSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
           c.code.toLowerCase().includes(customerSearch.toLowerCase()) ||
           c.phone.includes(customerSearch)
  ).slice(0, 20);

  const filteredSales = sales.filter(
    (s) => s.reference_number.toLowerCase().includes(saleSearch.toLowerCase())
  ).slice(0, 20);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setChequeImage(file);
    setChequeImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setChequeImage(null);
    if (chequeImagePreview && chequeImagePreview.startsWith("blob:")) URL.revokeObjectURL(chequeImagePreview);
    setChequeImagePreview(null);
  };

  const onSubmit = async (data: ChequeInput) => {
    setIsSaving(true);
    try {
      const payload: CreateChequePayload = {
        customer_id: data.customer_id,
        cheque_number: data.cheque_number,
        bank_name: data.bank_name,
        cheque_date: data.cheque_date,
        amount: data.amount,
      };
      if (data.sale_id) payload.sale_id = data.sale_id;
      if (data.notes) payload.notes = data.notes;
      if (chequeImage) payload.cheque_image = chequeImage;

      await createCheque(payload);
      toast("Cheque recorded successfully", "success");
      router.push("/cheques");
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to record cheque");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Record Cheque</h1>
          <p className="mt-0.5 text-sm text-slate-500">Record a new pending cheque for tracking.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/cheques")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Cheques</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Record</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer & Sale */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Customer & Sale</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Customer Dropdown */}
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Customer <span className="text-red-500">*</span></Label>
              <div className="relative" ref={customerDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <span className={selectedCustomer ? "text-slate-700 font-medium" : "text-slate-400"}>
                    {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.code})` : "Search by name, code, phone..."}
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${customerDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {customerDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="p-1.5">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input autoFocus value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search customers..." className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2.5 text-xs outline-none focus:border-emerald-500" />
                        {customerSearch && (
                          <button onClick={() => setCustomerSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                      {filteredCustomers.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-slate-400">No customers found</div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button key={c.id} type="button" onClick={() => { setValue("customer_id", c.id, { shouldValidate: true }); setValue("sale_id", null); setCustomerDropdownOpen(false); setCustomerSearch(""); }} className={`flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 ${selectedCustomerId === c.id ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"}`}>
                            <span className="font-medium">{c.name}</span>
                            <span className="text-slate-400 font-mono">{c.code}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.customer_id && <p className="text-xs text-red-500">{errors.customer_id.message}</p>}
            </div>

            {/* Sale Dropdown */}
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Linked Sale (Optional)</Label>
              <div className="relative" ref={saleDropdownRef}>
                <button
                  type="button"
                  onClick={() => setSaleDropdownOpen(!saleDropdownOpen)}
                  disabled={!selectedCustomerId}
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={selectedSale ? "text-slate-700 font-medium" : "text-slate-400"}>
                    {selectedSale ? `${selectedSale.reference_number} (${formatCurrency(selectedSale.due_amount)})` : selectedCustomerId ? "Search sales..." : "Select customer first"}
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${saleDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {saleDropdownOpen && selectedCustomerId && (
                  <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="p-1.5">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input autoFocus value={saleSearch} onChange={(e) => setSaleSearch(e.target.value)} placeholder="Search sales..." className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2.5 text-xs outline-none focus:border-emerald-500" />
                        {saleSearch && (
                          <button onClick={() => setSaleSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                      <button type="button" onClick={() => { setValue("sale_id", null); setSaleDropdownOpen(false); setSaleSearch(""); }} className="flex w-full items-center px-3 py-2 text-xs text-slate-500 hover:bg-slate-50">No linked sale</button>
                      {filteredSales.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-slate-400">No unpaid sales</div>
                      ) : (
                        filteredSales.map((s) => (
                          <button key={s.id} type="button" onClick={() => { setValue("sale_id", s.id, { shouldValidate: true }); setSaleDropdownOpen(false); setSaleSearch(""); }} className={`flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 ${selectedSaleId === s.id ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"}`}>
                            <span className="font-mono font-medium">{s.reference_number}</span>
                            <span className="text-slate-400">{formatCurrency(s.due_amount)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cheque Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Cheque Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Cheque Number <span className="text-red-500">*</span></Label>
              <Input {...register("cheque_number")} placeholder="e.g. CHQ-987654" className="h-11" />
              {errors.cheque_number && <p className="text-xs text-red-500">{errors.cheque_number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Bank Name <span className="text-red-500">*</span></Label>
              <BankSelect
                value={watch("bank_name")}
                onChange={(val) => setValue("bank_name", val, { shouldValidate: true })}
                error={errors.bank_name?.message}
              />
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Cheque Date <span className="text-red-500">*</span></Label>
              <Input type="date" {...register("cheque_date")} className="h-11" />
              {errors.cheque_date && <p className="text-xs text-red-500">{errors.cheque_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Amount <span className="text-red-500">*</span></Label>
              <Input type="number" {...register("amount", { valueAsNumber: true })} min="0.01" step="0.01" placeholder="0.00" className="h-11" />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Cheque Image (Optional)</Label>
              {chequeImagePreview ? (
                <div className="relative inline-block">
                  <img src={chequeImagePreview} alt="Cheque" className="h-32 rounded-xl object-cover border border-slate-200" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600">×</button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-emerald-300 hover:bg-emerald-50">
                  <Upload className="mb-1 h-6 w-6 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Upload Cheque Image</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP (max 2MB)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Notes (Optional)</h3>
          <textarea {...register("notes")} placeholder="Additional notes about this cheque" rows={3} className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/cheques")} className="h-11 px-6 border-slate-200 text-slate-600 font-semibold">Cancel</Button>
          <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Record Cheque
          </Button>
        </div>
      </form>
    </div>
  );
}
