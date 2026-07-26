import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare } from "lucide-react";

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback"
        description="Share your feedback and suggestions to help us improve."
      />
      <EmptyState
        title="No Feedback Yet"
        description="Your feedback helps us build a better experience for you."
        icon={<MessageSquare className="h-7 w-7 text-slate-400" />}
      />
    </div>
  );
}
