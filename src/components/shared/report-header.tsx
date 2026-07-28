import { APP_NAME } from "@/lib/constants";

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  dateRange?: { from: string; to: string };
  extraInfo?: { label: string; value: string }[];
}

export function ReportHeader({ title, subtitle, dateRange, extraInfo }: ReportHeaderProps) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{APP_NAME}</h2>
            <p className="text-[10px] text-slate-500">Financial Management System</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">Generated on</p>
          <p className="text-xs font-semibold text-slate-700">{today}</p>
        </div>
      </div>

      <div className="border-t-2 border-emerald-600 pt-3">
        <h1 className="text-base font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {(dateRange || extraInfo) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
          {dateRange && (
            <span>Period: <span className="font-semibold">{dateRange.from} to {dateRange.to}</span></span>
          )}
          {extraInfo?.map((info) => (
            <span key={info.label}>{info.label}: <span className="font-semibold">{info.value}</span></span>
          ))}
        </div>
      )}
    </div>
  );
}
