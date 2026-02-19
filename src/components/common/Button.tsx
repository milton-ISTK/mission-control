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
      default: "neu-button",
      accent: "neu-button-accent",
      ghost:
        "px-5 py-2.5 rounded-xl text-istk-textMuted hover:text-istk-text hover:bg-istk-surfaceLight transition-all duration-200",
      danger:
        "px-5 py-2.5 rounded-xl shadow-neu bg-istk-danger/20 text-istk-danger font-medium transition-all duration-200 hover:bg-istk-danger/30 active:shadow-neu-inset border border-istk-danger/30",
      sm: "neu-button-sm",
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
