"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ChevronRight as BreadcrumbSep, ShoppingCart, CreditCard, Upload, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createSale, type CreateSalePayload } from "@/lib/api/sales";
import { handleServerErrors } from "@/lib/api/handle-server-errors";
import { getCustomerList, type CustomerListItem } from "@/lib/api/customers";
import { useAuthStore } from "@/stores/auth-store";
import { BankSelect } from "@/components/shared/bank-select";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const saleSchema = z.object({
  business_type: z.enum(["retail", "wholesale"]),
  customer_id: z.number().optional().nullable(),
  invoice_number: z.string().max(100).optional().or(z.literal("")),
  total_amount: z.number().min(0.01, "Total amount must be greater than 0"),
  paid_amount: z.number().min(0, "Paid amount cannot be negative").optional(),
  sale_date: z.string().min(1, "Sale date is required"),
  notes: z.string().optional().or(z.literal("")),
  payment_method: z.string().optional().or(z.literal("")),
  cheque_number: z.string().max(50).optional().or(z.literal("")),
  bank_name: z.string().max(100).optional().or(z.literal("")),
  cheque_date: z.string().optional().or(z.literal("")),
  cheque_amount: z.number().min(0).optional(),
}).refine(
  (data) => {
    if (data.business_type === "wholesale" && (!data.customer_id || data.customer_id <= 0)) return false;
    if (data.business_type === "retail" && data.total_amount > 0 && (data.paid_amount ?? 0) < data.total_amount && (!data.customer_id || data.customer_id <= 0)) return false;
    return true;
  },
  { message: "Customer is required for this sale", path: ["customer_id"] }
);

type SaleInput = z.infer<typeof saleSchema>;

export default function CreateSalePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const canListCustomers = hasPermission("Customer List");
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billImagePreview, setBillImagePreview] = useState<string | null>(null);
  const [chequeImage, setChequeImage] = useState<File | null>(null);
  const [chequeImagePreview, setChequeImagePreview] = useState<string | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      business_type: "retail",
      customer_id: null,
      invoice_number: "",
      total_amount: 0,
      paid_amount: 0,
      sale_date: new Date().toISOString().split("T")[0],
      notes: "",
      payment_method: "",
      cheque_number: "",
      bank_name: "",
      cheque_date: "",
      cheque_amount: 0,
    },
  });

  const businessType = watch("business_type");
  const paymentMethod = watch("payment_method");
  const totalAmount = watch("total_amount");
  const paidAmount = watch("paid_amount");

  useEffect(() => {
    if (!canListCustomers) return;
    async function fetchCustomers() {
      try {
        const res = await getCustomerList();
        if (res.status === "success") {
          setCustomers(res.data);
        }
      } catch {
        // silent
      }
    }
    fetchCustomers();
  }, [canListCustomers]);

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

  const selectedCustomer = customers.find((c) => c.id === watch("customer_id"));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "bill" | "cheque") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "bill") {
      setBillImage(file);
      setBillImagePreview(URL.createObjectURL(file));
    } else {
      setChequeImage(file);
      setChequeImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (type: "bill" | "cheque") => {
    if (type === "bill") {
      setBillImage(null);
      if (billImagePreview) URL.revokeObjectURL(billImagePreview);
      setBillImagePreview(null);
    } else {
      setChequeImage(null);
      if (chequeImagePreview) URL.revokeObjectURL(chequeImagePreview);
      setChequeImagePreview(null);
    }
  };

  const onSubmit = async (data: SaleInput) => {
    setIsSaving(true);
    try {
      const payload: CreateSalePayload = {
        business_type: data.business_type,
        total_amount: data.total_amount,
        paid_amount: data.paid_amount || 0,
        sale_date: data.sale_date,
      };

      if (data.customer_id) payload.customer_id = data.customer_id;
      if (data.invoice_number) payload.invoice_number = data.invoice_number;
      if (data.notes) payload.notes = data.notes;
      if (billImage) payload.bill_image = billImage;

      if (data.business_type === "wholesale" && data.payment_method === "cheque") {
        payload.payment_method = "cheque";
        if (data.cheque_number) payload.cheque_number = data.cheque_number;
        if (data.bank_name) payload.bank_name = data.bank_name;
        if (data.cheque_date) payload.cheque_date = data.cheque_date;
        if (data.cheque_amount) payload.cheque_amount = data.cheque_amount;
        if (chequeImage) payload.cheque_image = chequeImage;
      }

      await createSale(payload);
      toast("Sale created successfully", "success");
      router.push("/sales");
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to create sale");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Sale</h1>
          <p className="mt-0.5 text-sm text-slate-500">Record a new sale transaction.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/sales")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Sales</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Create</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sale Type */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                placeholder="0.00"
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
                placeholder="0.00"
                className="h-11"
              />
            </div>
          </div>
          {totalAmount > 0 && paidAmount !== undefined && (
            <div className="mt-3 rounded-lg bg-slate-50 px-4 py-2 text-sm">
              <span className="text-slate-500">Due: </span>
              <span className={`font-semibold ${totalAmount - paidAmount > 0 ? "text-red-600" : "text-emerald-600"}`}>
                Rs. {Number(totalAmount - paidAmount).toLocaleString("en-US")}
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
              {businessType === "retail" && (
                <p className="text-xs text-slate-400">Customer is required for partial or unpaid retail sales to track balance.</p>
              )}
            </div>
          )}

          <div className="mt-4">
            <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Bill Image</Label>
            {billImagePreview ? (
              <div className="relative inline-block">
                <img src={billImagePreview} alt="Bill" className="h-40 w-full max-w-md rounded-xl object-cover border border-slate-200" />
                <button
                  type="button"
                  onClick={() => removeImage("bill")}
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
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "bill")} />
              </label>
            )}
          </div>
        </div>

        {/* Cheque Details (Wholesale only) */}
        {businessType === "wholesale" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Payment Method
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Payment Method</Label>
                <select
                  {...register("payment_method")}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">None</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {paymentMethod === "cheque" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Cheque Number</Label>
                    <Input {...register("cheque_number")} placeholder="CHQ-000000" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Bank Name</Label>
                    <BankSelect
                      value={watch("bank_name") || ""}
                      onChange={(val) => setValue("bank_name", val, { shouldValidate: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Cheque Date</Label>
                    <Input type="date" {...register("cheque_date")} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Cheque Amount</Label>
                    <Input
                      type="number"
                      {...register("cheque_amount", { valueAsNumber: true })}
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Cheque Image</Label>
                    {chequeImagePreview ? (
                      <div className="relative inline-block">
                        <img src={chequeImagePreview} alt="Cheque" className="h-20 rounded-xl object-cover border border-slate-200" />
                        <button
                          type="button"
                          onClick={() => removeImage("cheque")}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-20 w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-emerald-300 hover:bg-emerald-50">
                        <Upload className="mb-1 h-4 w-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">Upload Cheque</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "cheque")} />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Notes</h3>
          <textarea
            {...register("notes")}
            placeholder="Additional notes about this sale"
            rows={3}
            className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/sales")} className="h-11 px-6 border-slate-200 text-slate-600 font-semibold">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Create Sale
          </Button>
        </div>
      </form>
    </div>
  );
}
