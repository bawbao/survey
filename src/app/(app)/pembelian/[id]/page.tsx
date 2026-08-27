import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Printer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default async function PembelianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { supplier: true, user: true, items: { include: { product: true } } },
  });
  if (!purchase) notFound();

  return (
    <div>
      <Link href="/pembelian" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-3">
        <ChevronLeft className="h-4 w-4" /> Kembali ke Pembelian
      </Link>
      <PageHeader
        title={purchase.invoiceNo}
        description={`${formatDateTime(purchase.date)} · Dicatat oleh ${purchase.user.name}`}
        action={
          <LinkButton href={`/print/pembelian/${purchase.id}`} variant="outline">
            <Printer className="h-4 w-4" /> Cetak
          </LinkButton>
        }
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-xs text-muted mb-1">Supplier</p>
            <p className="font-medium text-foreground">{purchase.supplier?.name ?? "—"}</p>
            {purchase.supplier?.phone && <p className="text-sm text-muted mt-0.5">{purchase.supplier.phone}</p>}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted mb-1">Total Pembelian</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(purchase.total)}</p>
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
                <th className="text-right font-medium px-5 py-3">Harga Beli</th>
                <th className="text-right font-medium px-5 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchase.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{item.product.name}</p>
                    <p className="text-xs text-muted">{item.product.sku}</p>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {item.qty.toString()} {item.product.unit}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatCurrency(item.buyPrice)}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {purchase.note && (
          <div className="px-5 py-4 border-t border-border text-sm">
            <span className="text-muted">Catatan: </span>
            {purchase.note}
          </div>
        )}
      </Card>
    </div>
  );
}
