"use client";

import { useActionState, useEffect, useRef } from "react";
import { Save } from "lucide-react";
import { updateSettings, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { CompanyProfile } from "@/lib/settings";

const initialState: FormState = {};

export function SettingsForm({ profile }: { profile: CompanyProfile }) {
  const [state, formAction, isPending] = useActionState(
    updateSettings,
    initialState
  );
  const { toast } = useToast();
  const notified = useRef<FormState | null>(null);

  useEffect(() => {
    if (state === notified.current) return;
    if (state.success) {
      notified.current = state;
      toast("Pengaturan perusahaan tersimpan.");
    } else if (state.error) {
      notified.current = state;
      toast(state.error, "error");
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="companyName">Nama Perusahaan / Travel</Label>
          <Input
            id="companyName"
            name="companyName"
            defaultValue={profile.companyName}
            placeholder="PT Nusantara Travel"
            required
          />
          <p className="text-xs text-neutral-400">
            Tampil di sidebar, kwitansi, dan manifest peserta.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Telepon</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={profile.phone ?? ""}
            placeholder="0812-3456-7890"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={profile.email ?? ""}
            placeholder="halo@travelku.id"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website">Website / Instagram</Label>
          <Input
            id="website"
            name="website"
            defaultValue={profile.website ?? ""}
            placeholder="@travelku.id"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="footerNote">Catatan Kaki Kwitansi</Label>
          <Input
            id="footerNote"
            name="footerNote"
            defaultValue={profile.footerNote ?? ""}
            placeholder="Terima kasih atas kepercayaan Anda"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Alamat</Label>
          <Textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={profile.address ?? ""}
            placeholder="Jl. Merdeka No. 10, Malang, Jawa Timur"
          />
        </div>
      </div>

      <Button type="submit" loading={isPending}>
        <Save aria-hidden />
        Simpan Pengaturan
      </Button>
    </form>
  );
}
