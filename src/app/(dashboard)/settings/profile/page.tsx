"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Camera,
  Loader2,
  ChevronRight,
  User,
  Shield,
  Calendar,
  Clock,
  X,
  Eye,
  EyeOff,
  Check,
  Lock,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile } from "@/lib/api/auth";

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
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  password: z.string().min(6, "New password must be at least 6 characters"),
  password_confirmation: z.string().min(6, "Please confirm your password"),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;

function PasswordInputField({
  register,
  name,
  placeholder,
  show,
  onToggle,
  error,
}: {
  register: ReturnType<typeof useForm<PasswordInput>["register"]>;
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
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentImage = imagePreview || getImageUrl(user?.profile_image);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be less than 2MB", "error");
      return;
    }
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  }, [toast]);

  const removeImage = useCallback(() => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const onProfileSubmit = async (data: ProfileInput) => {
    setIsSavingProfile(true);
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
      };
      if (profileImage) {
        payload.profile_image = profileImage;
      }
      const res = await updateProfile(payload);
      if (res.status === "success") {
        updateUser(res.data);
        setProfileImage(null);
        setImagePreview(null);
        toast("Profile updated successfully", "success");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordInput) => {
    setIsSavingPassword(true);
    try {
      const res = await updateProfile({
        current_password: data.current_password,
        password: data.password,
      });
      if (res.status === "success") {
        resetPassword();
        toast("Password updated successfully", "success");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to update password", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const roleName = user?.roles?.[0]?.name || "User";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your personal information and settings.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/settings")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Settings</button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">My Profile</span>
        </nav>
      </div>

      {/* Profile Photo Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {currentImage ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-slate-200">
                <img src={currentImage} alt={user?.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-white/90 p-1.5 text-slate-700 hover:bg-white"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  {imagePreview && (
                    <button
                      onClick={removeImage}
                      className="rounded-lg bg-white/90 p-1.5 text-red-500 hover:bg-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-500"
              >
                <div className="text-center">
                  <Camera className="mx-auto h-6 w-6 mb-1" />
                  <span className="text-[10px] font-medium">Upload</span>
                </div>
              </button>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">@{user?.username}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <Shield className="h-3 w-3" />
                {roleName}
              </span>
              {user?.created_at && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
              {user?.last_login_at && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  Last login {new Date(user.last_login_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Section */}
      <form onSubmit={handleSubmitProfile(onProfileSubmit)}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Profile Information</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input {...registerProfile("name")} className="h-11 rounded-xl" placeholder="Enter your full name" />
                {profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Email Address
                </label>
                <Input {...registerProfile("email")} type="email" className="h-11 rounded-xl" placeholder="Enter your email" />
                {profileErrors.email && <p className="mt-1 text-xs text-red-500">{profileErrors.email.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Phone Number
                </label>
                <Input {...registerProfile("phone")} className="h-11 rounded-xl" placeholder="Enter your phone number" />
                {profileErrors.phone && <p className="mt-1 text-xs text-red-500">{profileErrors.phone.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Username
                </label>
                <Input value={user?.username || ""} className="h-11 rounded-xl bg-slate-50" disabled />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" className="h-11 px-6 border-slate-200 text-slate-600 font-semibold" onClick={() => router.push("/settings")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSavingProfile} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
              {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* Change Password Section */}
      <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Change Password</h2>
          <div className="space-y-4">
            <div className="max-w-md">
              <PasswordInputField
                register={registerPassword}
                name="current_password"
                placeholder="Enter current password"
                show={showCurrentPassword}
                onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                error={passwordErrors.current_password?.message}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordInputField
                register={registerPassword}
                name="password"
                placeholder="Enter new password"
                show={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
                error={passwordErrors.password?.message}
              />
              <PasswordInputField
                register={registerPassword}
                name="password_confirmation"
                placeholder="Confirm new password"
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
                error={passwordErrors.password_confirmation?.message}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" className="h-11 px-6 border-slate-200 text-slate-600 font-semibold" onClick={() => resetPassword()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSavingPassword} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
              {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Update Password
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
