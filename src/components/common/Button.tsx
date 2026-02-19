"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "accent" | "ghost" | "danger" | "sm" | "cyan" | "purple";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", isLoading, children, disabled, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "glass-button",
      accent: "glass-button-accent",
      ghost:
        "px-5 py-2.5 rounded-xl text-istk-textMuted hover:text-istk-text hover:bg-[rgba(255,107,0,0.04)] transition-all duration-300 border border-transparent hover:border-[rgba(255,107,0,0.08)] hover:shadow-[0_0_8px_rgba(255,107,0,0.06)]",
      danger:
        "px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-istk-danger hover:text-white border border-istk-danger/20 bg-[rgba(248,113,113,0.06)] hover:bg-[rgba(248,113,113,0.12)] hover:shadow-[0_0_12px_rgba(248,113,113,0.15)] backdrop-blur-sm",
      sm: "glass-button-sm",
      cyan:
        "px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-istk-cyan border border-[rgba(0,217,255,0.20)] bg-[rgba(0,217,255,0.06)] hover:bg-[rgba(0,217,255,0.12)] hover:border-[rgba(0,217,255,0.35)] hover:shadow-[0_0_12px_rgba(0,217,255,0.15),0_0_30px_rgba(0,217,255,0.06)] backdrop-blur-sm",
      purple:
        "px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-istk-purple border border-[rgba(178,75,243,0.20)] bg-[rgba(178,75,243,0.06)] hover:bg-[rgba(178,75,243,0.12)] hover:border-[rgba(178,75,243,0.35)] hover:shadow-[0_0_12px_rgba(178,75,243,0.15),0_0_30px_rgba(178,75,243,0.06)] backdrop-blur-sm",
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
            <span
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
            />
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
