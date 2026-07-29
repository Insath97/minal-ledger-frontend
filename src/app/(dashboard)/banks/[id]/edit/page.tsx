"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ChevronRight as BreadcrumbSep } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBank, updateBank } from "@/lib/api/banks";
import { handleServerErrors } from "@/lib/api/handle-server-errors";
import { useToast } from "@/components/ui/toast";

const bankEditSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  code: z.string().min(1, "Code is required").max(50),
  description: z.string().optional().or(z.literal("")),
});

type BankEditInput = z.infer<typeof bankEditSchema>;

export default function EditBankPage() {
  const router = useRouter();
  const params = useParams();
  const bankId = Number(params.id);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BankEditInput>({
    resolver: zodResolver(bankEditSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await getBank(bankId);
        if (res.status === "success") {
          const b = res.data;
          reset({
            name: b.name,
            code: b.code,
            description: b.description || "",
          });
        }
      } catch {
        toast("Failed to load bank", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBank();
  }, [bankId, reset, toast]);

  const onSubmit = async (data: BankEditInput) => {
    setIsSaving(true);
    try {
      await updateBank(bankId, {
        name: data.name,
        code: data.code,
        description: data.description || undefined,
      });
      toast("Bank updated successfully", "success");
      router.push("/banks");
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to update bank");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Bank</h1>
          <p className="mt-0.5 text-sm text-slate-500">Update bank information.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/banks")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Banks</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Edit</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
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
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Update Bank
          </Button>
        </div>
      </form>
    </div>
  );
}
