"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function BanksLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Bank Index", "Bank List", "Bank Create", "Bank Update", "Bank Delete"]}>
      {children}
    </PermissionGuard>
  );
}
