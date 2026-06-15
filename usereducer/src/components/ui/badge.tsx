import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-zinc-900 text-white",
      secondary: "bg-zinc-200 text-zinc-800",
      outline: "border border-zinc-300 text-zinc-700",
    },
  },
  defaultVariants: {
    variant: "secondary",
  },
});

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };