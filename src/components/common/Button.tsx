"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "accent" | "ghost" | "danger" | "sm";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", isLoading, children, disabled, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "glass-button",
      accent: "glass-button-accent",
      ghost:
        "px-5 py-2.5 rounded-xl text-istk-textMuted hover:text-istk-text hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200",
      danger:
        "px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-istk-danger hover:text-white border border-istk-danger/20 bg-[rgba(248,113,113,0.08)] hover:bg-[rgba(248,113,113,0.15)] backdrop-blur-sm",
      sm: "glass-button-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(
          variants[variant],
          isLoading && "opacity-60 cursor-not-allowed",
          disabled && "opacity-40 cursor-not-allowed",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
