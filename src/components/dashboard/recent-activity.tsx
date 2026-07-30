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
    paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    partial: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    unpaid: "bg-red-500/10 text-red-600 dark:text-red-400",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    cleared: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bounced: "bg-red-500/10 text-red-600 dark:text-red-400",
    cancelled: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${colors[status] || "bg-muted text-muted-foreground"}`}>
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
    <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            {tab.count > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
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
              <div key={i} className="animate-pulse rounded-lg bg-muted p-3">
                <div className="h-4 w-32 rounded bg-muted-foreground/20" />
                <div className="mt-2 h-3 w-20 rounded bg-muted-foreground/20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Recent Sales */}
            {activeTab === "sales" && (
              <div className="space-y-2">
                {recentSales.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No recent sales</p>
                ) : (
                  recentSales.map((sale) => (
                    <button
                      key={sale.id}
                      onClick={() => router.push(`/sales/${sale.id}`)}
                      className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{sale.reference_number}</p>
                          <StatusBadge status={sale.payment_status} />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{sale.customer_name} · {new Date(sale.sale_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(sale.total_amount)}</p>
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
                  <p className="py-8 text-center text-sm text-muted-foreground">No pending cheques</p>
                ) : (
                  pendingCheques.map((cheque) => (
                    <button
                      key={cheque.id}
                      onClick={() => router.push(`/cheques/${cheque.id}`)}
                      className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{cheque.cheque_number}</p>
                          <StatusBadge status="pending" />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{cheque.customer_name} · {cheque.bank_name}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(cheque.amount)}</p>
                        <p className="text-[11px] text-muted-foreground">{cheque.cheque_date}</p>
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
                  <p className="py-8 text-center text-sm text-muted-foreground">No outstanding dues</p>
                ) : (
                  topCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => router.push(`/customers/${customer.id}`)}
                      className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{customer.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{customer.code} · {customer.phone}</p>
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
