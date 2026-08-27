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

    await prisma.$transaction(
      body.items.map((item) =>
        prisma.stockOpnameItem.updateMany({
          where: { opnameId: id, productId: item.productId },
          data: {
            actualQty: item.actualQty,
            difference: item.actualQty === null ? null : undefined,
            note: item.note,
          },
        }),
      ),
    );

    // Hitung selisih terpisah karena butuh nilai systemQty tiap item.
    const items = await prisma.stockOpnameItem.findMany({ where: { opnameId: id } });
    await prisma.$transaction(
      items
        .filter((i) => i.actualQty !== null)
        .map((i) =>
          prisma.stockOpnameItem.update({
            where: { id: i.id },
            data: { difference: Number(i.actualQty) - Number(i.systemQty) },
          }),
        ),
    );

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
