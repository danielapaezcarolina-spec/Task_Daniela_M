"use client";

import { Bell, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas, empresas..."
            className="w-64 pl-9 bg-muted/50 border-0 rounded-xl focus-visible:ring-primary/30"
          />
        </div>

        {/* Quick add */}
        <Button size="sm" className="rounded-xl shadow-md shadow-primary/25 gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Tarea</span>
        </Button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* Avatar */}
        <Avatar className="h-9 w-9 ring-2 ring-violet-200">
          <AvatarFallback className="bg-violet-100 text-violet-700 font-semibold text-sm">
            CP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
