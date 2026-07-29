"use client";

import { useActionState, useEffect, useRef } from "react";
import { CalendarPlus } from "lucide-react";
import { createDeparture, type FormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

const initialState: FormState = {};

export function DepartureForm({ tripId }: { tripId: string }) {
  const [state, formAction, isPending] = useActionState(
    createDeparture,
    initialState
  );
  const { toast } = useToast();
  const handled = useRef<FormState | null>(null);

  useEffect(() => {
    if (state === handled.current || isPending || !state.error) return;
    handled.current = state;
    toast(state.error, "error");
  }, [state, isPending, toast]);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="tripId" value={tripId} />
      <div className="space-y-1.5">
        <Label htmlFor="departureDate">Tanggal Berangkat</Label>
        <Input id="departureDate" name="departureDate" type="date" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="returnDate">Tanggal Pulang</Label>
        <Input id="returnDate" name="returnDate" type="date" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="minPax">Min Peserta</Label>
        <Input
          id="minPax"
          name="minPax"
          type="number"
          min={1}
          placeholder="10"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="maxPax">Maks Peserta</Label>
        <Input
          id="maxPax"
          name="maxPax"
          type="number"
          min={1}
          placeholder="30"
          required
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit" loading={isPending}>
          <CalendarPlus aria-hidden />
          Tambah Keberangkatan
        </Button>
        <p className="mt-2 text-xs text-neutral-400">
          Harga jual ditentukan nanti di Kalkulator Estimasi Biaya, setelah total
          biaya trip diketahui.
        </p>
      </div>
    </form>
  );
}
