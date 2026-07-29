"use client";

import { useActionState } from "react";
import { createDeparture } from "../actions";
import type { FormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: FormState = {};

export function DepartureForm({ tripId }: { tripId: string }) {
  const [state, formAction, isPending] = useActionState(createDeparture, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <input type="hidden" name="tripId" value={tripId} />
      <div className="space-y-1">
        <Label htmlFor="departureDate">Tgl Berangkat</Label>
        <Input id="departureDate" name="departureDate" type="date" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="returnDate">Tgl Pulang</Label>
        <Input id="returnDate" name="returnDate" type="date" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="minPax">Min Peserta</Label>
        <Input id="minPax" name="minPax" type="number" min={1} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="maxPax">Maks Peserta</Label>
        <Input id="maxPax" name="maxPax" type="number" min={1} required />
      </div>
      {state?.error && (
        <p className="col-span-2 text-sm text-red-600 sm:col-span-3">
          {state.error}
        </p>
      )}
      <div className="col-span-2 sm:col-span-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Tambah Keberangkatan"}
        </Button>
      </div>
    </form>
  );
}
