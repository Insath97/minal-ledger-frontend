"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ChevronRight as BreadcrumbSep, Upload, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { getSale, updateSale, type Sale } from "@/lib/api/sales";
import { handleServerErrors } from "@/lib/api/handle-server-errors";
import { getCustomerList, type CustomerListItem } from "@/lib/api/customers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const saleEditSchema = z.object({
  business_type: z.enum(["retail", "wholesale"]),
  customer_id: z.number().optional().nullable(),
  invoice_number: z.string().max(100).optional().or(z.literal("")),
  total_amount: z.number().min(0.01, "Total amount must be greater than 0"),
  paid_amount: z.number().min(0, "Paid amount cannot be negative").optional(),
  sale_date: z.string().min(1, "Sale date is required"),
  notes: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.business_type === "wholesale" && (!data.customer_id || data.customer_id <= 0)) return false;
    if (data.business_type === "retail" && data.total_amount > 0 && (data.paid_amount ?? 0) < data.total_amount && (!data.customer_id || data.customer_id <= 0)) return false;
    return true;
  },
  { message: "Customer is required for this sale", path: ["customer_id"] }
);

type SaleEditInput = z.infer<typeof saleEditSchema>;

export default function EditSalePage() {
  const router = useRouter();
  const params = useParams();
  const saleId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billImagePreview, setBillImagePreview] = useState<string | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<SaleEditInput>({
    resolver: zodResolver(saleEditSchema),
    defaultValues: {
      business_type: "retail",
      customer_id: null,
      invoice_number: "",
      total_amount: 0,
      paid_amount: 0,
      sale_date: "",
      notes: "",
    },
  });

  const businessType = watch("business_type");
  const totalAmount = watch("total_amount");
  const paidAmount = watch("paid_amount");
  const selectedCustomer = customers.find((c) => c.id === watch("customer_id"));

  useEffect(() => {
    async function fetchData() {
      try {
        const promises: Promise<unknown>[] = [getSale(saleId)];
        if (hasPermission("Customer List")) {
          promises.push(getCustomerList());
        }
        const results = await Promise.all(promises);
        const saleRes = results[0] as { data: Sale; status: string };
        const s = saleRes.data;
        setSale(s);
        if (hasPermission("Customer List") && results[1]) {
          const custRes = results[1] as { data: CustomerListItem[]; status: string };
          if (custRes.status === "success") setCustomers(custRes.data);
        }
        reset({
          business_type: s.business_type,
          customer_id: s.customer_id,
          invoice_number: s.invoice_number || "",
          total_amount: s.total_amount,
          paid_amount: s.paid_amount,
          sale_date: s.sale_date ? new Date(s.sale_date).toISOString().split("T")[0] : "",
          notes: s.notes || "",
        });
        if (s.bill_image) setBillImagePreview(getImageUrl(s.bill_image));
      } catch {
        toast("Failed to load sale", "error");
        router.push("/sales");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [saleId, reset, router, toast]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setCustomerDropdownOpen(false);
        setCustomerSearch("");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBillImage(file);
    setBillImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setBillImage(null);
    if (billImagePreview && billImagePreview.startsWith("blob:")) URL.revokeObjectURL(billImagePreview);
    setBillImagePreview(null);
  };

  const onSubmit = async (data: SaleEditInput) => {
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        business_type: data.business_type,
        total_amount: data.total_amount,
        paid_amount: data.paid_amount || 0,
        sale_date: data.sale_date,
        invoice_number: data.invoice_number || undefined,
        notes: data.notes || undefined,
      };
      if (data.customer_id) payload.customer_id = data.customer_id;
      if (billImage) payload.bill_image = billImage;

      await updateSale(saleId, payload as any);
      toast("Sale updated successfully", "success");
      router.push(`/sales/${saleId}`);
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to update sale");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-7 w-40 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-2xl bg-slate-100 h-64 animate-pulse" />
      </div>
    );
  }

  if (!hasPermission("Sale Update")) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-100 p-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">You don&apos;t have permission to edit sales.</p>
        <button onClick={() => router.push("/sales")} className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Back to Sales
        </button>
      </div>
    );
  }

  if (!sale) return null;

  const formatCurrency = (amount: number) =>
    `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Sale</h1>
          <p className="mt-0.5 text-sm text-slate-500">Update sale for <span className="font-semibold text-slate-700">{sale.reference_number}</span></p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/sales")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Sales</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Edit</span>
        </nav>
      </div>

      {/* Sale Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <p className="text-xs text-slate-500">Reference</p>
            <p className="text-sm font-semibold text-slate-700 font-mono">{sale.reference_number}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-sm font-semibold text-slate-700">{formatCurrency(sale.total_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Paid</p>
            <p className="text-sm font-semibold text-slate-700">{formatCurrency(sale.paid_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <p className={`text-sm font-semibold capitalize ${sale.payment_status === "paid" ? "text-emerald-600" : sale.payment_status === "partial" ? "text-amber-600" : "text-red-600"}`}>
              {sale.payment_status}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sale Type */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Sale Type</h3>
          <div className="flex gap-3">
            {(["retail", "wholesale"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue("business_type", type, { shouldValidate: true })}
                className={`flex-1 h-11 rounded-xl border-2 text-sm font-semibold transition-all ${
                  businessType === type
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {type === "retail" ? "Retail" : "Wholesale"}
              </button>
            ))}
          </div>
        </div>

        {/* Sale Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Sale Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Invoice Number</Label>
              <Input {...register("invoice_number")} placeholder="e.g. INV-00001" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                Sale Date <span className="text-red-500">*</span>
              </Label>
              <Input type="date" {...register("sale_date")} className="h-11" />
              {errors.sale_date && <p className="text-xs text-red-500">{errors.sale_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                Total Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                {...register("total_amount", { valueAsNumber: true })}
                min="0.01"
                step="0.01"
                className="h-11"
              />
              {errors.total_amount && <p className="text-xs text-red-500">{errors.total_amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Paid Amount</Label>
              <Input
                type="number"
                {...register("paid_amount", { valueAsNumber: true })}
                min="0"
                step="0.01"
                className="h-11"
              />
            </div>
          </div>
          {totalAmount > 0 && paidAmount !== undefined && (
            <div className="mt-3 rounded-lg bg-slate-50 px-4 py-2 text-sm">
              <span className="text-slate-500">Due: </span>
              <span className={`font-semibold ${totalAmount - paidAmount > 0 ? "text-red-600" : "text-emerald-600"}`}>
                {formatCurrency(totalAmount - paidAmount)}
              </span>
            </div>
          )}

          {/* Customer Selection (inline) */}
          {(businessType === "wholesale" || (businessType === "retail" && totalAmount > 0 && (paidAmount ?? 0) < totalAmount)) && (
            <div className="mt-4 space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                Select Customer <span className="text-red-500">*</span>
              </Label>
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
                        <input
                          autoFocus
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          placeholder="Search customers..."
                          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2.5 text-xs outline-none focus:border-emerald-500"
                        />
                        {customerSearch && (
                          <button onClick={() => setCustomerSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => { setValue("customer_id", null, { shouldValidate: true }); setCustomerDropdownOpen(false); setCustomerSearch(""); }}
                        className="flex w-full items-center px-3 py-2 text-xs text-slate-500 hover:bg-slate-50"
                      >
                        No customer (Walk-in)
                      </button>
                      {filteredCustomers.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-slate-400">No customers found</div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => { setValue("customer_id", c.id, { shouldValidate: true }); setCustomerDropdownOpen(false); setCustomerSearch(""); }}
                            className={`flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 ${watch("customer_id") === c.id ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"}`}
                          >
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
          )}

          <div className="mt-4">
            <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Bill Image</Label>
            {billImagePreview ? (
              <div className="relative inline-block">
                <img src={billImagePreview} alt="Bill" className="h-40 w-full max-w-md rounded-xl object-cover border border-slate-200" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-emerald-300 hover:bg-emerald-50">
                <Upload className="mb-2 h-8 w-8 text-slate-400" />
                <span className="text-sm font-medium text-slate-500">Upload Bill Image</span>
                <span className="text-xs text-slate-400 mt-1">PNG, JPG, SVG, WEBP (max 2MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Notes</h3>
          <textarea
            {...register("notes")}
            placeholder="Additional notes about this sale"
            rows={3}
            className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/sales/${saleId}`)} className="h-11 px-6 border-slate-200 text-slate-600 font-semibold">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Update Sale
          </Button>
        </div>
      </form>
    </div>
  );
}
