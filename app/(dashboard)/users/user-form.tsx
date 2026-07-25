"use client";

import { useActionState, useRef, useEffect } from "react";
import { createUser, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ROLE_LABEL } from "@/lib/labels";

const initialState: FormState = {};
const ROLES = ["ADMIN", "FINANCE", "SALES", "OPERASIONAL"] as const;

export function UserForm() {
  const [state, formAction, isPending] = useActionState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error && !isPending) {
      formRef.current?.reset();
    }
  }, [state, isPending]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      <div className="space-y-1">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue="SALES">
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </Select>
      </div>
      {state?.error && (
        <p className="col-span-2 text-sm text-red-600 sm:col-span-4">
          {state.error}
        </p>
      )}
      <div className="col-span-2 sm:col-span-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Tambah User"}
        </Button>
      </div>
    </form>
  );
}
