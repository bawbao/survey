"use client";

import { Input } from "@/components/ui/Input";

export interface Period {
  from: string;
  to: string;
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function presetPeriod(preset: "today" | "week" | "month" | "lastMonth"): Period {
  const now = new Date();
  if (preset === "today") {
    return { from: toISO(now), to: toISO(now) };
  }
  if (preset === "week") {
    const from = new Date(now);
    from.setDate(now.getDate() - 6);
    return { from: toISO(from), to: toISO(now) };
  }
  if (preset === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toISO(from), to: toISO(now) };
  }
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0);
  return { from: toISO(from), to: toISO(to) };
}

export function PeriodFilter({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  const presets: { key: Parameters<typeof presetPeriod>[0]; label: string }[] = [
    { key: "today", label: "Hari Ini" },
    { key: "week", label: "7 Hari" },
    { key: "month", label: "Bulan Ini" },
    { key: "lastMonth", label: "Bulan Lalu" },
  ];

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex rounded-xl border border-border overflow-hidden text-sm shrink-0">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => onChange(presetPeriod(p.key))}
            className="px-3.5 py-2.5 font-medium bg-surface text-foreground hover:bg-brand-50 border-r border-border last:border-r-0"
          >
            {p.label}
          </button>
        ))}
      </div>
      <Input
        type="date"
        label="Dari"
        value={period.from}
        onChange={(e) => onChange({ ...period, from: e.target.value })}
        className="w-40"
      />
      <Input
        type="date"
        label="Sampai"
        value={period.to}
        onChange={(e) => onChange({ ...period, to: e.target.value })}
        className="w-40"
      />
    </div>
  );
}
