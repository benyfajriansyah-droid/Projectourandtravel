import { requireRole, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/labels";
import { UserForm } from "./user-form";
import { updateUserRole, deleteUser } from "./actions";

const ROLES = ["ADMIN", "FINANCE", "SALES", "OPERASIONAL"] as const;

export default async function UsersPage() {
  await requireRole(["ADMIN"]);
  const session = await requireSession();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Tim &amp; User</h1>
        <p className="text-sm text-neutral-500">
          Kelola akun tim dan role akses mereka.
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <h2 className="mb-3 text-sm font-medium text-neutral-700">
            Tambah User
          </h2>
          <UserForm />
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <form action={updateUserRole} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={u.id} />
                  <Select
                    name="role"
                    defaultValue={u.role}
                    className="h-8 w-32 text-xs"
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
              </TableCell>
              <TableCell>{formatDate(u.createdAt)}</TableCell>
              <TableCell>
                {u.id !== session.userId && (
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Hapus
                    </Button>
                  </form>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
