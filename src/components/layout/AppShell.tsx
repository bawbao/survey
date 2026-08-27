"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, Package, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarContent({ pathname, role, onNavigate }: { pathname: string; role?: string; onNavigate?: () => void }) {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <Package className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <p className="font-bold text-foreground leading-tight">Grosir Snack</p>
          <p className="text-xs text-muted leading-tight">Kasir &amp; Stok</p>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                active ? "bg-brand-600 text-white shadow-sm" : "text-foreground/80 hover:bg-brand-50 hover:text-brand-800",
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = session?.user?.role;
  const roleLabel = role === "ADMIN" ? "Admin" : "Kasir";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-border bg-surface">
        <SidebarContent pathname={pathname} role={role} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-xl">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 no-print">
          <button
            onClick={() => setMobileOpen(true)}
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-black/5 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-tight">{session?.user?.name}</p>
              <p className="text-xs text-muted leading-tight">{roleLabel}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-semibold text-sm">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Keluar"
              className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted hover:text-danger-600 transition"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
