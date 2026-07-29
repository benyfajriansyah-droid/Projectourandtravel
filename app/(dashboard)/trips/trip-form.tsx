"use client";

import { useActionState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { createTrip, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

const initialState: FormState = {};

export function TripForm() {
  const [state, formAction, isPending] = useActionState(createTrip, initialState);
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
      toast("Trip berhasil ditambahkan.");
    }
  }, [state, isPending, toast]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama Trip</Label>
        <Input
          id="name"
          name="name"
          placeholder="Open Trip Bromo 3D2N"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="destination">Destinasi</Label>
        <Input
          id="destination"
          name="destination"
          placeholder="Bromo, Jawa Timur"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="type">Jenis Trip</Label>
        <Select id="type" name="type" defaultValue="OPEN_TRIP">
          <option value="OPEN_TRIP">Open Trip</option>
          <option value="PRIVATE">Private / Custom</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="durationDays">Durasi (hari)</Label>
        <Input
          id="durationDays"
          name="durationDays"
          type="number"
          min={1}
          placeholder="3"
          required
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="description">Deskripsi (opsional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder="Highlight itinerary, fasilitas, atau catatan internal."
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" loading={isPending}>
          <Plus aria-hidden />
          Tambah Trip
        </Button>
      </div>
    </form>
  );
}
