"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { BarcodeInput } from "@/components/scan/BarcodeInput";
import { TransactionCart, type CartLine } from "@/components/scan/TransactionCart";
import { formatCurrency } from "@/lib/format";
import type { ProductDTO, SupplierDTO } from "@/types/models";
import { SupplierQuickAddModal } from "./SupplierQuickAddModal";

export default function PembelianBaruPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then(setSuppliers);
  }, []);

  function addProduct(product: ProductDTO) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product, qty: 1, price: Number(product.buyPrice) }];
    });
  }

  const total = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  async function handleSubmit() {
    setError(null);
    if (lines.length === 0) {
      setError("Tambahkan minimal 1 barang.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplierId || null,
          note,
          items: lines.map((l) => ({ productId: l.product.id, qty: l.qty, buyPrice: l.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan pembelian.");
        return;
      }
      router.push(`/pembelian/${data.id}`);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link href="/pembelian" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-3">
        <ChevronLeft className="h-4 w-4" /> Kembali ke Pembelian
      </Link>
      <PageHeader title="Pembelian Baru" description="Scan barang yang datang dari supplier." />

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardBody>
              <BarcodeInput onAddProduct={addProduct} placeholder="Scan barcode barang yang dibeli..." />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Daftar Barang" />
            <TransactionCart
              lines={lines}
              priceLabel="Harga Beli"
              onUpdateQty={(id, qty) =>
                setLines((prev) => prev.map((l) => (l.product.id === id ? { ...l, qty: Math.max(1, qty) } : l)))
              }
              onUpdatePrice={(id, price) =>
                setLines((prev) => prev.map((l) => (l.product.id === id ? { ...l, price: Math.max(0, price) } : l)))
              }
              onRemove={(id) => setLines((prev) => prev.filter((l) => l.product.id !== id))}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Detail Pembelian" />
            <CardBody className="space-y-4">
              <div className="flex items-end gap-2">
                <Select label="Supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="flex-1">
                  <option value="">— Tanpa supplier —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <Button type="button" variant="outline" onClick={() => setSupplierModalOpen(true)} className="mb-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                label="Catatan"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Opsional"
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted">Total</span>
                <span className="text-2xl font-bold text-foreground">{formatCurrency(total)}</span>
              </div>
              <Button size="lg" className="w-full" onClick={handleSubmit} loading={saving} disabled={lines.length === 0}>
                Simpan Pembelian
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <SupplierQuickAddModal
        open={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        onCreated={(supplier) => {
          setSuppliers((prev) => [...prev, supplier].sort((a, b) => a.name.localeCompare(b.name)));
          setSupplierId(supplier.id);
        }}
      />
    </div>
  );
}
