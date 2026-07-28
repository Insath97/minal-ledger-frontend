"use client";

import { PermissionGuard } from "@/components/shared/permission-guard";

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permissions={["User Index", "User List", "User Create", "User Update", "User Delete"]}>
      {children}
    </PermissionGuard>
  );
}
