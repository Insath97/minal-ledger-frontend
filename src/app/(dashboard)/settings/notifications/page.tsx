"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const notificationSettings = [
  { id: "email-transactions", label: "Transaction alerts", description: "Get notified for every transaction", defaultOn: true },
  { id: "email-security", label: "Security alerts", description: "Important security notifications", defaultOn: true },
  { id: "email-marketing", label: "Marketing emails", description: "Tips, offers, and product updates", defaultOn: false },
  { id: "push-transactions", label: "Transaction alerts", description: "Push notifications for transactions", defaultOn: true },
  { id: "push-security", label: "Security alerts", description: "Push notifications for security events", defaultOn: true },
];

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(
    notificationSettings.reduce((acc, s) => ({ ...acc, [s.id]: s.defaultOn }), {} as Record<string, boolean>)
  );

  const toggle = (id: string) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <PageHeader
        title="Notification Preferences"
        description="Choose what notifications you receive and how."
      />

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="divide-y divide-slate-100 p-0">
          {notificationSettings.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{s.label}</p>
                <p className="text-xs text-slate-500">{s.description}</p>
              </div>
              <button
                onClick={() => toggle(s.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[s.id] ? "bg-emerald-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    settings[s.id] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
