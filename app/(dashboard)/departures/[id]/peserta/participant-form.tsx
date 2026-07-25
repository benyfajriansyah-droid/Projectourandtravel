"use client";

import { useActionState, useRef, useEffect } from "react";
import { createParticipant, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: FormState = {};

export function ParticipantForm({ departureId }: { departureId: string }) {
  const [state, formAction, isPending] = useActionState(
    createParticipant,
    initialState
  );
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
      <input type="hidden" name="departureId" value={departureId} />
      <div className="space-y-1">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">No. Telepon</Label>
        <Input id="phone" name="phone" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="idNumber">No. KTP (opsional)</Label>
        <Input id="idNumber" name="idNumber" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="emergencyContact">Kontak Darurat (opsional)</Label>
        <Input id="emergencyContact" name="emergencyContact" />
      </div>
      {state?.error && (
        <p className="col-span-2 text-sm text-red-600 sm:col-span-4">
          {state.error}
        </p>
      )}
      <div className="col-span-2 sm:col-span-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Tambah Peserta"}
        </Button>
      </div>
    </form>
  );
}
