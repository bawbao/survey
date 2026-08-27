"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime, formatNumber } from "@/lib/format";
import { History } from "lucide-react";
import type { StockMovementDTO, StockMovementType } from "@/types/models";

const TYPE_LABEL: Record<StockMovementType, string> = {
  PURCHASE: "Pembelian",
  SALE: "Penjualan",
  OPNAME_ADJUST: "Stok Opname",
  MANUAL: "Manual",
};

const TYPE_TONE: Record<StockMovementType, "brand" | "amber" | "red" | "gray"> = {
  PURCHASE: "brand",
  SALE: "gray",
  OPNAME_ADJUST: "amber",
  MANUAL: "gray",
};

export function StockLedger({ productId }: { productId: string }) {
  const [movements, setMovements] = useState<StockMovementDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/stock/movements?productId=${productId}`);
      if (res.ok) setMovements(await res.json());
      setLoading(false);
    })();
  }, [productId]);

  return (
    <Card className="overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">Kartu Stok</h2>
        <p className="text-sm text-muted mt-0.5">Riwayat keluar-masuk barang ini.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background text-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">Tanggal</th>
              <th className="text-left font-medium px-5 py-3">Jenis</th>
              <th className="text-right font-medium px-5 py-3">Perubahan</th>
              <th className="text-right font-medium px-5 py-3">Saldo</th>
              <th className="text-left font-medium px-5 py-3">Oleh</th>
              <th className="text-left font-medium px-5 py-3">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {movements.map((m) => {
              const qty = Number(m.qty);
              return (
                <tr key={m.id} className="hover:bg-background/60">
                  <td className="px-5 py-3 whitespace-nowrap">{formatDateTime(m.date)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={TYPE_TONE[m.type]}>{TYPE_LABEL[m.type]}</Badge>
                  </td>
                  <td className={`px-5 py-3 text-right tabular-nums font-semibold ${qty >= 0 ? "text-brand-700" : "text-danger-600"}`}>
                    {qty >= 0 ? "+" : ""}
                    {formatNumber(qty)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatNumber(m.balance)}</td>
                  <td className="px-5 py-3 text-muted">{m.user?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{m.note ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!loading && movements.length === 0 && (
        <EmptyState icon={History} title="Belum ada riwayat" description="Pergerakan stok akan muncul setelah ada transaksi." />
      )}
      {loading && <div className="px-5 py-8 text-center text-sm text-muted">Memuat data...</div>}
    </Card>
  );
}
