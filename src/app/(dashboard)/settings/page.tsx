import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { User, ChevronRight, Activity } from "lucide-react";

const settingsSections = [
  {
    title: "Profile",
    description: "Manage your personal information and avatar",
    icon: User,
    href: "/settings/profile",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Activity Logs",
    description: "View system activity logs and audit trails",
    icon: Activity,
    href: "/activity-logs",
    color: "bg-slate-50 text-slate-600",
  },
];

export default function SettingsPage() {
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
