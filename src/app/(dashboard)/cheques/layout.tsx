"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function ChequesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Cheque Index", "Cheque List", "Cheque Create", "Cheque Update Status", "Cheque Delete"]}>
      {children}
    </PermissionGuard>
  );
}
