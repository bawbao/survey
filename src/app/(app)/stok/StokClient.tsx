"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNumber } from "@/lib/format";
import { Search, Boxes, ChevronRight, AlertTriangle } from "lucide-react";
import type { CategoryDTO, ProductDTO } from "@/types/models";

export function StokClient({ categories }: { categories: CategoryDTO[] }) {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (categoryId) params.set("categoryId", categoryId);
    if (lowStockOnly) params.set("lowStock", "true");
    const res = await fetch(`/api/products?${params.toString()}`);
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }, [search, categoryId, lowStockOnly]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 250);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const lowStockCount = products.filter((p) => Number(p.stock) <= Number(p.minStock)).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, SKU, atau barcode..."
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-48">
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <button
            onClick={() => setLowStockOnly((v) => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition ${
              lowStockOnly ? "bg-amber-500 border-amber-500 text-white" : "bg-surface border-border text-foreground"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Stok Menipis {lowStockCount > 0 && !lowStockOnly && `(${lowStockCount})`}
          </button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">Produk</th>
                <th className="text-left font-medium px-5 py-3">Kategori</th>
                <th className="text-right font-medium px-5 py-3">Stok Saat Ini</th>
                <th className="text-right font-medium px-5 py-3">Stok Minimum</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => {
                const low = Number(p.stock) <= Number(p.minStock);
                return (
                  <tr key={p.id} className="hover:bg-background/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted">{p.sku}</p>
                    </td>
                    <td className="px-5 py-3 text-muted">{p.category?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">
                      {formatNumber(p.stock)} {p.unit}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">
                      {formatNumber(p.minStock)} {p.unit}
                    </td>
                    <td className="px-5 py-3">
                      {low ? <Badge tone="amber">Menipis</Badge> : <Badge tone="brand">Aman</Badge>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/stok/${p.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                      >
                        Kartu Stok <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && products.length === 0 && (
          <EmptyState icon={Boxes} title="Tidak ada produk" description="Coba ubah kata kunci atau filter pencarian." />
        )}
        {loading && <div className="px-5 py-8 text-center text-sm text-muted">Memuat data...</div>}
      </Card>
    </div>
  );
}
