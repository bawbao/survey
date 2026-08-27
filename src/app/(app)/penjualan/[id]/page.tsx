import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Printer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { PaymentMethod } from "@/types/models";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
  OTHER: "Lainnya",
};

export default async function PenjualanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { user: true, items: { include: { product: true } } },
  });
  if (!sale) notFound();

  return (
    <div>
      <Link href="/penjualan" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-3">
        <ChevronLeft className="h-4 w-4" /> Kembali ke Penjualan
      </Link>
      <PageHeader
        title={sale.invoiceNo}
        description={`${formatDateTime(sale.date)} · Kasir ${sale.user.name}`}
        action={
          <LinkButton href={`/print/penjualan/${sale.id}`} variant="outline">
            <Printer className="h-4 w-4" /> Cetak Struk
          </LinkButton>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-xs text-muted mb-1">Pelanggan</p>
            <p className="font-medium text-foreground">{sale.customerName ?? "—"}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted mb-1">Pembayaran</p>
            <Badge tone="gray">{PAYMENT_LABEL[sale.paymentMethod]}</Badge>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted mb-1">Total</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(sale.total)}</p>
          </CardBody>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">Barang</th>
                <th className="text-right font-medium px-5 py-3">Jumlah</th>
                <th className="text-right font-medium px-5 py-3">Harga</th>
                <th className="text-right font-medium px-5 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{item.product.name}</p>
                    <p className="text-xs text-muted">{item.product.sku}</p>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {item.qty.toString()} {item.product.unit}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatCurrency(item.sellPrice)}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-border space-y-1.5 text-sm max-w-xs ml-auto">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Diskon</span>
            <span>- {formatCurrency(sale.discount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-1.5 border-t border-border">
            <span>Total</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
