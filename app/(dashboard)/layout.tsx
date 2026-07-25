import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/labels";

const NAV_ITEMS: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trips", label: "Trip & Keberangkatan" },
  { href: "/keuangan", label: "Keuangan", roles: ["ADMIN", "FINANCE"] },
  { href: "/users", label: "Tim & User", roles: ["ADMIN"] },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const items = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(session.role)
  );

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-4">
          <p className="text-sm font-semibold text-neutral-900">
            Tour &amp; Travel Ops
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-neutral-200 p-3">
          <p className="truncate text-sm font-medium text-neutral-900">
            {session.name}
          </p>
          <p className="mb-2 text-xs text-neutral-500">
            {ROLE_LABEL[session.role]}
          </p>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Keluar
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 bg-neutral-50 p-6">{children}</main>
    </div>
  );
}
