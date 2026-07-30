"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ChevronRight as BreadcrumbSep, Upload, ChevronDown, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createPayment, type CreatePaymentPayload } from "@/lib/api/payments";
import { handleServerErrors } from "@/lib/api/handle-server-errors";
import { getCustomerList, type CustomerListItem } from "@/lib/api/customers";
import { getUnpaidSales, type Sale } from "@/lib/api/sales";
import { useAuthStore } from "@/stores/auth-store";

const paymentSchema = z.object({
  customer_id: z.number().min(1, "Customer is required"),
  total_amount: z.number().min(0.01, "Amount must be greater than 0"),
  payment_method: z.string().min(1, "Payment method is required"),
  payment_date: z.string().min(1, "Payment date is required"),
  notes: z.string().optional().or(z.literal("")),
});

type PaymentInput = z.infer<typeof paymentSchema>;

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export default function CreatePaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const canListCustomers = hasPermission("Customer List");
  const canListSales = hasPermission("Sale List");
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSaleIds, setSelectedSaleIds] = useState<number[]>([]);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    setError,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customer_id: 0,
      total_amount: 0,
      payment_method: "",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const selectedCustomerId = watch("customer_id");
  const totalAmount = watch("total_amount");
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
           c.code.toLowerCase().includes(customerSearch.toLowerCase()) ||
           c.phone.includes(customerSearch)
  ).slice(0, 20);

  const toggleSaleSelection = (saleId: number) => {
    setSelectedSaleIds((prev) =>
      prev.includes(saleId) ? prev.filter((id) => id !== saleId) : [...prev, saleId]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofImage(file);
    setProofImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setProofImage(null);
    if (proofImagePreview && proofImagePreview.startsWith("blob:")) URL.revokeObjectURL(proofImagePreview);
    setProofImagePreview(null);
  };

  const onSubmit = async (data: PaymentInput) => {
    setIsSaving(true);
    try {
      const payload: CreatePaymentPayload = {
        customer_id: data.customer_id,
        total_amount: data.total_amount,
        payment_method: data.payment_method,
        payment_date: data.payment_date,
      };
      if (selectedSaleIds.length > 0) payload.sale_ids = selectedSaleIds;
      if (data.notes) payload.notes = data.notes;
      if (proofImage) payload.proof_image = proofImage;

      await createPayment(payload);
      toast("Payment recorded and allocated successfully", "success");
      router.push("/payments");
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to record payment");
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
          <h1 className="text-2xl font-bold text-foreground">Record Payment</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Record a customer payment with FIFO allocation.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/payments")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">Payments</button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">Record</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer & Method */}
        <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Payment Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Customer */}
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Customer <span className="text-red-500">*</span></Label>
              <div className="relative" ref={customerDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 text-sm transition-all hover:border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <span className={selectedCustomer ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.code})` : "Search by name, code, phone..."}
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${customerDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {customerDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                    <div className="p-1.5">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input autoFocus value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search customers..." className="h-9 w-full rounded-lg border border-border bg-muted pl-8 pr-2.5 text-xs outline-none focus:border-emerald-500" />
                        {customerSearch && (
                          <button onClick={() => setCustomerSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto border-t border-border scrollbar-thin">
                      {filteredCustomers.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-muted-foreground">No customers found</div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button key={c.id} type="button" onClick={() => { setValue("customer_id", c.id, { shouldValidate: true }); setSelectedSaleIds([]); setCustomerDropdownOpen(false); setCustomerSearch(""); }} className={`flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-accent ${selectedCustomerId === c.id ? "bg-emerald-500/10 text-emerald-600 font-medium" : "text-foreground"}`}>
                            <span className="font-medium">{c.name}</span>
                            <span className="text-muted-foreground font-mono">{c.code}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.customer_id && <p className="text-xs text-red-500">{errors.customer_id.message}</p>}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Payment Method <span className="text-red-500">*</span></Label>
              <select {...register("payment_method")} className="flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-all hover:border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                <option value="">Select method</option>
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              {errors.payment_method && <p className="text-xs text-red-500">{errors.payment_method.message}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Amount <span className="text-red-500">*</span></Label>
              <Input type="number" {...register("total_amount", { valueAsNumber: true })} min="0.01" step="0.01" placeholder="0.00" className="h-11" />
              {errors.total_amount && <p className="text-xs text-red-500">{errors.total_amount.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Payment Date <span className="text-red-500">*</span></Label>
              <Input type="date" {...register("payment_date")} className="h-11" />
              {errors.payment_date && <p className="text-xs text-red-500">{errors.payment_date.message}</p>}
            </div>
          </div>
        </div>

        {/* Sale Allocation */}
        {Number(selectedCustomerId) > 0 && sales.length > 0 && (
          <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Sale Allocation (Optional)</h3>
              <p className="text-xs text-muted-foreground">Leave empty for FIFO auto-allocation</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Select specific sales to allocate this payment to, or leave empty for automatic FIFO settlement.</p>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {sales.map((sale) => (
                <button
                  key={sale.id}
                  type="button"
                  onClick={() => toggleSaleSelection(sale.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                    selectedSaleIds.includes(sale.id)
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                      selectedSaleIds.includes(sale.id) ? "border-emerald-500 bg-emerald-500" : "border-border"
                    }`}>
                      {selectedSaleIds.includes(sale.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-mono font-semibold text-foreground">{sale.reference_number}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sale.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(sale.total_amount)}</p>
                    <p className="text-xs text-red-600">Due: {formatCurrency(sale.due_amount)}</p>
                  </div>
                </button>
              ))}
            </div>
            {selectedSaleIds.length > 0 && (
              <div className="mt-3 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs text-emerald-600">
                {selectedSaleIds.length} sale(s) selected for allocation
              </div>
            )}
          </div>
        )}

        {/* Proof Image & Notes */}
        <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Additional Details</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Proof Image (Optional)</Label>
              {proofImagePreview ? (
                <div className="relative inline-block">
                  <img src={proofImagePreview} alt="Proof" className="h-32 rounded-xl object-cover border border-border" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600">×</button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted transition-colors hover:border-emerald-300 hover:bg-emerald-500/10">
                  <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Upload Proof</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP (max 2MB)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Notes (Optional)</Label>
              <textarea {...register("notes")} placeholder="Additional notes about this payment" rows={3} className="flex w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground hover:border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/payments")} className="h-11 px-6 border-border text-foreground font-semibold">Cancel</Button>
          <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Record Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
