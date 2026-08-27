import type { ReactNode } from "react";
import { clsx } from "clsx";

type Tone = "brand" | "amber" | "red" | "gray";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-700",
};

export function Badge({ children, tone = "gray", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
