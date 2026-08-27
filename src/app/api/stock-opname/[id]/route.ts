import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { updateOpnameItemsSchema } from "@/lib/validations/opname";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  const session = await prisma.stockOpname.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      items: { include: { product: true }, orderBy: { product: { name: "asc" } } },
    },
  });
  if (!session) return NextResponse.json({ error: "Sesi stok opname tidak ditemukan." }, { status: 404 });
  return NextResponse.json(session);
}

// Simpan progres penghitungan (belum finalisasi stok).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const session = await prisma.stockOpname.findUnique({ where: { id } });
    if (!session) return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 404 });
    if (session.status !== "DRAFT") {
      return NextResponse.json({ error: "Sesi ini sudah selesai dan tidak bisa diubah." }, { status: 400 });
    }

    const body = updateOpnameItemsSchema.parse(await req.json());

    // Upsert per barang: barang yang sudah ada di sesi ini diupdate, barang yang
    // baru saja di-scan/didaftarkan (belum ada di snapshot awal sesi) ditambahkan
    // sebagai baris baru, dengan stok sistem diambil dari data produk saat ini.
    await prisma.$transaction(async (tx) => {
      for (const item of body.items) {
        const existing = await tx.stockOpnameItem.findUnique({
          where: { opnameId_productId: { opnameId: id, productId: item.productId } },
        });

        if (existing) {
          const difference = item.actualQty === null ? null : Number(item.actualQty) - Number(existing.systemQty);
          await tx.stockOpnameItem.update({
            where: { id: existing.id },
            data: { actualQty: item.actualQty, difference, note: item.note },
          });
        } else {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;
          const difference = item.actualQty === null ? null : Number(item.actualQty) - Number(product.stock);
          await tx.stockOpnameItem.create({
            data: {
              opnameId: id,
              productId: item.productId,
              systemQty: product.stock,
              actualQty: item.actualQty,
              difference,
              note: item.note,
            },
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal menyimpan progres.");
  }
}

// Batalkan sesi opname yang belum selesai.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const session = await prisma.stockOpname.findUnique({ where: { id } });
    if (!session) return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 404 });
    if (session.status !== "DRAFT") {
      return NextResponse.json({ error: "Sesi yang sudah selesai tidak dapat dihapus." }, { status: 400 });
    }
    await prisma.stockOpname.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Gagal membatalkan sesi.");
  }
}
