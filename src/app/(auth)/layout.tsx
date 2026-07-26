import type { Metadata } from "next";
import { Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Minal Ledger - Authentication",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding & Illustration */}
      <div className="hidden w-[55%] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 lg:flex lg:flex-col relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Decorative Blobs */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/10 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Minal Ledger</span>
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-start">
            {/* Dashboard Preview Card */}
            <div className="w-full max-w-lg mb-10">
              <div className="rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] p-8">
                {/* Mini Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20" />
                    <div>
                      <div className="h-3 w-24 rounded-full bg-white/25 mb-1.5" />
                      <div className="h-2 w-16 rounded-full bg-white/15" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/10" />
                    <div className="h-8 w-8 rounded-lg bg-white/10" />
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { w: "w-20", label: "w-14", accent: true },
                    { w: "w-16", label: "w-12", accent: false },
                    { w: "w-24", label: "w-16", accent: true },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl bg-white/[0.07] p-4 border border-white/[0.08]">
                      <div className={`h-2 rounded-full bg-white/20 ${s.w} mb-3`} />
                      <div className={`h-4 rounded-full ${s.accent ? "bg-emerald-300/50" : "bg-white/30"} ${s.label}`} />
                    </div>
                  ))}
                </div>

                {/* Mini Chart */}
                <div className="flex items-end gap-2 h-20">
                  {[40, 65, 45, 80, 55, 90, 70, 95, 60, 75, 85, 50].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i === 7 ? "rgba(52, 211, 153, 0.7)" : "rgba(255,255,255,0.15)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white leading-[1.15] tracking-tight mb-4">
              Your Financial<br />
              Command Center
            </h2>
            <p className="text-emerald-100/70 text-base leading-relaxed max-w-md">
              Monitor your account balance, track expenses, and manage savings all from one powerful admin dashboard.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {["Real-time Analytics", "Multi-Currency", "Smart Reports"].map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-medium text-white/90 border border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-8 text-emerald-200/50 text-xs">
            <span className="hover:text-emerald-200/80 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-emerald-200/80 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-emerald-200/80 cursor-pointer transition-colors">Help Center</span>
            <span className="ml-auto">© 2026 Minal Ledger</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center bg-slate-50/80 px-6 py-12 lg:w-[45%]">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/30">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Minal Ledger</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
