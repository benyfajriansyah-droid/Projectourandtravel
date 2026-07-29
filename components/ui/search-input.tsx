"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Kotak pencarian yang menulis ke query string (`?q=`) dengan debounce. */
export function SearchInput({
  placeholder = "Cari...",
  paramName = "q",
  className,
}: {
  placeholder?: string;
  paramName?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(paramName) ?? "";
  const [value, setValue] = React.useState(urlValue);

  // Selaraskan input bila URL berubah dari luar (navigasi back/forward, klik
  // tautan). Disetel saat render agar tidak memicu render berantai.
  const [lastUrlValue, setLastUrlValue] = React.useState(urlValue);
  if (urlValue !== lastUrlValue) {
    setLastUrlValue(urlValue);
    setValue(urlValue);
  }

  const push = React.useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set(paramName, next);
      else params.delete(paramName);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, paramName]
  );

  React.useEffect(() => {
    if (value === urlValue) return;
    const timer = setTimeout(() => push(value), 300);
    return () => clearTimeout(timer);
  }, [value, urlValue, push]);

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-8 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          aria-label="Bersihkan pencarian"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}
