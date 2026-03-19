"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Calendar,
  MessageCircle,
} from "lucide-react";

const mobileNavItems = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      <div className="bg-card/95 backdrop-blur-xl border-t border-border/50 px-1">
        <div className="flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 relative transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive && "text-primary"
                  )}
                />
                <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
