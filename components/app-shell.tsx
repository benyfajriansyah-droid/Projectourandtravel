"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Wallet,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/session";

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  roles?: Role[];
}

const ICONS = {
  dashboard: LayoutDashboard,
  trips: Map,
  wallet: Wallet,
  users: Users,
  settings: Settings,
} as const;

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  FINANCE: "Finance",
  SALES: "Sales",
  OPERASIONAL: "Operasional",
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-0.5 p-3">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                active ? "text-brand-600" : "text-neutral-400"
              )}
              aria-hidden
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({
  name,
  role,
  companyName,
  logoutAction,
}: {
  name: string;
  role: Role;
  companyName: string;
  logoutAction: () => void | Promise<void>;
}) {
  return (
    <div className="border-t border-neutral-200 p-3">
      <div className="mb-2 flex items-center gap-2.5 px-1">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-900">{name}</p>
          <p className="truncate text-xs text-neutral-500">
            {ROLE_LABEL[role]} &middot; {companyName}
          </p>
        </div>
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          <LogOut aria-hidden />
          Keluar
        </Button>
      </form>
    </div>
  );
}

export function AppShell({
  items,
  name,
  role,
  companyName,
  logoutAction,
  children,
}: {
  items: NavItem[];
  name: string;
  role: Role;
  companyName: string;
  logoutAction: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  // Tutup drawer saat pindah halaman (termasuk tombol back/forward browser).
  // Disetel saat render, bukan lewat efek, agar tidak memicu render berantai.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const brand = (
    <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-600">
        <Plane className="size-4 text-white" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-neutral-900">
          {companyName}
        </p>
        <p className="text-[11px] leading-tight text-neutral-400">
          Sistem Operasional
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-1 bg-neutral-50">
      {/* Sidebar desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
        {brand}
        <NavLinks items={items} pathname={pathname} />
        <UserFooter
          name={name}
          role={role}
          companyName={companyName}
          logoutAction={logoutAction}
        />
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-fade absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
            onClick={close}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="animate-slide-left relative flex h-full w-[17rem] max-w-[85vw] flex-col bg-white shadow-xl"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3.5 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Tutup menu"
            >
              <X className="size-4" aria-hidden />
            </button>
            {brand}
            <NavLinks items={items} pathname={pathname} onNavigate={close} />
            <UserFooter
              name={name}
              role={role}
              companyName={companyName}
              logoutAction={logoutAction}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-neutral-200 bg-white/90 px-3 py-2.5 backdrop-blur-sm lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
          >
            <Menu aria-hidden />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-brand-600">
              <Plane className="size-3.5 text-white" aria-hidden />
            </div>
            <span className="truncate text-sm font-semibold text-neutral-900">
              {companyName}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
