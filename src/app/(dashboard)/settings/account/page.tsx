"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export default function AccountSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <PageHeader
        title="Account Settings"
        description="Manage your account preferences and security."
      />

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="space-y-6 p-4 sm:p-6">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Email Address</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Input defaultValue="sajib@minaledger.com" className="h-11 w-full sm:max-w-md" />
              <Button variant="outline" className="border-border self-start sm:self-auto">Change</Button>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Change Password</h3>
            <div className="max-w-md space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Current Password</label>
                <Input type="password" className="h-11" placeholder="Enter current password" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
                <Input type="password" className="h-11" placeholder="Enter new password" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm New Password</label>
                <Input type="password" className="h-11" placeholder="Confirm new password" />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Language & Timezone</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Language</label>
                <select className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none">
                  <option>English (US)</option>
                  <option>Bengali</option>
                  <option>Arabic</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Timezone</label>
                <select className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none">
                  <option>UTC+06:00 (Dhaka)</option>
                  <option>UTC+00:00 (London)</option>
                  <option>UTC-05:00 (New York)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleSave} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
