import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { WalletGrid } from "@/components/dashboard/wallet-grid";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { SavingsPlan } from "@/components/dashboard/savings-plan";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { dashboardStats } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeHeader />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WalletGrid />
        <OverviewChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SavingsPlan />
        <RecentTransactions />
      </div>
    </div>
  );
}
