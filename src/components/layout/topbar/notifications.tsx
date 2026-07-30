"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  { id: "1", text: "New transaction received", time: "2 min ago" },
  { id: "2", text: "Payment of $500 successful", time: "1 hour ago" },
  { id: "3", text: "Monthly report is ready", time: "3 hours ago" },
];

export function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" />}>
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
        </div>
        {notifications.map((n) => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 px-4 py-3">
            <p className="text-sm text-foreground">{n.text}</p>
            <p className="text-xs text-muted-foreground">{n.time}</p>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
