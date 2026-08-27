"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { CategoryDTO, ProductDTO } from "@/types/models";

/**
 * Form cepat untuk mendaftarkan barang baru langsung dari alur scan
 * (Pembelian, Penjualan, Stok Opname) tanpa pindah ke halaman Produk.
 * Hanya ditawarkan ke Admin — lihat pengecekan peran di BarcodeInput.
 */
export function QuickAddProductModal({
  open,
  onClose,
  onCreated,
  initialBarcode,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (product: ProductDTO) => void;
  initialBarcode: string;
}) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [buyPrice, setBuyPrice] = useState("0");
  const [sellPrice, setSellPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName("");
    setSku(initialBarcode);
    setBarcode(initialBarcode);
    setCategoryId("");
    setUnit("pcs");
    setBuyPrice("0");
    setSellPrice("0");
    setStock("0");
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, [open, initialBarcode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku,
          barcode,
          categoryId: categoryId || null,
          unit,
          buyPrice: Number(buyPrice),
          sellPrice: Number(sellPrice),
          stock: Number(stock),
          minStock: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mendaftarkan barang.");
        return;
      }
      onCreated(data);
      onClose();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Daftarkan Barang Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert tone="info">
          Barang dengan kode <span className="font-mono font-semibold">{initialBarcode}</span> belum terdaftar.
          Lengkapi datanya di bawah, lalu barang akan langsung ditambahkan ke daftar.
        </Alert>
        {error && <Alert tone="error">{error}</Alert>}

        <Input label="Nama Produk" required autoFocus value={name} onChange={(e) => setName(e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="SKU" required value={sku} onChange={(e) => setSku(e.target.value)} />
          <Input label="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Kategori" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— Tanpa kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input label="Satuan" required value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Harga Beli"
            type="number"
            min={0}
            required
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
          />
          <Input
            label="Harga Jual"
            type="number"
            min={0}
            required
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
          />
        </div>

        <Input
          label="Stok Awal"
          type="number"
          min={0}
          required
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          hint="Biarkan 0 jika stoknya akan bertambah lewat transaksi ini juga"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving}>
            Simpan &amp; Tambahkan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
