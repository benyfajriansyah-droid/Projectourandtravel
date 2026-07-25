"use client";

import { useActionState, useRef, useEffect } from "react";
import { createPayment, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TRANSACTION_TYPES } from "@/lib/types";
import { TRANSACTION_TYPE_LABEL } from "@/lib/labels";

const initialState: FormState = {};

export function PaymentForm({
  departures,
}: {
  departures: { id: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createPayment, initialState);
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
        <Label htmlFor="type">Jenis</Label>
        <Select id="type" name="type" defaultValue="INCOME">
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TRANSACTION_TYPE_LABEL[t]}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="amount">Nominal (Rp)</Label>
        <Input id="amount" name="amount" type="number" min={1} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="date">Tanggal</Label>
        <Input id="date" name="date" type="date" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="departureId">Terkait Keberangkatan (opsional)</Label>
        <Select id="departureId" name="departureId" defaultValue="">
          <option value="">— Umum / operasional —</option>
          {departures.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="category">Kategori (opsional)</Label>
        <Input id="category" name="category" placeholder="Pelunasan, Sewa bus, dll" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="method">Metode (opsional)</Label>
        <Input id="method" name="method" placeholder="Transfer, Tunai" />
      </div>
      <div className="col-span-2 space-y-1">
        <Label htmlFor="note">Catatan (opsional)</Label>
        <Input id="note" name="note" />
      </div>
      {state?.error && (
        <p className="col-span-2 text-sm text-red-600 sm:col-span-4">
          {state.error}
        </p>
      )}
      <div className="col-span-2 sm:col-span-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Catat Transaksi"}
        </Button>
      </div>
    </form>
  );
}
