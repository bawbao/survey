import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatNumber, formatCurrency } from "@/lib/format";
import { StockLedger } from "./StockLedger";

export default async function KartuStokPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) notFound();

  const low = Number(product.stock) <= Number(product.minStock);

  return (
    <div>
      <Link href="/stok" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-3">
        <ChevronLeft className="h-4 w-4" /> Kembali ke Stok
      </Link>
      <PageHeader title={product.name} description={`${product.sku}${product.barcode ? ` · ${product.barcode}` : ""}`} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-xs text-muted mb-1">Stok Saat Ini</p>
            <p className="text-xl font-bold text-foreground">
              {formatNumber(product.stock)} <span className="text-sm font-normal text-muted">{product.unit}</span>
            </p>
            {low && (
              <Badge tone="amber" className="mt-2">
                Menipis
              </Badge>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted mb-1">Stok Minimum</p>
            <p className="text-xl font-bold text-foreground">
              {formatNumber(product.minStock)} <span className="text-sm font-normal text-muted">{product.unit}</span>
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted mb-1">Harga Beli</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(product.buyPrice)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted mb-1">Harga Jual</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(product.sellPrice)}</p>
          </CardBody>
        </Card>
      </div>

      <StockLedger productId={product.id} />
    </div>
  );
}
