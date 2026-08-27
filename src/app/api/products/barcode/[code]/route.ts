import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { error } = await requireApiUser();
  if (error) return error;
  const { code } = await params;

  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ barcode: code }, { sku: code }],
    },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: `Barang dengan kode "${code}" tidak ditemukan.` }, { status: 404 });
  }
  return NextResponse.json(product);
}
