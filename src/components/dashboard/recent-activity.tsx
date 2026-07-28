"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, AlertTriangle, Users, ChevronRight } from "lucide-react";
import { getDashboardActivity, type RecentSale, type PendingCheque, type TopCustomer } from "@/lib/api/dashboard";
import { useToast } from "@/components/ui/toast";

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700",
    partial: "bg-amber-50 text-amber-700",
    unpaid: "bg-red-50 text-red-700",
    pending: "bg-amber-50 text-amber-700",
    cleared: "bg-emerald-50 text-emerald-700",
    bounced: "bg-red-50 text-red-700",
    cancelled: "bg-slate-50 text-slate-600",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${colors[status] || "bg-slate-50 text-slate-600"}`}>
      {status}
    </span>
  );
}

export function RecentActivity() {
  const router = useRouter();
  const { toast } = useToast();
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [pendingCheques, setPendingCheques] = useState<PendingCheque[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sales" | "cheques" | "customers">("sales");

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await getDashboardActivity();
        if (res.status === "success") {
          setRecentSales(res.data.recent_sales);
          setPendingCheques(res.data.pending_cheques);
          setTopCustomers(res.data.top_customers);
        }
      } catch {
        toast("Failed to load activity", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [toast]);

  const tabs = [
    { key: "sales" as const, label: "Recent Sales", icon: ShoppingCart, count: recentSales.length },
    { key: "cheques" as const, label: "Pending Cheques", icon: AlertTriangle, count: pendingCheques.length },
    { key: "customers" as const, label: "Top Customers", icon: Users, count: topCustomers.length },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-b-2 border-emerald-600 text-emerald-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            {tab.count > 0 && (
              <span className="ml-1 rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-slate-50 p-3">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-20 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Recent Sales */}
            {activeTab === "sales" && (
              <div className="space-y-2">
                {recentSales.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No recent sales</p>
                ) : (
                  recentSales.map((sale) => (
                    <button
                      key={sale.id}
                      onClick={() => router.push(`/sales/${sale.id}`)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">{sale.reference_number}</p>
                          <StatusBadge status={sale.payment_status} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{sale.customer_name} · {new Date(sale.sale_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(sale.total_amount)}</p>
                        {sale.due_amount > 0 && (
                          <p className="text-[11px] font-medium text-red-500">Due: {formatCurrency(sale.due_amount)}</p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Pending Cheques */}
            {activeTab === "cheques" && (
              <div className="space-y-2">
                {pendingCheques.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No pending cheques</p>
                ) : (
                  pendingCheques.map((cheque) => (
                    <button
                      key={cheque.id}
                      onClick={() => router.push(`/cheques/${cheque.id}`)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">{cheque.cheque_number}</p>
                          <StatusBadge status="pending" />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{cheque.customer_name} · {cheque.bank_name}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(cheque.amount)}</p>
                        <p className="text-[11px] text-slate-400">{cheque.cheque_date}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Top Customers */}
            {activeTab === "customers" && (
              <div className="space-y-2">
                {topCustomers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No outstanding dues</p>
                ) : (
                  topCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => router.push(`/customers/${customer.id}`)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{customer.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{customer.code} · {customer.phone}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-bold text-red-600">{formatCurrency(customer.outstanding_balance)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
