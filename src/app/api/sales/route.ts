import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { saleSchema } from "@/lib/validations/sale";
import { buildDocCode } from "@/lib/doc-code";
import type { Prisma } from "@/generated/prisma/client";

class InsufficientStockError extends Error {}

export async function GET(req: Request) {
  const { error } = await requireApiUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.SaleWhereInput = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(`${to}T23:59:59.999Z`);
  }
  if (q) {
    where.OR = [
      { invoiceNo: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
    ];
  }

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { date: "desc" },
    include: { user: { select: { name: true } }, _count: { select: { items: true } } },
    take: 200,
  });

  return NextResponse.json(sales);
}

export async function POST(req: Request) {
  const { user, error } = await requireApiUser();
  if (error) return error;

  try {
    const body = saleSchema.parse(await req.json());

    const merged = new Map<string, { qty: number; sellPrice: number }>();
    for (const item of body.items) {
      const existing = merged.get(item.productId);
      if (existing) {
        existing.qty += item.qty;
      } else {
        merged.set(item.productId, { qty: item.qty, sellPrice: item.sellPrice });
      }
    }

    const subtotal = [...merged.values()].reduce((sum, i) => sum + i.qty * i.sellPrice, 0);
    const total = Math.max(0, subtotal - body.discount);

    const sale = await prisma.$transaction(async (tx) => {
      // Validasi stok tersedia sebelum memproses transaksi.
      for (const [productId, i] of merged.entries()) {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new InsufficientStockError(`Produk tidak ditemukan.`);
        if (Number(product.stock) < i.qty) {
          throw new InsufficientStockError(`Stok "${product.name}" tidak cukup (tersedia ${product.stock} ${product.unit}).`);
        }
      }

      const prefix = "PJ";
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const countToday = await tx.sale.count({ where: { createdAt: { gte: todayStart } } });
      const invoiceNo = buildDocCode(prefix, countToday);

      const created = await tx.sale.create({
        data: {
          invoiceNo,
          customerName: body.customerName,
          userId: user!.id,
          subtotal,
          discount: body.discount,
          total,
          paymentMethod: body.paymentMethod,
          note: body.note,
          items: {
            create: [...merged.entries()].map(([productId, i]) => ({
              productId,
              qty: i.qty,
              sellPrice: i.sellPrice,
              subtotal: i.qty * i.sellPrice,
            })),
          },
        },
      });

      for (const [productId, i] of merged.entries()) {
        const product = await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: i.qty } },
        });
        await tx.stockMovement.create({
          data: {
            productId,
            type: "SALE",
            qty: -i.qty,
            balance: product.stock,
            saleId: created.id,
            userId: user!.id,
            note: `Penjualan ${invoiceNo}`,
          },
        });
      }

      return created;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    if (err instanceof InsufficientStockError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return handleApiError(err, "Gagal menyimpan penjualan.");
  }
}
