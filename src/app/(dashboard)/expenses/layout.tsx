"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Expense Index"]}>
      {children}
    </PermissionGuard>
  );
}
