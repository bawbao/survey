import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin, requireApiUser } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { purchaseSchema } from "@/lib/validations/purchase";
import { buildDocCode } from "@/lib/doc-code";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const { error } = await requireApiUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.PurchaseWhereInput = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(`${to}T23:59:59.999Z`);
  }
  if (q) {
    where.OR = [
      { invoiceNo: { contains: q, mode: "insensitive" } },
      { supplier: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const purchases = await prisma.purchase.findMany({
    where,
    orderBy: { date: "desc" },
    include: { supplier: true, user: { select: { name: true } }, _count: { select: { items: true } } },
    take: 200,
  });

  return NextResponse.json(purchases);
}

export async function POST(req: Request) {
  const { user, error } = await requireApiAdmin();
  if (error) return error;

  try {
    const body = purchaseSchema.parse(await req.json());

    // Gabungkan barang yang sama supaya saldo kartu stok berurutan dengan benar.
    const merged = new Map<string, { qty: number; buyPrice: number }>();
    for (const item of body.items) {
      const existing = merged.get(item.productId);
      if (existing) {
        existing.qty += item.qty;
      } else {
        merged.set(item.productId, { qty: item.qty, buyPrice: item.buyPrice });
      }
    }

    const total = [...merged.values()].reduce((sum, i) => sum + i.qty * i.buyPrice, 0);

    const purchase = await prisma.$transaction(async (tx) => {
      const prefix = "PB";
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const countToday = await tx.purchase.count({ where: { createdAt: { gte: todayStart } } });
      const invoiceNo = buildDocCode(prefix, countToday);

      const created = await tx.purchase.create({
        data: {
          invoiceNo,
          supplierId: body.supplierId || null,
          userId: user!.id,
          date: body.date ? new Date(body.date) : new Date(),
          total,
          note: body.note,
          items: {
            create: [...merged.entries()].map(([productId, i]) => ({
              productId,
              qty: i.qty,
              buyPrice: i.buyPrice,
              subtotal: i.qty * i.buyPrice,
            })),
          },
        },
      });

      for (const [productId, i] of merged.entries()) {
        const product = await tx.product.update({
          where: { id: productId },
          data: { stock: { increment: i.qty } },
        });
        await tx.stockMovement.create({
          data: {
            productId,
            type: "PURCHASE",
            qty: i.qty,
            balance: product.stock,
            purchaseId: created.id,
            userId: user!.id,
            note: `Pembelian ${invoiceNo}`,
          },
        });
      }

      return created;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal menyimpan pembelian.");
  }
}
