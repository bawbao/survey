"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { CategoryDTO, ProductDTO } from "@/types/models";

interface FormState {
  sku: string;
  barcode: string;
  name: string;
  categoryId: string;
  unit: string;
  buyPrice: string;
  sellPrice: string;
  stock: string;
  minStock: string;
}

const emptyForm: FormState = {
  sku: "",
  barcode: "",
  name: "",
  categoryId: "",
  unit: "pcs",
  buyPrice: "0",
  sellPrice: "0",
  stock: "0",
  minStock: "0",
};

export function ProductFormModal({
  open,
  onClose,
  onSaved,
  categories,
  product,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: CategoryDTO[];
  product: ProductDTO | null;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (product) {
      setForm({
        sku: product.sku,
        barcode: product.barcode ?? "",
        name: product.name,
        categoryId: product.categoryId ?? "",
        unit: product.unit,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        stock: product.stock,
        minStock: product.minStock,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, product]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      ...form,
      categoryId: form.categoryId || null,
      buyPrice: Number(form.buyPrice),
      sellPrice: Number(form.sellPrice),
      stock: Number(form.stock),
      minStock: Number(form.minStock),
    };

    try {
      const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan produk.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={product ? "Ubah Produk" : "Tambah Produk"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <Input
          label="Nama Produk"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Keripik Singkong Balado 100g"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="SKU / Kode Internal"
            required
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="SNK-001"
          />
          <Input
            label="Barcode"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            placeholder="Scan atau isi manual"
            hint="Dipakai untuk scan barang"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Kategori"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">— Tanpa kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            label="Satuan"
            required
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="pcs, sachet, kaleng"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Harga Beli"
            type="number"
            min={0}
            required
            value={form.buyPrice}
            onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
          />
          <Input
            label="Harga Jual"
            type="number"
            min={0}
            required
            value={form.sellPrice}
            onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stok Awal"
            type="number"
            min={0}
            required
            disabled={!!product}
            hint={product ? "Ubah stok lewat Pembelian / Stok Opname" : undefined}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          <Input
            label="Stok Minimum"
            type="number"
            min={0}
            required
            value={form.minStock}
            onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            hint="Peringatan saat stok menipis"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
