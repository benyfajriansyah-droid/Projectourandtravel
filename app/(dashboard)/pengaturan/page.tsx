import { Building2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCompanyProfile } from "@/lib/settings";
import { PageHeader } from "@/components/ui/page-header";
import { CardSection } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export default async function PengaturanPage() {
  await requireRole(["ADMIN"]);
  const profile = await getCompanyProfile();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Identitas perusahaan yang tampil di aplikasi dan dokumen cetak."
      />

      <div className="max-w-3xl">
        <CardSection
          title="Profil Perusahaan"
          description="Data ini otomatis dipakai di kop kwitansi dan manifest peserta."
          action={
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-50">
              <Building2 className="size-4 text-brand-600" aria-hidden />
            </div>
          }
        >
          <SettingsForm profile={profile} />
        </CardSection>
      </div>
    </div>
  );
}
