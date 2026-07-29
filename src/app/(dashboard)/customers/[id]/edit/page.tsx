"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ChevronRight as BreadcrumbSep, Camera, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCustomer, updateCustomer } from "@/lib/api/customers";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { FormSection, FormField, FormGrid, ImageUpload } from "@/components/customers/customer-form-fields";
import { handleServerErrors } from "@/lib/api/handle-server-errors";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const customerEditSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required").max(20),
  phone_secondary: z.string().max(20).optional().or(z.literal("")),
  id_type: z.string().optional().or(z.literal("")),
  id_number: z.string().max(50).optional().or(z.literal("")),
  address_line1: z.string().max(255).optional().or(z.literal("")),
  address_line2: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  outstanding_balance: z.number().min(0),
  is_active: z.boolean(),
  notes: z.string().optional().or(z.literal("")),
});

type CustomerEditInput = z.infer<typeof customerEditSchema>;

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [nicImage, setNicImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [nicImagePreview, setNicImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<CustomerEditInput>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      name: "", email: "", phone: "", phone_secondary: "",
      id_type: "", id_number: "", address_line1: "", address_line2: "",
      city: "", outstanding_balance: 0, is_active: true, notes: "",
    },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await getCustomer(customerId);
        const c = res.data;
        reset({
          name: c.name, email: c.email || "", phone: c.phone,
          phone_secondary: c.phone_secondary || "", id_type: c.id_type || "",
          id_number: c.id_number || "", address_line1: c.address_line1 || "",
          address_line2: c.address_line2 || "", city: c.city || "",
          outstanding_balance: c.outstanding_balance, is_active: c.is_active,
          notes: c.notes || "",
        });
        if (c.profile_image) setProfileImagePreview(getImageUrl(c.profile_image));
        if (c.nic_image) setNicImagePreview(getImageUrl(c.nic_image));
      } catch {
        toast("Failed to load customer", "error");
        router.push("/customers");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [customerId, reset, router, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "nic") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "profile") {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    } else {
      setNicImage(file);
      setNicImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (type: "profile" | "nic") => {
    if (type === "profile") {
      setProfileImage(null);
      if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
      setProfileImagePreview(null);
    } else {
      setNicImage(null);
      if (nicImagePreview) URL.revokeObjectURL(nicImagePreview);
      setNicImagePreview(null);
    }
  };

  const onSubmit = async (data: CustomerEditInput) => {
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        phone: data.phone,
        is_active: data.is_active ? "1" : "0",
        outstanding_balance: data.outstanding_balance,
      };
      if (data.email) payload.email = data.email;
      if (data.phone_secondary) payload.phone_secondary = data.phone_secondary;
      if (data.id_type) payload.id_type = data.id_type;
      if (data.id_number) payload.id_number = data.id_number;
      if (data.address_line1) payload.address_line1 = data.address_line1;
      if (data.address_line2) payload.address_line2 = data.address_line2;
      if (data.city) payload.city = data.city;
      if (data.notes) payload.notes = data.notes;
      if (profileImage) payload.profile_image = profileImage;
      if (nicImage) payload.nic_image = nicImage;

      await updateCustomer(customerId, payload as any);
      toast("Customer updated successfully", "success");
      router.push(`/customers/${customerId}`);
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to update customer");
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
        <div className="rounded-2xl bg-slate-100 h-40 animate-pulse" />
      </div>
    );
  }

  if (!hasPermission("Customer Update")) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-100 p-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">You don&apos;t have permission to edit customers.</p>
        <button onClick={() => router.push("/customers")} className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Customer</h1>
          <p className="mt-0.5 text-sm text-slate-500">Update customer information.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/customers")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Customers</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Edit</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Image */}
        <FormSection title="Profile Photo">
          <ImageUpload
            label=""
            preview={profileImagePreview}
            icon={<Camera className="h-6 w-6 text-slate-400 mb-1" />}
            uploadText="Upload Photo"
            onRemove={() => removeImage("profile")}
            onChange={(e) => handleImageChange(e, "profile")}
          />
        </FormSection>

        {/* Basic Info */}
        <FormSection title="Basic Information">
          <FormGrid>
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register("name")} placeholder="e.g. John Doe" className="h-11" />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input {...register("email")} type="email" placeholder="e.g. john@example.com" className="h-11" />
            </FormField>
            <FormField label="Phone" required error={errors.phone?.message}>
              <Input {...register("phone")} placeholder="e.g. +94 77 123 4567" className="h-11" />
            </FormField>
            <FormField label="Secondary Phone" error={errors.phone_secondary?.message}>
              <Input {...register("phone_secondary")} placeholder="Optional" className="h-11" />
            </FormField>
          </FormGrid>
        </FormSection>

        {/* ID Information */}
        <FormSection title="ID Information">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="ID Type" error={errors.id_type?.message}>
                <select
                  {...register("id_type")}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">None</option>
                  <option value="nic">NIC</option>
                  <option value="driving">Driving License</option>
                  <option value="passport">Passport</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
              <FormField label="ID Number" error={errors.id_number?.message}>
                <Input {...register("id_number")} placeholder="Enter ID number" className="h-11" />
              </FormField>
            </div>
            <ImageUpload
              label="NIC / ID Image"
              preview={nicImagePreview}
              icon={<CreditCard className="h-5 w-5 text-slate-400 mb-1" />}
              uploadText="Upload ID"
              onRemove={() => removeImage("nic")}
              onChange={(e) => handleImageChange(e, "nic")}
              variant="rectangular"
            />
          </div>
        </FormSection>

        {/* Address */}
        <FormSection title="Address">
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Address Line 1" error={errors.address_line1?.message}>
              <Input {...register("address_line1")} placeholder="Street address" className="h-11" />
            </FormField>
            <FormField label="Address Line 2" error={errors.address_line2?.message}>
              <Input {...register("address_line2")} placeholder="Apartment, suite, etc." className="h-11" />
            </FormField>
            <FormField label="City" error={errors.city?.message}>
              <Input {...register("city")} placeholder="City" className="h-11" />
            </FormField>
          </div>
        </FormSection>

        {/* Status & Balance */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Status" error={errors.is_active?.message}>
              <button
                type="button"
                onClick={() => setValue("is_active", !isActive)}
                className="inline-flex items-center gap-2.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? "bg-emerald-500" : "bg-slate-200"}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                </span>
                <span className={`text-sm font-medium ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </button>
            </FormField>
            <FormField label="Outstanding Balance" error={errors.outstanding_balance?.message}>
              <Input
                type="number"
                {...register("outstanding_balance", { valueAsNumber: true })}
                min="0"
                readOnly
                className="h-11 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </FormField>
          </div>
        </div>

        {/* Notes */}
        <FormSection title="Notes">
          <FormField label="Notes" error={errors.notes?.message}>
            <textarea
              {...register("notes")}
              placeholder="Additional notes about the customer"
              rows={3}
              className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </FormField>
        </FormSection>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/customers")} className="h-11 px-6 border-slate-200 text-slate-600 font-semibold">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Update Customer
          </Button>
        </div>
      </form>
    </div>
  );
}
