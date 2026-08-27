import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiUser();
  if (error) return error;
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      items: { include: { product: true } },
    },
  });
  if (!sale) return NextResponse.json({ error: "Penjualan tidak ditemukan." }, { status: 404 });
  return NextResponse.json(sale);
}
