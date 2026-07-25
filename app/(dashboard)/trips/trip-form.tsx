"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTrip, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: FormState = {};

export function TripForm() {
  const [state, formAction, isPending] = useActionState(createTrip, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error && !isPending) {
      formRef.current?.reset();
    }
  }, [state, isPending]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-2 gap-3">
      <div className="col-span-2 space-y-1 sm:col-span-1">
        <Label htmlFor="name">Nama Trip</Label>
        <Input id="name" name="name" placeholder="Open Trip Bromo 3D2N" required />
      </div>
      <div className="col-span-2 space-y-1 sm:col-span-1">
        <Label htmlFor="destination">Destinasi</Label>
        <Input id="destination" name="destination" placeholder="Bromo, Jawa Timur" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="type">Jenis Trip</Label>
        <Select id="type" name="type" defaultValue="OPEN_TRIP">
          <option value="OPEN_TRIP">Open Trip</option>
          <option value="PRIVATE">Private/Custom</option>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="durationDays">Durasi (hari)</Label>
        <Input id="durationDays" name="durationDays" type="number" min={1} required />
      </div>
      <div className="col-span-2 space-y-1">
        <Label htmlFor="description">Deskripsi (opsional)</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      {state?.error && (
        <p className="col-span-2 text-sm text-red-600">{state.error}</p>
      )}
      <div className="col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Tambah Trip"}
        </Button>
      </div>
    </form>
  );
}
