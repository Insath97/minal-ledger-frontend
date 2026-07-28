"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Payment Index", "Payment Create", "Payment Delete"]}>
      {children}
    </PermissionGuard>
  );
}
