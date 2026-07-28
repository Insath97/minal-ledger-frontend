"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Dashboard"]}>
      {children}
    </PermissionGuard>
  );
}
