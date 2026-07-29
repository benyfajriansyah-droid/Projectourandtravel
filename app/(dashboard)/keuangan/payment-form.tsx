"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createPayment, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { TRANSACTION_TYPES } from "@/lib/types";
import { TRANSACTION_TYPE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

const initialState: FormState = {};

export interface DepartureOption {
  id: string;
  label: string;
  participants: { id: string; name: string }[];
}

export function PaymentForm({ departures }: { departures: DepartureOption[] }) {
  const [state, formAction, isPending] = useActionState(
    createPayment,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const handled = useRef<FormState | null>(null);
  const [departureId, setDepartureId] = useState("");

  const participants =
    departures.find((d) => d.id === departureId)?.participants ?? [];

  useEffect(() => {
    if (state === handled.current || isPending) return;
    if (state.error) {
      handled.current = state;
      toast(state.error, "error");
    } else if (state.success) {
      handled.current = state;
      formRef.current?.reset();
      toast("Transaksi tercatat.");
    }
  }, [state, isPending, toast]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="type">Jenis</Label>
        <Select
          id="type"
          name="type"
          defaultValue="INCOME"
          // Warna mengikuti pilihan lewat CSS murni, jadi tidak perlu state
          // dan ikut ter-reset otomatis saat form dibersihkan.
          className={cn(
            "font-medium",
            "has-[option[value=INCOME]:checked]:text-green-700",
            "has-[option[value=EXPENSE]:checked]:text-red-600"
          )}
        >
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TRANSACTION_TYPE_LABEL[t]}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="amount">Nominal (Rp)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          inputMode="numeric"
          min={1}
          placeholder="850000"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="date">Tanggal</Label>
        <Input id="date" name="date" type="date" defaultValue={today} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="departureId">Terkait Keberangkatan</Label>
        <Select
          id="departureId"
          name="departureId"
          value={departureId}
          onChange={(e) => setDepartureId(e.target.value)}
        >
          <option value="">— Umum / operasional —</option>
          {departures.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="participantId">Peserta Pembayar</Label>
        <Select
          id="participantId"
          name="participantId"
          defaultValue=""
          disabled={participants.length === 0}
        >
          <option value="">
            {departureId
              ? participants.length === 0
                ? "— Belum ada peserta —"
                : "— Tidak spesifik —"
              : "— Pilih keberangkatan dulu —"}
          </option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <p className="text-xs text-neutral-400">
          Namanya muncul di kwitansi sebagai penyetor.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category">Kategori</Label>
        <Input
          id="category"
          name="category"
          placeholder="Pelunasan, Sewa bus, dll"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="method">Metode</Label>
        <Input id="method" name="method" placeholder="Transfer, Tunai" />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="note">Catatan</Label>
        <Input id="note" name="note" placeholder="Opsional" />
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit" loading={isPending}>
          <Plus aria-hidden />
          Catat Transaksi
        </Button>
      </div>
    </form>
  );
}
