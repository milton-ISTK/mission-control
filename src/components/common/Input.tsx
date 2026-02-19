"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-istk-textMuted">{label}</label>
        )}
        <input ref={ref} className={cn("glass-input", error && "border-istk-danger/50", className)} {...props} />
        {error && <span className="text-xs text-istk-danger">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-istk-textMuted">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn("glass-input min-h-[100px] resize-y", error && "border-istk-danger/50", className)}
          {...props}
        />
        {error && <span className="text-xs text-istk-danger">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-istk-textMuted">{label}</label>
        )}
        <select ref={ref} className={cn("glass-select", error && "border-istk-danger/50", className)} {...(props as any)}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-istk-danger">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Input;
