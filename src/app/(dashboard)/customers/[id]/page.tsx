"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  UserCheck,
  Edit,
  Trash2,
  ChevronRight as BreadcrumbSep,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { getCustomer, deleteCustomer, type Customer } from "@/lib/api/customers";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

export default function ViewCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canEdit = hasPermission("Customer Update");
  const canDelete = hasPermission("Customer Delete");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await getCustomer(customerId);
        setCustomer(res.data);
      } catch {
        toast("Failed to load customer", "error");
        router.push("/customers");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [customerId, router, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomer(customerId);
      toast("Customer deleted successfully", "success");
      router.push("/customers");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to delete customer", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-7 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="rounded-2xl bg-muted h-36 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <UserCheck className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-semibold text-foreground">Customer not found</p>
        <Button onClick={() => router.push("/customers")} className="mt-4" variant="outline">
          Back to Customers
        </Button>
      </div>
    );
  }

  const initials = customer.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const formatCurrency = (amount: number) =>
    `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Details</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">View customer information and settings.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/customers")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">
            Customers
          </button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">{customer.name}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {customer.profile_image ? (
              <img
                src={getImageUrl(customer.profile_image) || ""}
                alt={customer.name}
                className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-2xl object-cover border-2 border-emerald-600 shadow-lg shadow-emerald-600/20"
              />
            ) : (
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                <span className="text-xl sm:text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{customer.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                  {customer.code}
                </Badge>
                {customer.is_active ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs font-semibold">
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canEdit && (
            <Button
              onClick={() => router.push(`/customers/${customer.id}/edit`)}
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
              className="border-red-500/20 text-red-600 hover:bg-red-500/10 font-semibold"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(customer.outstanding_balance)}</p>
              <p className="text-xs text-muted-foreground">Outstanding Balance</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <Hash className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground capitalize">{customer.id_type || "None"}</p>
              <p className="text-xs text-muted-foreground">ID Type</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
              <Calendar className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {new Date(customer.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">Created</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
              <UserCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{customer.code}</p>
              <p className="text-xs text-muted-foreground">Customer Code</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-600" />
              Contact Information
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm text-foreground truncate ml-4 text-right">{customer.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Phone</span>
              <span className="text-sm text-foreground">{customer.phone}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Secondary Phone</span>
              <span className="text-sm text-foreground">{customer.phone_secondary || "—"}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Address
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Line 1</span>
              <span className="text-sm text-foreground text-right truncate ml-4">{customer.address_line1 || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Line 2</span>
              <span className="text-sm text-foreground text-right truncate ml-4">{customer.address_line2 || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">City</span>
              <span className="text-sm text-foreground">{customer.city || "—"}</span>
            </div>
          </div>
        </div>

        {/* ID Information */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              ID Information
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Type</span>
              <span className="text-sm text-foreground capitalize">{customer.id_type || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Number</span>
              <span className="text-sm text-foreground font-mono">{customer.id_number || "—"}</span>
            </div>
            {customer.nic_image && (
              <div className="px-4 sm:px-5 py-2.5">
                <span className="text-xs text-muted-foreground block mb-1.5">ID Image</span>
                <img src={getImageUrl(customer.nic_image) || ""} alt="ID" className="h-16 w-24 rounded-lg object-cover border border-border" />
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Notes
            </h2>
          </div>
          <div className="px-4 sm:px-5 py-3">
            {customer.notes ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{customer.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No notes</p>
            )}
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Created: {new Date(customer.created_at).toLocaleDateString()}</span>
            <span className="hidden sm:inline">·</span>
            <span>Updated: {new Date(customer.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-card shadow-2xl border border-border overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-4 sm:p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Customer?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove <span className="font-semibold text-foreground">{customer.name}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted"
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
