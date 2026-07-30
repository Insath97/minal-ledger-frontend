"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/ui/toast";
import { AuthBadge } from "@/components/auth/auth-badge";
import { AuthDivider } from "@/components/auth/auth-divider";
import { SecurityCard } from "@/components/auth/security-card";

const loginSchema = z.object({
  login: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await login(data.login, data.password);
      toast("Login successful! Redirecting...", "success");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as any;
      const status = error.response?.status;
      const responseData = error.response?.data;

      if (status === 422 && responseData?.errors) {
        // Handle server-side validation errors (422)
        Object.entries(responseData.errors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages;
          setError(field as keyof LoginInput, {
            type: "server",
            message: String(message),
          });
        });
      } else if (status === 401 || status === 403) {
        // Handle invalid credentials or account deactivation (401/403)
        const message = responseData?.message || "Invalid email/username or password";
        setError("login", {
          type: "server",
          message,
        });
        setError("password", {
          type: "server",
          message,
        });
      } else {
        // Fallback for network or general server errors
        const message = responseData?.message || error.message || "Login failed. Please try again.";
        toast(message, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AuthBadge label="ADMIN PORTAL" />

      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight leading-[1.15]">
          Welcome back
        </h1>
        <p className="mt-2.5 text-[15px] text-slate-500 leading-relaxed">
          Sign in to manage your financial dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="login" className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            Email or Username
          </label>
          <Input
            id="login"
            type="text"
            placeholder="Enter email or username"
            className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
            aria-invalid={!!errors.login}
            {...register("login")}
          />
          {errors.login && (
            <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-red-500" />
              {errors.login.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-12 rounded-xl border-slate-200 bg-white px-4 pr-12 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-red-500" />
              {errors.password.message}
            </p>
          )}
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="group relative h-12 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold shadow-lg shadow-emerald-600/25 transition-all overflow-hidden"
          disabled={isLoading}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </span>
        </Button>
      </form>

      <AuthDivider text="SECURED" />

      <SecurityCard
        title="Protected Area"
        description="End-to-end encrypted. All sessions are monitored for security."
        icon={ShieldCheck}
      />

      <p className="mt-8 text-center text-[13px] text-slate-500">
        Need access?{" "}
        <Link href="#" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
          Contact admin
        </Link>
      </p>
    </div>
  );
}
