import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const { error } = await requireApiUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!productId) {
    return NextResponse.json({ error: "productId wajib diisi." }, { status: 400 });
  }

  const where: Prisma.StockMovementWhereInput = { productId };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(`${to}T23:59:59.999Z`);
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    orderBy: { date: "desc" },
    include: { user: { select: { name: true } } },
    take: 200,
  });

  return NextResponse.json(movements);
}
