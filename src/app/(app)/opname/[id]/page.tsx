import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { OpnameDetailClient } from "./OpnameDetailClient";

export default async function OpnameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.stockOpname.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: true }, orderBy: { product: { name: "asc" } } },
    },
  });
  if (!session) notFound();

  return (
    <div>
      <Link href="/opname" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-3">
        <ChevronLeft className="h-4 w-4" /> Kembali ke Stok Opname
      </Link>
      <PageHeader
        title={session.code}
        description={`Dibuat oleh ${session.user.name}`}
        action={<Badge tone={session.status === "COMPLETED" ? "brand" : "amber"}>{session.status === "COMPLETED" ? "Selesai" : "Berjalan"}</Badge>}
      />
      <OpnameDetailClient
        opnameId={session.id}
        status={session.status}
        note={session.note}
        items={session.items.map((i) => ({
          id: i.id,
          opnameId: i.opnameId,
          productId: i.productId,
          product: {
            id: i.product.id,
            sku: i.product.sku,
            barcode: i.product.barcode,
            name: i.product.name,
            categoryId: i.product.categoryId,
            category: null,
            unit: i.product.unit,
            buyPrice: i.product.buyPrice.toString(),
            sellPrice: i.product.sellPrice.toString(),
            stock: i.product.stock.toString(),
            minStock: i.product.minStock.toString(),
            isActive: i.product.isActive,
          },
          systemQty: i.systemQty.toString(),
          actualQty: i.actualQty?.toString() ?? null,
          difference: i.difference?.toString() ?? null,
          note: i.note,
        }))}
      />
    </div>
  );
}
