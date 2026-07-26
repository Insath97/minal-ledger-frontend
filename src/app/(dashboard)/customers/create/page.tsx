"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus, ChevronRight as BreadcrumbSep, Camera, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCustomer } from "@/lib/api/customers";
import { useToast } from "@/components/ui/toast";
import { FormSection, FormField, FormGrid, ImageUpload } from "@/components/customers/customer-form-fields";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required").max(20),
  phone_secondary: z.string().max(20).optional().or(z.literal("")),
  id_type: z.string().optional().or(z.literal("")),
  id_number: z.string().max(50).optional().or(z.literal("")),
  address_line1: z.string().max(255).optional().or(z.literal("")),
  address_line2: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type CustomerInput = z.infer<typeof customerSchema>;

export default function CreateCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [nicImage, setNicImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [nicImagePreview, setNicImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "", email: "", phone: "", phone_secondary: "",
      id_type: "", id_number: "", address_line1: "", address_line2: "",
      city: "", notes: "",
    },
  });

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

  const onSubmit = async (data: CustomerInput) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      if (data.email) formData.append("email", data.email);
      if (data.phone_secondary) formData.append("phone_secondary", data.phone_secondary);
      if (data.id_type) formData.append("id_type", data.id_type);
      if (data.id_number) formData.append("id_number", data.id_number);
      if (data.address_line1) formData.append("address_line1", data.address_line1);
      if (data.address_line2) formData.append("address_line2", data.address_line2);
      if (data.city) formData.append("city", data.city);
      if (data.notes) formData.append("notes", data.notes);
      if (profileImage) formData.append("profile_image", profileImage);
      if (nicImage) formData.append("nic_image", nicImage);

      const { data: res } = await import("@/lib/api/axios-client").then((m) =>
        m.default.post("/customers", formData, { headers: { "Content-Type": "multipart/form-data" } })
      );
      toast("Customer created successfully", "success");
      router.push("/customers");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Array<{ messages?: string[] }> } } };
      const message = error.response?.data?.message || "Failed to create customer";
      const errors = error.response?.data?.errors;
      toast(errors?.[0]?.messages?.[0] || message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Customer</h1>
          <p className="mt-0.5 text-sm text-slate-500">Add a new customer to the system.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/customers")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Customers</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Create</span>
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
            <FormField label="Secondary Phone">
              <Input {...register("phone_secondary")} placeholder="Optional" className="h-11" />
            </FormField>
          </FormGrid>
        </FormSection>

        {/* ID Information */}
        <FormSection title="ID Information">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="ID Type">
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
              <FormField label="ID Number">
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
            <FormField label="Address Line 1">
              <Input {...register("address_line1")} placeholder="Street address" className="h-11" />
            </FormField>
            <FormField label="Address Line 2">
              <Input {...register("address_line2")} placeholder="Apartment, suite, etc." className="h-11" />
            </FormField>
            <FormField label="City">
              <Input {...register("city")} placeholder="City" className="h-11" />
            </FormField>
          </div>
        </FormSection>

        {/* Notes */}
        <FormSection title="Notes">
          <FormField label="Notes">
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
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Create Customer
          </Button>
        </div>
      </form>
    </div>
  );
}
