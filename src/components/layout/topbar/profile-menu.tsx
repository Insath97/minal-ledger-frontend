"use client";

import { useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { LogoutDialog } from "../sidebar/logout-dialog";

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<button className="flex items-center gap-2 rounded-full outline-none ring-emerald-500 focus:ring-2" />}>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-emerald-100 text-sm font-semibold text-emerald-700">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
          <div className="py-2 px-1.5">
            <DropdownMenuItem render={<Link href="/settings/profile" className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5" />}>
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5" />}>
              <Settings className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Settings</span>
            </DropdownMenuItem>
          </div>
          <div className="border-t border-slate-100 py-2 px-1.5">
            <DropdownMenuItem
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 focus:text-red-600"
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
