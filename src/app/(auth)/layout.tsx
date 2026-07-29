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
      <div className="hidden w-[45%] xl:w-[55%] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 lg:flex lg:flex-col relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Decorative Blobs */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/10 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-8 lg:p-10 xl:p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Wallet className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-white tracking-tight">Minal Ledger</span>
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-start">
            {/* Dashboard Preview Card */}
            <div className="w-full max-w-xs lg:max-w-md xl:max-w-lg mb-5 lg:mb-8">
              <div className="rounded-2xl lg:rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] p-4 lg:p-6 xl:p-8">
                {/* Mini Header */}
                <div className="flex items-center justify-between mb-3 lg:mb-5">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="h-7 w-7 lg:h-9 lg:w-9 rounded-full bg-white/20" />
                    <div>
                      <div className="h-2.5 w-16 lg:w-20 rounded-full bg-white/25 mb-1" />
                      <div className="h-2 w-12 lg:w-14 rounded-full bg-white/15" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 lg:gap-2">
                    <div className="h-5 w-5 lg:h-7 lg:w-7 rounded-lg bg-white/10" />
                    <div className="h-5 w-5 lg:h-7 lg:w-7 rounded-lg bg-white/10" />
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-1.5 lg:gap-3 mb-3 lg:mb-5">
                  {[
                    { w: "w-10 lg:w-16", label: "w-8 lg:w-12", accent: true },
                    { w: "w-8 lg:w-14", label: "w-7 lg:w-10", accent: false },
                    { w: "w-12 lg:w-20", label: "w-10 lg:w-14", accent: true },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl bg-white/[0.07] p-2.5 lg:p-3.5 border border-white/[0.08]">
                      <div className={`h-1.5 lg:h-2 rounded-full bg-white/20 ${s.w} mb-1.5 lg:mb-2.5`} />
                      <div className={`h-2.5 lg:h-3.5 rounded-full ${s.accent ? "bg-emerald-300/50" : "bg-white/30"} ${s.label}`} />
                    </div>
                  ))}
                </div>

                {/* Mini Chart */}
                <div className="flex items-end gap-1 lg:gap-1.5 h-10 lg:h-16">
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

            <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white leading-[1.15] tracking-tight mb-2 lg:mb-3">
              Your Financial<br />
              Command Center
            </h2>
            <p className="text-emerald-100/70 text-xs lg:text-sm xl:text-base leading-relaxed max-w-sm lg:max-w-md">
              Monitor your account balance, track expenses, and manage savings all from one powerful admin dashboard.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 lg:gap-2 mt-3 lg:mt-5">
              {["Real-time Analytics", "Sri Lankan Rupees", "Smart Reports"].map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-2.5 lg:px-3.5 py-1 lg:py-1.5 text-[9px] lg:text-[11px] font-medium text-white/90 border border-white/10">
                  <span className="h-1 w-1 lg:h-1.5 lg:w-1.5 rounded-full bg-emerald-300" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-emerald-200/40 mb-1">Designed & Developed by</p>
                <a href="https://www.linkedin.com/in/mohamed-insath-90a40724a" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-300 hover:text-emerald-200 transition-colors">Mohamed Insath</a>
                <div className="flex items-center gap-3 lg:gap-4 mt-2">
                  <a href="tel:+94750552243" className="flex items-center gap-1.5 text-[11px] lg:text-[12px] text-emerald-100/60 hover:text-emerald-100 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="whitespace-nowrap">+94 750 552 243</span>
                  </a>
                  <a href="https://wa.me/94750552243" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] lg:text-[12px] text-emerald-100/60 hover:text-emerald-100 transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
              <p className="text-xs text-emerald-200/40 whitespace-nowrap">&copy; {new Date().getFullYear()} Minal Ledger</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col bg-slate-50/80 px-5 py-8 sm:px-6 sm:py-12 lg:w-[45%] xl:w-[55%]">
        <div className="flex flex-1 flex-col items-center justify-center">
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

        {/* Mobile Footer */}
        <div className="mt-8 border-t border-slate-200/60 pt-6 lg:hidden">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Designed & Developed by</p>
            <a href="https://www.linkedin.com/in/mohamed-insath-90a40724a" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Mohamed Insath</a>
            <div className="mt-2 flex items-center justify-center gap-4">
              <a href="tel:+94750552243" className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                +94 750 552 243
              </a>
              <a href="https://wa.me/94750552243" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">&copy; {new Date().getFullYear()} Minal Ledger</p>
        </div>
      </div>
    </div>
  );
}
