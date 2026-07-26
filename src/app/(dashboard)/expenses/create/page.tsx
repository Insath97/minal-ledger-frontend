"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ChevronRight as BreadcrumbSep, Upload, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createExpense, type ExpenseItem } from "@/lib/api/expenses";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  category: z.string().min(1, "Category is required"),
  amount: z.number().optional(),
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

export default function CreateExpensePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      category: "",
      expense_date: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ description: "", quantity: 1, unit_price: 0, notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  const computedTotal = items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "receipt" | "bill") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "receipt") { setReceiptImage(file); setReceiptPreview(URL.createObjectURL(file)); }
    else { setBillImage(file); setBillPreview(URL.createObjectURL(file)); }
  };

  const removeImage = (type: "receipt" | "bill") => {
    if (type === "receipt") { setReceiptImage(null); if (receiptPreview) URL.revokeObjectURL(receiptPreview); setReceiptPreview(null); }
    else { setBillImage(null); if (billPreview) URL.revokeObjectURL(billPreview); setBillPreview(null); }
  };

  const onSubmit = async (data: ExpenseInput) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("expense_date", data.expense_date);
      if (data.notes) formData.append("notes", data.notes);
      if (data.amount) formData.append("amount", String(data.amount));
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

      await createExpense(formData);
      toast("Expense recorded successfully", "success");
      router.push("/expenses");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Array<{ field: string; messages: string[] }> } } };
      const backendErrors = error.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        backendErrors.forEach((e) => { if (e.messages?.length) toast(e.messages[0], "error"); });
      } else {
        toast(error.response?.data?.message || "Failed to record expense", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Expense</h1>
          <p className="mt-0.5 text-sm text-slate-500">Record a new business expense.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/expenses")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Expenses</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Add</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Expense Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Title <span className="text-red-500">*</span></Label>
              <Input {...register("title")} placeholder="e.g. Shop Rent for July" className="h-11" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Category <span className="text-red-500">*</span></Label>
              <select {...register("category")} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Expense Date <span className="text-red-500">*</span></Label>
              <Input type="date" {...register("expense_date")} className="h-11" />
              {errors.expense_date && <p className="text-xs text-red-500">{errors.expense_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Total Amount</Label>
              <Input type="number" value={computedTotal > 0 ? computedTotal : ""} readOnly placeholder="Auto-calculated from items" className="h-11 bg-slate-50 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Expense Items</h3>
            <button type="button" onClick={() => append({ description: "", quantity: 1, unit_price: 0, notes: "" })} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500">Item {index + 1}</span>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[11px] font-semibold text-slate-500">Description</Label>
                    <Input {...register(`items.${index}.description`)} placeholder="Item description" className="h-9 text-xs" />
                    {errors.items?.[index]?.description && <p className="text-[10px] text-red-500">{errors.items?.[index]?.description?.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-500">Qty</Label>
                    <Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} min="1" className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-500">Unit Price</Label>
                    <Input type="number" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} min="0" step="0.01" className="h-9 text-xs" />
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-500">Notes (optional)</Label>
                  <Input {...register(`items.${index}.notes`)} placeholder="Item notes" className="h-9 text-xs" />
                </div>
              </div>
            ))}
          </div>
          {computedTotal > 0 && (
            <div className="mt-4 rounded-lg bg-slate-50 px-4 py-2 text-sm text-right">
              <span className="text-slate-500">Computed Total: </span>
              <span className="font-bold text-slate-800">{formatCurrency(computedTotal)}</span>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Attachments</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Receipt Image</Label>
              {receiptPreview ? (
                <div className="relative inline-block">
                  <img src={receiptPreview} alt="Receipt" className="h-32 rounded-xl object-cover border border-slate-200" />
                  <button type="button" onClick={() => removeImage("receipt")} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600">×</button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-emerald-300 hover:bg-emerald-50">
                  <Upload className="mb-1 h-6 w-6 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Upload Receipt</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "receipt")} />
                </label>
              )}
            </div>
            <div className="space-y-2">
              <Label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Bill Image</Label>
              {billPreview ? (
                <div className="relative inline-block">
                  <img src={billPreview} alt="Bill" className="h-32 rounded-xl object-cover border border-slate-200" />
                  <button type="button" onClick={() => removeImage("bill")} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600">×</button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-emerald-300 hover:bg-emerald-50">
                  <Upload className="mb-1 h-6 w-6 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Upload Bill</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "bill")} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Notes</h3>
          <textarea {...register("notes")} placeholder="Additional notes about this expense" rows={3} className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/expenses")} className="h-11 px-6 border-slate-200 text-slate-600 font-semibold">Cancel</Button>
          <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Record Expense
          </Button>
        </div>
      </form>
    </div>
  );
}
