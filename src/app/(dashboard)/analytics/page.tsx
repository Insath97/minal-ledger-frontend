import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track and analyze your financial data and trends."
      />
      <EmptyState
        title="Analytics Coming Soon"
        description="Detailed analytics and reporting features will be available here."
        icon={<BarChart3 className="h-7 w-7 text-slate-400" />}
      />
    </div>
  );
}
