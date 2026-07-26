import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Repeat } from "lucide-react";

export default function RecurringPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring"
        description="Set up and manage recurring payments and transactions."
      />
      <EmptyState
        title="No Recurring Payments"
        description="Set up recurring payments to automate your regular transactions."
        icon={<Repeat className="h-7 w-7 text-slate-400" />}
      />
    </div>
  );
}
