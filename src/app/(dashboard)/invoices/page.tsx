import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Create, send, and manage your invoices."
      />
      <EmptyState
        title="No Invoices"
        description="Create your first invoice to get started with billing."
        icon={<FileText className="h-7 w-7 text-slate-400" />}
      />
    </div>
  );
}
