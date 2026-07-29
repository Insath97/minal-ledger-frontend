"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Camera,
  Loader2,
  ChevronRight,
  ChevronDown,
  Shield,
  Calendar,
  X,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile } from "@/lib/api/auth";
import { handleServerErrors } from "@/lib/api/handle-server-errors";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace("/api/v1", "");

function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  current_password: z.string().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  password_confirmation: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.current_password && data.current_password.length > 0;
  }
  return true;
}, {
  message: "Current password is required when setting a new password",
  path: ["current_password"],
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password.length >= 6;
  }
  return true;
}, {
  message: "New password must be at least 6 characters",
  path: ["password"],
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.password_confirmation;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type ProfileInput = z.infer<typeof profileSchema>;

function PasswordInputField({
  register,
  name,
  placeholder,
  show,
  onToggle,
  error,
}: {
  register: UseFormReturn<ProfileInput>["register"];
  name: "current_password" | "password" | "password_confirmation";
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {name === "current_password" ? "Current Password" : name === "password" ? "New Password" : "Confirm New Password"}
      </label>
      <div className="relative">
        <Input
          {...register(name)}
          type={show ? "text" : "password"}
          className="h-11 rounded-xl pr-11"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageCacheBust, setImageCacheBust] = useState(0);

  const currentImage = imagePreview || (removeExistingImage ? null : getImageUrl(user?.profile_image));
  const displayImage = currentImage
    ? (currentImage.startsWith("blob:") ? currentImage : `${currentImage}?t=${imageCacheBust}`)
    : null;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const removeImage = useCallback(() => {
    setProfileImage(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const onSubmit = async (data: ProfileInput) => {
    setIsSaving(true);
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
      };
      if (profileImage) {
        payload.profile_image = profileImage;
      } else if (removeExistingImage) {
        payload.profile_image = null;
      }
      if (data.password && data.password.length > 0) {
        payload.current_password = data.current_password;
        payload.password = data.password;
        payload.confirm_password = data.password_confirmation;
      }
      const res = await updateProfile(payload);
      if (res.status === "success") {
        updateUser(res.data.user);
        setProfileImage(null);
        setImagePreview(null);
        setRemoveExistingImage(false);
        setImageCacheBust(Date.now());
        reset({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          current_password: "",
          password: "",
          password_confirmation: "",
        });
        toast("Profile updated successfully", "success");
      }
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const roleName = user?.roles?.[0]?.name || "User";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your personal information and settings.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/settings")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Settings</button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">My Profile</span>
        </nav>
      </div>

      {/* Profile Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left - Photo & Info */}
            <div className="lg:w-80 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-5 sm:p-8">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="relative group mb-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {displayImage ? (
                    <div className="relative h-32 w-32 sm:h-48 sm:w-48 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                      <img src={displayImage} alt={user?.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-xl bg-white p-2 text-slate-700 hover:bg-white/90 shadow-md"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="rounded-xl bg-white p-2 text-red-500 hover:bg-white/90 shadow-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-32 w-32 sm:h-48 sm:w-48 items-center justify-center rounded-2xl border-4 border-dashed border-slate-300 bg-white text-slate-400 transition-all hover:border-emerald-400 hover:text-emerald-500"
                    >
                      <div className="text-center">
                        <Camera className="mx-auto h-8 w-8 sm:h-10 sm:w-10 mb-1.5" />
                        <span className="text-xs font-medium">Upload</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* User Info */}
                <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
                <p className="text-sm text-slate-500">@{user?.username}</p>

                <div className="mt-4 flex flex-col items-center gap-2 w-full">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>{roleName}</span>
                  </div>
                  {user?.created_at && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="flex-1 p-5 sm:p-8">
              {/* Profile Information */}
              <h2 className="text-lg font-bold text-slate-900 mb-1">Profile Information</h2>
              <p className="text-sm text-slate-500 mb-6">Update your personal details and contact information.</p>

              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input {...register("name")} className="h-11 rounded-xl" placeholder="Enter your full name" />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                      Email Address
                    </label>
                    <Input {...register("email")} type="email" className="h-11 rounded-xl" placeholder="Enter your email" />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                      Phone Number
                    </label>
                    <Input {...register("phone")} className="h-11 rounded-xl" placeholder="Enter your phone number" />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                      Username
                    </label>
                    <Input value={user?.username || ""} className="h-11 rounded-xl bg-slate-50" disabled />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-8 border-t border-slate-200" />

              {/* Change Password */}
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex w-full items-center justify-between text-left group"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Change Password</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Update your password to keep your account secure.</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2 group-hover:bg-emerald-50 transition-colors">
                  <ChevronDown className={`h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-all ${showPasswordSection ? "rotate-180" : ""}`} />
                </div>
              </button>

              {showPasswordSection && (
                <div className="mt-5 space-y-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <PasswordInputField
                    register={register}
                    name="current_password"
                    placeholder="Enter current password"
                    show={showCurrentPassword}
                    onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                    error={errors.current_password?.message}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <PasswordInputField
                      register={register}
                      name="password"
                      placeholder="Enter new password"
                      show={showNewPassword}
                      onToggle={() => setShowNewPassword(!showNewPassword)}
                      error={errors.password?.message}
                    />
                    <PasswordInputField
                      register={register}
                      name="password_confirmation"
                      placeholder="Confirm new password"
                      show={showConfirm}
                      onToggle={() => setShowConfirm(!showConfirm)}
                      error={errors.password_confirmation?.message}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                <Button type="button" variant="outline" className="h-11 px-6 border-slate-200 text-slate-600 font-semibold" onClick={() => router.push("/settings")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Update Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
