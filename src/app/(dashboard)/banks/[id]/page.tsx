"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  Building2,
  Edit,
  Trash2,
  ChevronRight as BreadcrumbSep,
  Hash,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBank, deleteBank } from "@/lib/api/banks";
import { useToast } from "@/components/ui/toast";
import type { Bank } from "@/lib/api/banks";
import { useAuthStore } from "@/stores/auth-store";

export default function ViewBankPage() {
  const router = useRouter();
  const params = useParams();
  const bankId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canEdit = hasPermission("Bank Update");
  const canDelete = hasPermission("Bank Delete");
  const [bank, setBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await getBank(bankId);
        if (res.status === "success") setBank(res.data);
      } catch {
        toast("Failed to load bank", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBank();
  }, [bankId, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBank(bankId);
      toast("Bank deleted successfully", "success");
      router.push("/banks");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to delete bank", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-7 w-40 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-2xl bg-slate-100 h-36 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Bank not found</p>
        <Button onClick={() => router.push("/banks")} className="mt-4" variant="outline">
          Back to Banks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bank Details</h1>
          <p className="mt-0.5 text-sm text-slate-500">View bank information.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/banks")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Banks</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">{bank.name}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{bank.name}</h2>
              <div className="mt-1 flex items-center gap-3">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  <Hash className="mr-1 h-3 w-3" />
                  {bank.code}
                </Badge>
                {bank.is_active ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs font-semibold">
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
            <Button
              onClick={() => router.push(`/banks/${bank.id}/edit`)}
              className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-md shadow-emerald-600/20"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            )}
            {canDelete && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 font-semibold"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <Hash className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{bank.code}</p>
              <p className="text-xs text-slate-500">Bank Code</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
              <Calendar className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{new Date(bank.created_at).toLocaleDateString()}</p>
              <p className="text-xs text-slate-500">Created</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{new Date(bank.updated_at).toLocaleDateString()}</p>
              <p className="text-xs text-slate-500">Last Updated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {bank.description && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Description</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-slate-600 leading-relaxed">{bank.description}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Bank?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This will permanently remove <span className="font-semibold text-slate-700">{bank.name}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/25 disabled:opacity-70"
                >
                  {isDeleting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
