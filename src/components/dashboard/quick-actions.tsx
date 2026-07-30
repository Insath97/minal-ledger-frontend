import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="flex gap-3">
      <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
        <ArrowUpRight className="mr-2 h-4 w-4" />
        Send Money
      </Button>
      <Button variant="outline" className="border-border">
        <ArrowDownLeft className="mr-2 h-4 w-4 text-emerald-600" />
        Request Money
      </Button>
    </div>
  );
}
