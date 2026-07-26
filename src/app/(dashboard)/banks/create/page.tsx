"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, ChevronRight as BreadcrumbSep } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBank } from "@/lib/api/banks";
import { useToast } from "@/components/ui/toast";

const bankSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  code: z.string().min(1, "Code is required").max(50),
  description: z.string().optional().or(z.literal("")),
});

type BankInput = z.infer<typeof bankSchema>;

export default function CreateBankPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BankInput>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  const onSubmit = async (data: BankInput) => {
    setIsSaving(true);
    try {
      await createBank({
        name: data.name,
        code: data.code,
        description: data.description || undefined,
      });
      toast("Bank created successfully", "success");
      router.push("/banks");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to create bank", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Bank</h1>
          <p className="mt-0.5 text-sm text-slate-500">Add a new bank to the system.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/banks")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Banks</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Create</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Bank Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Name *</label>
              <Input {...register("name")} placeholder="e.g. Brac Bank" className="h-11" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Code *</label>
              <Input {...register("code")} placeholder="e.g. BRAC" className="h-11 uppercase" />
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Description</label>
              <Input {...register("description")} placeholder="Optional description" className="h-11" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/banks")} className="h-11 px-6 border-slate-200 text-slate-600 font-semibold">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create Bank
          </Button>
        </div>
      </form>
    </div>
  );
}
