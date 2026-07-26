import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CreditCard } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Track and manage all your active subscriptions."
      />
      <EmptyState
        title="No Subscriptions"
        description="Add your subscriptions to keep track of recurring charges."
        icon={<CreditCard className="h-7 w-7 text-slate-400" />}
      />
    </div>
  );
}
