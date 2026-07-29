import { requireSession } from "@/lib/auth";
import { getCompanyProfile } from "@/lib/settings";
import { logoutAction } from "@/app/login/actions";
import { AppShell, type NavItem } from "@/components/app-shell";
import { ToastProvider } from "@/components/ui/toast";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/trips", label: "Trip & Keberangkatan", icon: "trips" },
  { href: "/keuangan", label: "Keuangan", icon: "wallet", roles: ["ADMIN", "FINANCE"] },
  { href: "/users", label: "Tim & User", icon: "users", roles: ["ADMIN"] },
  { href: "/pengaturan", label: "Pengaturan", icon: "settings", roles: ["ADMIN"] },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const company = await getCompanyProfile();

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(session.role)
  );

  return (
    <ToastProvider>
      <AppShell
        items={items}
        name={session.name}
        role={session.role}
        companyName={company.companyName}
        logoutAction={logoutAction}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
