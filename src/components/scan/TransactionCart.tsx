"use client";

import { Trash2, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";

export interface CartLine {
  product: { id: string; name: string; sku: string; unit: string; stock: string };
  qty: number;
  price: number;
}

export function TransactionCart({
  lines,
  priceLabel,
  onUpdateQty,
  onUpdatePrice,
  onRemove,
  checkStock = false,
}: {
  lines: CartLine[];
  priceLabel: string;
  onUpdateQty: (productId: string, qty: number) => void;
  onUpdatePrice: (productId: string, price: number) => void;
  onRemove: (productId: string) => void;
  checkStock?: boolean;
}) {
  if (lines.length === 0) {
    return (
      <EmptyState icon={ShoppingCart} title="Keranjang masih kosong" description="Scan atau cari barang di atas untuk menambahkan." />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-background text-muted text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left font-medium px-4 py-2.5">Barang</th>
            <th className="text-right font-medium px-4 py-2.5 w-28">Jumlah</th>
            <th className="text-right font-medium px-4 py-2.5 w-36">{priceLabel}</th>
            <th className="text-right font-medium px-4 py-2.5 w-36">Subtotal</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {lines.map((line) => {
            const exceedsStock = checkStock && line.qty > Number(line.product.stock);
            return (
              <tr key={line.product.id}>
                <td className="px-4 py-2.5">
                  <p className="font-medium text-foreground">{line.product.name}</p>
                  <p className="text-xs text-muted">
                    {line.product.sku}
                    {checkStock && ` · Stok: ${line.product.stock} ${line.product.unit}`}
                  </p>
                  {exceedsStock && <p className="text-xs text-danger-600 mt-0.5">Melebihi stok tersedia!</p>}
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    min={1}
                    value={line.qty}
                    onChange={(e) => onUpdateQty(line.product.id, Number(e.target.value))}
                    className={`w-full text-right rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 ${
                      exceedsStock ? "border-danger-500" : "border-border"
                    }`}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    min={0}
                    value={line.price}
                    onChange={(e) => onUpdatePrice(line.product.id, Number(e.target.value))}
                    className="w-full text-right rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums">{formatCurrency(line.qty * line.price)}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => onRemove(line.product.id)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-danger-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
