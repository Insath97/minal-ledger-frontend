"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Providers } from "@/components/layout/providers";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isCollapsed } = useSidebarStore();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const { isAuthenticated, fetchUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchUser();
      } catch {
        router.push("/login");
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [fetchUser, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Providers>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300",
            isMobile ? "ml-0" : isCollapsed ? "ml-[72px]" : "ml-[260px]"
          )}
        >
          <Topbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
