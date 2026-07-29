"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function PermissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Permission Index"]}>
      {children}
    </PermissionGuard>
  );
}
