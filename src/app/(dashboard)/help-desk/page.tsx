import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { HelpCircle } from "lucide-react";

export default function HelpDeskPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Help Desk"
        description="Get support and find answers to your questions."
      />
      <EmptyState
        title="How Can We Help?"
        description="Browse our knowledge base or contact our support team for assistance."
        icon={<HelpCircle className="h-7 w-7 text-slate-400" />}
      />
    </div>
  );
}
