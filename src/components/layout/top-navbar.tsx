"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Calendar,
  Bell,
  MessageCircle,
  Search,
  Plus,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/recordatorios", label: "Recordatorios", icon: Bell },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function TopNavbar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-white/70 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* Top row */}
          <div className="flex h-14 items-center justify-between gap-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/25">
                TC
              </div>
              <span className="text-base font-bold text-foreground tracking-tight hidden sm:block">
                TaskConta
              </span>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                size="sm"
                className="rounded-full shadow-md shadow-primary/20 gap-1.5 h-8 px-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Nueva Tarea</span>
              </Button>

              <button className="relative p-2 rounded-full hover:bg-muted/60 transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-500 text-[8px] font-bold text-white ring-2 ring-white">
                  3
                </span>
              </button>

              <button className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-muted/60 transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700 font-semibold text-[10px]">
                    DP
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground hidden sm:block">
                  Daniela
                </span>
              </button>

              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-red-50 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-red-500" />
              </button>
            </div>
          </div>

          {/* Nav tabs - hidden on mobile (uses bottom nav instead) */}
          <nav className="hidden md:flex items-center gap-0.5 -mb-px overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
