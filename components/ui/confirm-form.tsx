"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SubmitButton({
  label,
  variant,
  onDone,
}: {
  label: string;
  variant: ButtonProps["variant"];
  onDone: () => void;
}) {
  const { pending } = useFormStatus();
  const wasPending = React.useRef(false);

  React.useEffect(() => {
    if (pending) wasPending.current = true;
    else if (wasPending.current) {
      wasPending.current = false;
      onDone();
    }
  }, [pending, onDone]);

  return (
    <Button type="submit" variant={variant} loading={pending} className="w-full sm:w-auto">
      {label}
    </Button>
  );
}

/**
 * Form aksi destruktif dengan dialog konfirmasi.
 * Input tersembunyi diletakkan sebagai `children` agar ikut terkirim.
 */
export function ConfirmForm({
  action,
  title,
  description,
  submitLabel = "Hapus",
  triggerLabel = "Hapus",
  triggerIcon,
  triggerVariant = "ghost",
  triggerSize = "sm",
  triggerClassName,
  confirmVariant = "destructive",
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  description?: string;
  submitLabel?: string;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
  confirmVariant?: ButtonProps["variant"];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <form action={action} className="contents">
      {children}
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={cn(
          triggerVariant === "ghost" && "text-red-600 hover:bg-red-50",
          triggerClassName
        )}
        onClick={() => setOpen(true)}
      >
        {triggerIcon}
        {triggerLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center">
          <div
            className="animate-fade absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
            onClick={close}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="animate-in-up relative w-full max-w-md rounded-t-2xl border border-neutral-200 bg-white p-5 shadow-xl sm:rounded-2xl"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Tutup"
            >
              <X className="size-4" aria-hidden />
            </button>

            <div className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="size-5 text-red-600" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <h2 className="text-base font-semibold text-neutral-900">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-neutral-600">{description}</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={close}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <SubmitButton
                label={submitLabel}
                variant={confirmVariant}
                onDone={close}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
