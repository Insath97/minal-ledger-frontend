import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeftRight } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="View and manage all your financial transactions."
      />
      <EmptyState
        title="No Transactions Yet"
        description="Your transaction history will appear here once you start making transactions."
        icon={<ArrowLeftRight className="h-7 w-7 text-slate-400" />}
      />
    </div>
  );
}
