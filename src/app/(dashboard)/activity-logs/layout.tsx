"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function ActivityLogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["ActivityLog Index", "ActivityLog Show"]}>
      {children}
    </PermissionGuard>
  );
}
