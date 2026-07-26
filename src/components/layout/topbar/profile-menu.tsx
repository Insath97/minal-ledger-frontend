"use client";

import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

export function ProfileMenu() {
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
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
        <div className="py-1.5">
          <DropdownMenuItem render={<Link href="/settings/profile" className="flex items-center gap-2.5 cursor-pointer mx-1.5 rounded-lg" />}>
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings/account" className="flex items-center gap-2.5 cursor-pointer mx-1.5 rounded-lg" />}>
            <Settings className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Account Settings</span>
          </DropdownMenuItem>
        </div>
        <div className="border-t border-slate-100 py-1.5">
          <DropdownMenuItem
            onClick={logout}
            className="flex items-center gap-2.5 cursor-pointer mx-1.5 rounded-lg text-red-600 hover:bg-red-50 focus:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
