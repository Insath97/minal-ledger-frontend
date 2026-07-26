"use client";

import { ArrowLeft, Shield, Smartphone, Key, Monitor } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";

const activeSessions = [
  { id: "1", device: "MacBook Pro", browser: "Chrome", location: "Dhaka, Bangladesh", current: true },
  { id: "2", device: "iPhone 15", browser: "Safari", location: "Dhaka, Bangladesh", current: false },
];

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <PageHeader
        title="Security Settings"
        description="Manage your account security and authentication methods."
      />

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
              </div>
            </div>
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Key className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Login Sessions</h3>
                <p className="text-xs text-slate-500">Manage your active sessions across devices</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {session.device} - {session.browser}
                    </p>
                    <p className="text-xs text-slate-500">{session.location}</p>
                  </div>
                </div>
                {session.current ? (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Current
                  </Badge>
                ) : (
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
