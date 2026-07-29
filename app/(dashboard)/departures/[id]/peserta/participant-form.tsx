"use client";

import { useActionState, useRef, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { createParticipant, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

const initialState: FormState = {};

export function ParticipantForm({ departureId }: { departureId: string }) {
  const [state, formAction, isPending] = useActionState(
    createParticipant,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
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
      // Fokus balik ke nama supaya input peserta berikutnya cepat.
      nameRef.current?.focus();
      toast("Peserta ditambahkan.");
    }
  }, [state, isPending, toast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <input type="hidden" name="departureId" value={departureId} />
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          ref={nameRef}
          id="name"
          name="name"
          placeholder="Budi Santoso"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">No. Telepon</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="0812-3456-7890"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="idNumber">No. KTP / Paspor</Label>
        <Input id="idNumber" name="idNumber" placeholder="Opsional" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="emergencyContact">Kontak Darurat</Label>
        <Input
          id="emergencyContact"
          name="emergencyContact"
          placeholder="Opsional"
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit" loading={isPending}>
          <UserPlus aria-hidden />
          Tambah Peserta
        </Button>
      </div>
    </form>
  );
}
