import type { ReactNode } from "react";
import { clsx } from "clsx";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type Tone = "success" | "error" | "info" | "warning";

const toneConfig: Record<Tone, { classes: string; Icon: typeof Info }> = {
  success: { classes: "bg-emerald-50 border-emerald-200 text-emerald-800", Icon: CheckCircle2 },
  error: { classes: "bg-red-50 border-red-200 text-danger-600", Icon: AlertTriangle },
  info: { classes: "bg-sky-50 border-sky-200 text-sky-800", Icon: Info },
  warning: { classes: "bg-amber-50 border-amber-200 text-amber-800", Icon: AlertTriangle },
};

export function Alert({ tone = "info", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const { classes, Icon } = toneConfig[tone];
  return (
    <div className={clsx("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm", classes, className)}>
      <Icon className="h-4.5 w-4.5 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
