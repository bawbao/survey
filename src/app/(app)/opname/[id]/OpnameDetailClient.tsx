"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { BarcodeInput } from "@/components/scan/BarcodeInput";
import { formatNumber } from "@/lib/format";
import { CheckCircle2, Save } from "lucide-react";
import type { OpnameStatus, ProductDTO, StockOpnameItemDTO } from "@/types/models";

interface LocalItem {
  productId: string;
  product: StockOpnameItemDTO["product"];
  systemQty: number;
  actualQty: number | null;
}

export function OpnameDetailClient({
  opnameId,
  status,
  note,
  items,
}: {
  opnameId: string;
  status: OpnameStatus;
  note: string | null;
  items: StockOpnameItemDTO[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<LocalItem[]>(
    items.map((i) => ({
      productId: i.productId,
      product: i.product,
      systemQty: Number(i.systemQty),
      actualQty: i.actualQty === null ? null : Number(i.actualQty),
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  const productIds = useMemo(() => new Set(rows.map((r) => r.productId)), [rows]);

  function handleScan(product: ProductDTO) {
    if (!productIds.has(product.id)) {
      setError(`"${product.name}" tidak termasuk dalam sesi opname ini.`);
      return;
    }
    setError(null);
    setRows((prev) =>
      prev.map((r) => (r.productId === product.id ? { ...r, actualQty: (r.actualQty ?? 0) + 1 } : r)),
    );
  }

  function updateQty(productId: string, value: string) {
    const num = value === "" ? null : Math.max(0, Number(value));
    setRows((prev) => prev.map((r) => (r.productId === productId ? { ...r, actualQty: num } : r)));
  }

  async function saveProgress() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/stock-opname/${opnameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: rows.map((r) => ({ productId: r.productId, actualQty: r.actualQty })) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan progres.");
        return;
      }
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function complete() {
    if (!confirm("Selesaikan stok opname? Stok sistem akan disesuaikan dengan hasil hitung fisik dan tidak bisa diubah lagi.")) return;
    setError(null);
    setCompleting(true);
    try {
      await saveProgressSilently();
      const res = await fetch(`/api/stock-opname/${opnameId}/complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyelesaikan sesi.");
        return;
      }
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setCompleting(false);
    }
  }

  async function saveProgressSilently() {
    await fetch(`/api/stock-opname/${opnameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: rows.map((r) => ({ productId: r.productId, actualQty: r.actualQty })) }),
    });
  }

  const countedCount = rows.filter((r) => r.actualQty !== null).length;
  const diffCount = rows.filter((r) => r.actualQty !== null && r.actualQty !== r.systemQty).length;

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {note && <Alert tone="info">{note}</Alert>}

      {status === "DRAFT" && (
        <Card>
          <CardBody>
            <BarcodeInput onAddProduct={handleScan} placeholder="Scan barang untuk menambah hitungan +1..." />
            <p className="text-xs text-muted mt-2">
              Setiap scan menambah 1 hitungan fisik untuk barang tersebut. Atau ketik jumlah langsung di kolom &quot;Stok
              Aktual&quot;.
            </p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Daftar Barang"
          subtitle={`${countedCount} / ${rows.length} sudah dihitung · ${diffCount} ada selisih`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">Produk</th>
                <th className="text-right font-medium px-5 py-3">Stok Sistem</th>
                <th className="text-right font-medium px-5 py-3 w-32">Stok Aktual</th>
                <th className="text-right font-medium px-5 py-3">Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const diff = r.actualQty === null ? null : r.actualQty - r.systemQty;
                return (
                  <tr key={r.productId} className="hover:bg-background/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{r.product.name}</p>
                      <p className="text-xs text-muted">{r.product.sku}</p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">
                      {formatNumber(r.systemQty)} {r.product.unit}
                    </td>
                    <td className="px-5 py-3">
                      {status === "DRAFT" ? (
                        <input
                          type="number"
                          min={0}
                          value={r.actualQty ?? ""}
                          onChange={(e) => updateQty(r.productId, e.target.value)}
                          placeholder="—"
                          className="w-full text-right rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      ) : (
                        <p className="text-right tabular-nums">{formatNumber(r.actualQty ?? 0)}</p>
                      )}
                    </td>
                    <td
                      className={`px-5 py-3 text-right tabular-nums font-semibold ${
                        diff === null ? "text-muted" : diff === 0 ? "text-muted" : diff > 0 ? "text-brand-700" : "text-danger-600"
                      }`}
                    >
                      {diff === null ? "—" : `${diff > 0 ? "+" : ""}${formatNumber(diff)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {status === "DRAFT" && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={saveProgress} loading={saving}>
            <Save className="h-4 w-4" /> Simpan Progres
          </Button>
          <Button onClick={complete} loading={completing}>
            <CheckCircle2 className="h-4 w-4" /> Selesaikan Opname
          </Button>
        </div>
      )}
    </div>
  );
}
