import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva("border border-border bg-card text-card-foreground", {
  variants: {
    size: {
      default: "rounded-2xl p-8",
      compact: "rounded-xl p-5",
    },
  },
  defaultVariants: { size: "default" },
});

function Card({
  className,
  size,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ size }), className)}
      {...props}
    />
  );
}

export { Card, cardVariants };
