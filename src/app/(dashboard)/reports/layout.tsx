"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Reports", "Report Sales", "Report Customer Statement", "Report Cheques", "Report Payments", "Report Expense Summary", "Report Monthly Summary", "Report Dues Aging", "Report PnL"]}>
      {children}
    </PermissionGuard>
  );
}
