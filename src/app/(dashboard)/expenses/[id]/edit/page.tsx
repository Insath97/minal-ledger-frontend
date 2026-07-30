"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ChevronRight as BreadcrumbSep, Upload, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { getExpense, updateExpense, type Expense } from "@/lib/api/expenses";
import { handleServerErrors } from "@/lib/api/handle-server-errors";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  category: z.string().min(1, "Category is required"),
  expense_date: z.string().min(1, "Expense date is required"),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Qty must be at least 1"),
    unit_price: z.number().min(0, "Price must be positive"),
    notes: z.string().optional().or(z.literal("")),
  })).optional(),
});

type ExpenseInput = z.infer<typeof expenseSchema>;

const CATEGORIES = [
  { value: "rent", label: "Rent" },
  { value: "electricity", label: "Electricity" },
  { value: "salaries", label: "Salaries" },
  { value: "transport", label: "Transport" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      category: "",
      expense_date: "",
      notes: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  useEffect(() => {
    async function fetchExpense() {
      try {
        const res = await getExpense(expenseId);
        const e = res.data;
        setExpense(e);
        reset({
          title: e.title,
          category: e.category,
          expense_date: e.expense_date ? new Date(e.expense_date).toISOString().split("T")[0] : "",
          notes: e.notes || "",
          items: e.items?.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes || "",
          })) || [],
        });
        if (e.receipt_image) setReceiptPreview(getImageUrl(e.receipt_image));
        if (e.bill_image) setBillPreview(getImageUrl(e.bill_image));
      } catch {
        toast("Failed to load expense", "error");
        router.push("/expenses");
      } finally {
        setLoading(false);
      }
    }
    fetchExpense();
  }, [expenseId, reset, router, toast]);

  const computedTotal = items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "receipt" | "bill") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "receipt") { setReceiptImage(file); setReceiptPreview(URL.createObjectURL(file)); }
    else { setBillImage(file); setBillPreview(URL.createObjectURL(file)); }
  };

  const removeImage = (type: "receipt" | "bill") => {
    if (type === "receipt") { setReceiptImage(null); if (receiptPreview && receiptPreview.startsWith("blob:")) URL.revokeObjectURL(receiptPreview); setReceiptPreview(null); }
    else { setBillImage(null); if (billPreview && billPreview.startsWith("blob:")) URL.revokeObjectURL(billPreview); setBillPreview(null); }
  };

  const onSubmit = async (data: ExpenseInput) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("expense_date", data.expense_date);
      if (data.notes) formData.append("notes", data.notes);
      if (receiptImage) formData.append("receipt_image", receiptImage);
      if (billImage) formData.append("bill_image", billImage);

      if (data.items && data.items.length > 0) {
        data.items.forEach((item, i) => {
          formData.append(`items[${i}][description]`, item.description);
          formData.append(`items[${i}][quantity]`, String(item.quantity));
          formData.append(`items[${i}][unit_price]`, String(item.unit_price));
          if (item.notes) formData.append(`items[${i}][notes]`, item.notes);
        });
      }

      await updateExpense(expenseId, formData);
      toast("Expense updated successfully", "success");
      router.push(`/expenses/${expenseId}`);
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to update expense");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!hasPermission("Expense Update")) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-500/10 p-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">You don&apos;t have permission to edit expenses.</p>
        <button onClick={() => router.push("/expenses")} className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Back to Expenses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Expense</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Update expense <span className="font-semibold text-foreground">{expense?.title}</span></p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/expenses")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">Expenses</button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">Edit</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Expense Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Title <span className="text-red-500">*</span></Label>
              <Input {...register("title")} placeholder="e.g. Shop Rent for July" className="h-11" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Category <span className="text-red-500">*</span></Label>
              <select {...register("category")} className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition-all hover:border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Expense Date <span className="text-red-500">*</span></Label>
              <Input type="date" {...register("expense_date")} className="h-11" />
              {errors.expense_date && <p className="text-xs text-red-500">{errors.expense_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Total Amount</Label>
              <Input type="number" value={computedTotal > 0 ? computedTotal : ""} readOnly placeholder="Auto-calculated from items" className="h-11 bg-muted cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Expense Items</h3>
            <button type="button" onClick={() => append({ description: "", quantity: 1, unit_price: 0, notes: "" })} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-600">
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-xl border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground">Item {index + 1}</span>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Description</Label>
                    <Input {...register(`items.${index}.description`)} placeholder="Item description" className="h-9 text-xs" />
                    {errors.items?.[index]?.description && <p className="text-[10px] text-red-500">{errors.items?.[index]?.description?.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Qty</Label>
                    <Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} min="1" className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Unit Price</Label>
                    <Input type="number" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} min="0" step="0.01" className="h-9 text-xs" />
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Notes (optional)</Label>
                  <Input {...register(`items.${index}.notes`)} placeholder="Item notes" className="h-9 text-xs" />
                </div>
              </div>
            ))}
          </div>
          {computedTotal > 0 && (
            <div className="mt-4 rounded-lg bg-muted px-4 py-2 text-sm text-right">
              <span className="text-muted-foreground">Computed Total: </span>
              <span className="font-bold text-foreground">{formatCurrency(computedTotal)}</span>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Attachments</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Receipt Image</Label>
              {receiptPreview ? (
                <div className="relative inline-block">
                  <img src={receiptPreview} alt="Receipt" className="h-32 rounded-xl object-cover border border-border" />
                  <button type="button" onClick={() => removeImage("receipt")} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600">×</button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted transition-colors hover:border-emerald-300 hover:bg-emerald-500/10">
                  <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Upload Receipt</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "receipt")} />
                </label>
              )}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-foreground">Bill Image</Label>
              {billPreview ? (
                <div className="relative inline-block">
                  <img src={billPreview} alt="Bill" className="h-32 rounded-xl object-cover border border-border" />
                  <button type="button" onClick={() => removeImage("bill")} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600">×</button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted transition-colors hover:border-emerald-300 hover:bg-emerald-500/10">
                  <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Upload Bill</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "bill")} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Notes</h3>
          <textarea {...register("notes")} placeholder="Additional notes about this expense" rows={3} className="flex w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground hover:border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/expenses")} className="h-11 px-6 border-border text-foreground font-semibold">Cancel</Button>
          <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Update Expense
          </Button>
        </div>
      </form>
    </div>
  );
}
