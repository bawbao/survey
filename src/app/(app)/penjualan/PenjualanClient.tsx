"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Search, ScanBarcode, ChevronRight, Trash2 } from "lucide-react";
import type { SaleDTO, PaymentMethod } from "@/types/models";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
  OTHER: "Lainnya",
};

export function PenjualanClient() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [sales, setSales] = useState<SaleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    const res = await fetch(`/api/sales?${params.toString()}`);
    if (res.ok) setSales(await res.json());
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchSales, 250);
    return () => clearTimeout(t);
  }, [fetchSales]);

  async function handleDelete(sale: SaleDTO) {
    if (
      !confirm(
        `Hapus penjualan "${sale.invoiceNo}"? Stok yang tadinya berkurang dari transaksi ini akan dikembalikan. Tindakan ini tidak bisa dibatalkan.`,
      )
    )
      return;

    setError(null);
    const res = await fetch(`/api/sales/${sale.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Gagal menghapus penjualan.");
      return;
    }
    fetchSales();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-danger-600 text-sm px-4 py-3">{error}</div>
      )}

      <Card className="p-4 sm:p-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. invoice atau nama pelanggan..."
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">No. Invoice</th>
                <th className="text-left font-medium px-5 py-3">Tanggal</th>
                <th className="text-left font-medium px-5 py-3">Pelanggan</th>
                <th className="text-left font-medium px-5 py-3">Kasir</th>
                <th className="text-left font-medium px-5 py-3">Bayar</th>
                <th className="text-right font-medium px-5 py-3">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-background/60">
                  <td className="px-5 py-3 font-medium text-foreground">{s.invoiceNo}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{formatDateTime(s.date)}</td>
                  <td className="px-5 py-3 text-muted">{s.customerName ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{s.user.name}</td>
                  <td className="px-5 py-3">
                    <Badge tone="gray">{PAYMENT_LABEL[s.paymentMethod]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatCurrency(s.total)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/penjualan/${s.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                      >
                        Detail <ChevronRight className="h-4 w-4" />
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(s)}
                          title="Hapus"
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-danger-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && sales.length === 0 && (
          <EmptyState icon={ScanBarcode} title="Belum ada penjualan" description="Mulai transaksi pertama dari tombol di atas." />
        )}
        {loading && <div className="px-5 py-8 text-center text-sm text-muted">Memuat data...</div>}
      </Card>
    </div>
  );
}
