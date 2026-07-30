"use client";

import { Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const messages = [
  { id: "1", text: "Your invoice #1042 is ready", time: "5 min ago" },
  { id: "2", text: "Team meeting at 3 PM", time: "1 hour ago" },
];

export function Messages() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" />}>
        <Mail className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Messages</p>
        </div>
        {messages.map((m) => (
          <DropdownMenuItem key={m.id} className="flex flex-col items-start gap-1 px-4 py-3">
            <p className="text-sm text-foreground">{m.text}</p>
            <p className="text-xs text-muted-foreground">{m.time}</p>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
