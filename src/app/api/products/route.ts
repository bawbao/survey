import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin, requireApiUser } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { productSchema } from "@/lib/validations/product";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const { error } = await requireApiUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId");
  const lowStockOnly = searchParams.get("lowStock") === "true";
  const activeOnly = searchParams.get("activeOnly") !== "false";

  const where: Prisma.ProductWhereInput = {};
  if (activeOnly) where.isActive = true;
  if (categoryId) where.categoryId = categoryId;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { barcode: { contains: q, mode: "insensitive" } },
    ];
  }

  let products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { name: "asc" },
  });

  if (lowStockOnly) {
    products = products.filter((p) => Number(p.stock) <= Number(p.minStock));
  }

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  try {
    const body = productSchema.parse(await req.json());
    const product = await prisma.product.create({
      data: {
        ...body,
        categoryId: body.categoryId || null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal menambah produk.");
  }
}
