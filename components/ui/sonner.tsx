"use client";

import { cva, VariantProps } from "class-variance-authority";
import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { twMerge } from "tailwind-merge";

const toastVariant = cva("flex items-center", {
  variants: {
    variant: {
      success: "bg-green-500 text-white",
      destructive: "bg-red-500 text-white",
    },
    defaultVariants: {
      variant: "success",
    },
  },
});

const Toaster = ({
  variant,
  className,
  ...props
}: ToasterProps & VariantProps<typeof toastVariant>) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={twMerge(toastVariant({ variant, className }))}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
