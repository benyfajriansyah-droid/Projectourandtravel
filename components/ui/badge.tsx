import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-700 ring-neutral-200",
        blue: "bg-brand-50 text-brand-700 ring-brand-200",
        green: "bg-green-50 text-green-700 ring-green-200",
        yellow: "bg-amber-50 text-amber-700 ring-amber-200",
        red: "bg-red-50 text-red-700 ring-red-200",
        purple: "bg-purple-50 text-purple-700 ring-purple-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const dotColors: Record<string, string> = {
  default: "bg-neutral-400",
  blue: "bg-brand-500",
  green: "bg-green-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            dotColors[variant ?? "default"]
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
