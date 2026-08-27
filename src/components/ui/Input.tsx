import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

const baseClasses =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled:opacity-60 disabled:cursor-not-allowed";

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldWrapperProps & { children: React.ReactNode }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldWrapperProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, required, className, ...props }, ref) => {
    return (
      <Field label={label} hint={hint} error={error} required={required} className={className}>
        <input ref={ref} className={clsx(baseClasses, error && "border-danger-500")} {...props} />
      </Field>
    );
  },
);
Input.displayName = "Input";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldWrapperProps;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, required, className, children, ...props }, ref) => {
    return (
      <Field label={label} hint={hint} error={error} required={required} className={className}>
        <select ref={ref} className={clsx(baseClasses, "bg-background", error && "border-danger-500")} {...props}>
          {children}
        </select>
      </Field>
    );
  },
);
Select.displayName = "Select";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrapperProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, required, className, ...props }, ref) => {
    return (
      <Field label={label} hint={hint} error={error} required={required} className={className}>
        <textarea ref={ref} className={clsx(baseClasses, error && "border-danger-500")} {...props} />
      </Field>
    );
  },
);
Textarea.displayName = "Textarea";
