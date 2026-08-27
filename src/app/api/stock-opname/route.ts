import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { createOpnameSchema } from "@/lib/validations/opname";
import { buildDocCode } from "@/lib/doc-code";

export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const sessions = await prisma.stockOpname.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, _count: { select: { items: true } } },
    take: 100,
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const { user, error } = await requireApiAdmin();
  if (error) return error;

  try {
    const body = createOpnameSchema.parse(await req.json());

    const products = await prisma.product.findMany({
      where: { isActive: true, ...(body.categoryId ? { categoryId: body.categoryId } : {}) },
      orderBy: { name: "asc" },
    });

    if (products.length === 0) {
      return NextResponse.json({ error: "Tidak ada produk aktif untuk dihitung." }, { status: 400 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const countToday = await prisma.stockOpname.count({ where: { createdAt: { gte: todayStart } } });
    const code = buildDocCode("SO", countToday);

    const session = await prisma.stockOpname.create({
      data: {
        code,
        userId: user!.id,
        note: body.note,
        items: {
          create: products.map((p) => ({
            productId: p.id,
            systemQty: p.stock,
          })),
        },
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal membuat sesi stok opname.");
  }
}
