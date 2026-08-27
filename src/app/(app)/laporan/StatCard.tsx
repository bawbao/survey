import { Card, CardBody } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";

const TONE_CLASSES = {
  brand: "bg-brand-100 text-brand-700",
  amber: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-danger-600",
} as const;

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: keyof typeof TONE_CLASSES;
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3.5">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${TONE_CLASSES[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">{label}</p>
          <p className="text-lg font-bold text-foreground truncate">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}
