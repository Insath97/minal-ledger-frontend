"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Sale Index"]}>
      {children}
    </PermissionGuard>
  );
}
