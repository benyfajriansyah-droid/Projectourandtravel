import { Suspense } from "react";
import { Plane } from "lucide-react";
import { getCompanyProfile } from "@/lib/settings";
import { LoginForm } from "./login-form";

// Nama perusahaan dibaca dari database, jadi halaman ini tidak boleh
// diprerender saat build (database belum tentu terjangkau di build time).
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const company = await getCompanyProfile();

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-linear-to-b from-neutral-50 to-neutral-100 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/20">
            <Plane className="size-6 text-white" aria-hidden />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
            {company.companyName}
          </h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Sistem operasional internal tim
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Akun dibuat oleh admin. Hubungi admin bila lupa password.
        </p>
      </div>
    </div>
  );
}
