"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Customer Index", "Customer List", "Customer Create", "Customer Update", "Customer Delete"]}>
      {children}
    </PermissionGuard>
  );
}
