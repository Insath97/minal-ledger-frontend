"use client";

import { MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { overviewData, totalEarnings } from "@/lib/mock-data";

export function OverviewChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-600">Earnings</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 outline-none">
            <option>This Year</option>
            <option>Last Year</option>
          </select>
          <button className="rounded p-1 text-slate-400 hover:bg-slate-50">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-emerald-50 p-3">
        <p className="text-xs text-emerald-700">Earnings</p>
        <p className="text-2xl font-bold text-emerald-800">
          ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={overviewData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Earnings"]}
            />
            <Bar
              dataKey="earnings"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
