import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200">
          <Icon className="size-5 text-neutral-400" aria-hidden />
        </div>
      )}
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
