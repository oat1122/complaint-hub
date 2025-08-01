// This is a simple Button component for our UI

import { ButtonHTMLAttributes, ReactNode } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm font-medium",
        outline:
          "border border-primary-400 text-primary-700 bg-white hover:bg-primary-50",
        secondary: "bg-gray-700 text-white hover:bg-gray-800 shadow-md",
        success: "bg-green-500 text-white hover:bg-green-600 shadow-sm",
        ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        link: "text-primary-700 underline-offset-4 hover:underline",
        admin: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

const Button = ({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button, buttonVariants };
