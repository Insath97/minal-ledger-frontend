import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back Sajibur Rahman
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor and control what happens with your money today for financial health.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 text-slate-400" />
          {today}
        </div>
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
