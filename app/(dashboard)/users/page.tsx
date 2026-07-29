import { Trash2, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { CardSection } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  MobileCard,
  MobileField,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { formatDate } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/labels";
import { UserForm } from "./user-form";
import { updateUserRole, deleteUser } from "./actions";

const ROLES = ["ADMIN", "FINANCE", "SALES", "OPERASIONAL"] as const;

const ROLE_BADGE: Record<string, "blue" | "green" | "purple" | "default"> = {
  ADMIN: "blue",
  FINANCE: "green",
  SALES: "purple",
  OPERASIONAL: "default",
};

export default async function UsersPage() {
  const session = await requireRole(["ADMIN"]);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  const roleForm = (userId: string, current: string) => (
    <form
      action={updateUserRole}
      className="flex items-center justify-end gap-2"
    >
      <input type="hidden" name="id" value={userId} />
      <Select
        name="role"
        defaultValue={current}
        className="h-8 w-36 text-xs"
        aria-label="Role pengguna"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" variant="outline">
        Simpan
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tim & User"
        description="Kelola akun tim beserta hak aksesnya."
      />

      <CardSection
        title="Tambah User"
        description="Akun dibuat oleh admin — tidak ada pendaftaran mandiri."
      >
        <UserForm />
      </CardSection>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900">
          Daftar Akun{" "}
          <span className="tabular font-normal text-neutral-400">
            ({users.length})
          </span>
        </h2>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Role</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {u.name}
                      {u.id === session.userId && (
                        <Badge variant="blue">
                          <ShieldCheck className="size-3" aria-hidden />
                          Anda
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-neutral-600">{u.email}</TableCell>
                  <TableCell className="text-right">
                    {roleForm(u.id, u.role)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-neutral-500">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id !== session.userId && (
                      <ConfirmForm
                        action={deleteUser}
                        title={`Hapus akun ${u.name}?`}
                        description="Pengguna ini akan kehilangan akses ke aplikasi secara permanen."
                        triggerIcon={<Trash2 aria-hidden />}
                        triggerLabel=""
                      >
                        <input type="hidden" name="id" value={u.id} />
                      </ConfirmForm>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-2 md:hidden">
          {users.map((u) => (
            <MobileCard key={u.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-neutral-900">
                    {u.name}
                  </p>
                  <p className="truncate text-sm text-neutral-500">{u.email}</p>
                </div>
                <Badge variant={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
              </div>

              <div className="mt-2 divide-y divide-neutral-100 border-t border-neutral-100 pt-1">
                <MobileField label="Dibuat">{formatDate(u.createdAt)}</MobileField>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                {roleForm(u.id, u.role)}
                {u.id !== session.userId && (
                  <ConfirmForm
                    action={deleteUser}
                    title={`Hapus akun ${u.name}?`}
                    description="Pengguna ini akan kehilangan akses ke aplikasi secara permanen."
                    triggerIcon={<Trash2 aria-hidden />}
                    triggerLabel=""
                  >
                    <input type="hidden" name="id" value={u.id} />
                  </ConfirmForm>
                )}
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    </div>
  );
}
