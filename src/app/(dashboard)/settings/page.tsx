"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { User, ChevronRight, Activity, KeyRound, Database } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const allSettingsSections = [
  {
    title: "Profile",
    description: "Manage your personal information and avatar",
    icon: User,
    href: "/settings/profile",
    color: "bg-blue-50 text-blue-600",
    permission: [] as string[],
  },
  {
    title: "Database Backup",
    description: "Export and download database backups securely",
    icon: Database,
    href: "/settings/backup",
    color: "bg-violet-50 text-violet-600",
    permission: ["Database Export"],
  },
  {
    title: "Permissions",
    description: "Control what each role can access",
    icon: KeyRound,
    href: "/permissions",
    color: "bg-emerald-50 text-emerald-600",
    permission: ["Permission Index", "Permission List", "Permission Create", "Permission Update", "Permission Delete"],
  },
  {
    title: "Activity Logs",
    description: "View system activity logs and audit trails",
    icon: Activity,
    href: "/activity-logs",
    color: "bg-slate-50 text-slate-600",
    permission: ["ActivityLog Index", "ActivityLog Show"],
  },
];

export default function SettingsPage() {
  const { hasAnyPermission } = useAuthStore();

  const settingsSections = allSettingsSections.filter(
    (section) => section.permission.length === 0 || hasAnyPermission(section.permission)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${section.color}`}>
              <section.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                {section.title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">{section.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
