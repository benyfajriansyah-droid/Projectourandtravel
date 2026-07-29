"use client";

import { useActionState, useRef, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { createUser, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABEL } from "@/lib/labels";

const initialState: FormState = {};
const ROLES = ["ADMIN", "FINANCE", "SALES", "OPERASIONAL"] as const;

const ROLE_HINT: Record<string, string> = {
  ADMIN: "Akses penuh ke semua modul",
  FINANCE: "Keuangan & kalkulator biaya",
  SALES: "Kelola peserta & booking",
  OPERASIONAL: "Lihat jadwal & manifest saja",
};

export function UserForm() {
  const [state, formAction, isPending] = useActionState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const handled = useRef<FormState | null>(null);

  useEffect(() => {
    if (state === handled.current || isPending) return;
    if (state.error) {
      handled.current = state;
      toast(state.error, "error");
    } else if (state.success) {
      handled.current = state;
      formRef.current?.reset();
      toast("Akun tim berhasil dibuat.");
    }
  }, [state, isPending, toast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" placeholder="Rina Sari" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="rina@travelku.id"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={6}
          placeholder="Minimal 6 karakter"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue="SALES">
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]} — {ROLE_HINT[r]}
            </option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit" loading={isPending}>
          <UserPlus aria-hidden />
          Tambah User
        </Button>
      </div>
    </form>
  );
}
