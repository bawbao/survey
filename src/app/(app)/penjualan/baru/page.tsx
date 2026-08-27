"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { BarcodeInput } from "@/components/scan/BarcodeInput";
import { TransactionCart, type CartLine } from "@/components/scan/TransactionCart";
import { formatCurrency } from "@/lib/format";
import type { ProductDTO, PaymentMethod } from "@/types/models";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Tunai" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "QRIS", label: "QRIS" },
  { value: "OTHER", label: "Lainnya" },
];

export default function PenjualanBaruPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addProduct(product: ProductDTO) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product, qty: 1, price: Number(product.sellPrice) }];
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
  const discountValue = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountValue);
  const exceedsStock = lines.some((l) => l.qty > Number(l.product.stock));

  async function handleSubmit() {
    setError(null);
    if (lines.length === 0) {
      setError("Tambahkan minimal 1 barang.");
      return;
    }
    if (exceedsStock) {
      setError("Ada barang yang melebihi stok tersedia. Perbaiki jumlah terlebih dahulu.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          discount: discountValue,
          paymentMethod,
          items: lines.map((l) => ({ productId: l.product.id, qty: l.qty, sellPrice: l.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan penjualan.");
        return;
      }
      router.push(`/penjualan/${data.id}`);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link href="/penjualan" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-3">
        <ChevronLeft className="h-4 w-4" /> Kembali ke Penjualan
      </Link>
      <PageHeader title="Penjualan Baru" description="Scan barang yang dibeli pelanggan." />

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardBody>
              <BarcodeInput onAddProduct={addProduct} placeholder="Scan barcode barang..." />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Keranjang" />
            <TransactionCart
              lines={lines}
              priceLabel="Harga Jual"
              checkStock
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
            <CardHeader title="Detail Transaksi" />
            <CardBody className="space-y-4">
              <Input
                label="Nama Pelanggan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Opsional"
              />
              <Select
                label="Metode Pembayaran"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                {PAYMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Input
                label="Diskon (Rp)"
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Diskon</span>
                <span className="font-medium tabular-nums">- {formatCurrency(discountValue)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted">Total Bayar</span>
                <span className="text-2xl font-bold text-foreground">{formatCurrency(total)}</span>
              </div>
              <Button size="lg" className="w-full" onClick={handleSubmit} loading={saving} disabled={lines.length === 0}>
                Simpan &amp; Cetak Struk
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
