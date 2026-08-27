import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin, requireApiUser } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { productSchema } from "@/lib/validations/product";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiUser();
  if (error) return error;
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const body = productSchema.partial().parse(await req.json());
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...body,
        categoryId: body.categoryId === undefined ? undefined : body.categoryId || null,
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal mengubah produk.");
  }
}

// Nonaktifkan produk (soft-delete) supaya riwayat transaksi lama tetap utuh.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const product = await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json(product);
  } catch (err) {
    return handleApiError(err, "Gagal menonaktifkan produk.");
  }
}
