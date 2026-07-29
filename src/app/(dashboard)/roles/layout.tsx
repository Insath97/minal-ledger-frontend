"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function RolesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Role Index"]}>
      {children}
    </PermissionGuard>
  );
}
