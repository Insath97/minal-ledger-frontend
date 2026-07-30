"use client";

import { useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { LogoutDialog } from "../sidebar/logout-dialog";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace("/api/v1", "");

function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

export function ProfileMenu() {
  const { user } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const profileImageUrl = getImageUrl(user?.profile_image);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<button className="flex items-center gap-2 rounded-full outline-none ring-emerald-500 focus:ring-2" />}>
          <Avatar className="h-9 w-9">
            {profileImageUrl && (
              <AvatarImage src={profileImageUrl} alt={user?.name || "User"} />
            )}
            <AvatarFallback className="bg-emerald-500/10 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 overflow-hidden p-0">
          <div className="border-b border-border bg-accent/50 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
          <div className="py-2 px-1.5">
            <DropdownMenuItem render={<Link href="/settings/profile" className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5" />}>
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5" />}>
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Settings</span>
            </DropdownMenuItem>
          </div>
          <div className="border-t border-border py-2 px-1.5">
            <DropdownMenuItem
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 focus:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Log out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  );
}
