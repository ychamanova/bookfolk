import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const pageContainerVariants = cva("flex flex-1 justify-center px-4 py-16", {
  variants: {
    align: {
      top: "",
      center: "items-center",
    },
  },
  defaultVariants: { align: "top" },
});

const widths = {
  sm: "max-w-sm", // single-purpose forms (sign in, verify email)
  md: "max-w-md", // account-style cards
  lg: "max-w-lg", // lists and detail pages
} as const;

function PageContainer({
  className,
  align,
  width = "lg",
  children,
  ...props
}: Omit<ComponentProps<"main">, "children"> &
  VariantProps<typeof pageContainerVariants> & {
    width?: keyof typeof widths;
    children: React.ReactNode;
  }) {
  return (
    <main
      data-slot="page-container"
      className={cn(pageContainerVariants({ align }), className)}
      {...props}
    >
      <div className={cn("w-full", widths[width])}>{children}</div>
    </main>
  );
}

export { PageContainer, pageContainerVariants };
