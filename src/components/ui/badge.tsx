import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
  {
    variants: {
      tone: {
        muted: "bg-subtle text-muted",
        live: "bg-open/20 text-open ring-1 ring-open/35",
        closed: "bg-closed/20 text-closed ring-1 ring-closed/35",
        warn: "bg-warn/20 text-warn ring-1 ring-warn/35",
        accent: "bg-accent/20 text-accent ring-1 ring-accent/35",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
