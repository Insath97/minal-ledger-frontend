"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function ChequesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["Cheque Index"]}>
      {children}
    </PermissionGuard>
  );
}
