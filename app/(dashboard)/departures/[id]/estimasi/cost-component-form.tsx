"use client";

import { useActionState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { addCostComponent, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { COST_CATEGORIES, COST_UNITS } from "@/lib/types";
import { COST_CATEGORY_LABEL, COST_UNIT_LABEL } from "@/lib/labels";

const initialState: FormState = {};

export function CostComponentForm({ departureId }: { departureId: string }) {
  const [state, formAction, isPending] = useActionState(
    addCostComponent,
    initialState
  );
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
      toast("Komponen biaya ditambahkan.");
    }
  }, [state, isPending, toast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <input type="hidden" name="departureId" value={departureId} />
      <div className="space-y-1.5">
        <Label htmlFor="category">Kategori</Label>
        <Select id="category" name="category" defaultValue="TRANSPORT">
          {COST_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {COST_CATEGORY_LABEL[c]}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama Komponen</Label>
        <Input id="name" name="name" placeholder="Sewa bus 30 seat" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="unit">Satuan</Label>
        <Select id="unit" name="unit" defaultValue="FLAT">
          {COST_UNITS.map((u) => (
            <option key={u} value={u}>
              {COST_UNIT_LABEL[u]}
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
          min={0}
          placeholder="3000000"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qty">Qty</Label>
        <Input
          id="qty"
          name="qty"
          type="number"
          min={1}
          defaultValue={1}
          required
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-5">
        <Button type="submit" loading={isPending}>
          <Plus aria-hidden />
          Tambah Komponen Biaya
        </Button>
      </div>
    </form>
  );
}
