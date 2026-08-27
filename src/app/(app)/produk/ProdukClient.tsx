"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Search, Plus, Pencil, PowerOff, Power, Tags, Package } from "lucide-react";
import type { CategoryDTO, ProductDTO } from "@/types/models";
import { ProductFormModal } from "./ProductFormModal";
import { CategoryManagerModal } from "./CategoryManagerModal";

export function ProdukClient({ initialCategories }: { initialCategories: CategoryDTO[] }) {
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "all">("active");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const refreshCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (categoryId) params.set("categoryId", categoryId);
    params.set("activeOnly", statusFilter === "active" ? "true" : "false");
    const res = await fetch(`/api/products?${params.toString()}`);
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }, [search, categoryId, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 250);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  async function toggleActive(product: ProductDTO) {
    const activating = !product.isActive;
    const confirmMsg = activating ? `Aktifkan kembali "${product.name}"?` : `Nonaktifkan "${product.name}"?`;
    if (!confirm(confirmMsg)) return;

    if (activating) {
      await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
    } else {
      await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    }
    fetchProducts();
  }

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
          <div className="flex rounded-xl border border-border overflow-hidden text-sm">
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3.5 py-2.5 font-medium ${statusFilter === "active" ? "bg-brand-600 text-white" : "bg-surface text-foreground"}`}
            >
              Aktif
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-2.5 font-medium ${statusFilter === "all" ? "bg-brand-600 text-white" : "bg-surface text-foreground"}`}
            >
              Semua
            </button>
          </div>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
            <Tags className="h-4 w-4" /> Kategori
          </Button>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Tambah Produk
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">Produk</th>
                <th className="text-left font-medium px-5 py-3">Kategori</th>
                <th className="text-right font-medium px-5 py-3">Harga Beli</th>
                <th className="text-right font-medium px-5 py-3">Harga Jual</th>
                <th className="text-right font-medium px-5 py-3">Stok</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => {
                const low = Number(p.stock) <= Number(p.minStock);
                return (
                  <tr key={p.id} className="hover:bg-background/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted">
                        {p.sku}
                        {p.barcode ? ` · ${p.barcode}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-muted">{p.category?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatCurrency(p.buyPrice)}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium">{formatCurrency(p.sellPrice)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatNumber(p.stock)} {p.unit}
                      {low && (
                        <Badge tone="amber" className="ml-2">
                          Menipis
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {p.isActive ? <Badge tone="brand">Aktif</Badge> : <Badge tone="gray">Nonaktif</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setFormOpen(true);
                          }}
                          title="Ubah"
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:bg-black/5"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(p)}
                          title={p.isActive ? "Nonaktifkan" : "Aktifkan"}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg hover:bg-black/5 ${p.isActive ? "text-danger-600" : "text-brand-600"}`}
                        >
                          {p.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && products.length === 0 && (
          <EmptyState
            icon={Package}
            title="Belum ada produk"
            description="Tambahkan produk pertama untuk mulai mencatat stok dan transaksi."
            action={
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Tambah Produk
              </Button>
            }
          />
        )}
        {loading && <div className="px-5 py-8 text-center text-sm text-muted">Memuat data...</div>}
      </Card>

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchProducts}
        categories={categories}
        product={editingProduct}
      />
      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onChanged={refreshCategories}
      />
    </div>
  );
}
