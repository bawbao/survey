"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Search, Truck, ChevronRight, Trash2 } from "lucide-react";
import type { PurchaseDTO } from "@/types/models";

export function PembelianClient() {
  const [purchases, setPurchases] = useState<PurchaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    const res = await fetch(`/api/purchases?${params.toString()}`);
    if (res.ok) setPurchases(await res.json());
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchPurchases, 250);
    return () => clearTimeout(t);
  }, [fetchPurchases]);

  async function handleDelete(purchase: PurchaseDTO) {
    if (
      !confirm(
        `Hapus pembelian "${purchase.invoiceNo}"? Stok yang tadinya bertambah dari transaksi ini akan dikurangi kembali. Tindakan ini tidak bisa dibatalkan.`,
      )
    )
      return;

    setError(null);
    const res = await fetch(`/api/purchases/${purchase.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Gagal menghapus pembelian.");
      return;
    }
    fetchPurchases();
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
            placeholder="Cari no. invoice atau supplier..."
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
                <th className="text-left font-medium px-5 py-3">Supplier</th>
                <th className="text-left font-medium px-5 py-3">Dicatat Oleh</th>
                <th className="text-right font-medium px-5 py-3">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-background/60">
                  <td className="px-5 py-3 font-medium text-foreground">{p.invoiceNo}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{formatDateTime(p.date)}</td>
                  <td className="px-5 py-3 text-muted">{p.supplier?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{p.user.name}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatCurrency(p.total)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/pembelian/${p.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                      >
                        Detail <ChevronRight className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        title="Hapus"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-danger-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && purchases.length === 0 && (
          <EmptyState icon={Truck} title="Belum ada pembelian" description="Catat pembelian pertama dari tombol di atas." />
        )}
        {loading && <div className="px-5 py-8 text-center text-sm text-muted">Memuat data...</div>}
      </Card>
    </div>
  );
}
