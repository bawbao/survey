import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin, requireApiUser } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";

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

// Hapus penjualan sekaligus membatalkan efeknya: stok yang tadinya
// berkurang dari penjualan ini dikembalikan, dan catatan kartu stok terkait
// ikut dihapus. Khusus Admin — Kasir tidak bisa membatalkan transaksi.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const sale = await prisma.sale.findUnique({ where: { id }, include: { items: true } });
    if (!sale) return NextResponse.json({ error: "Penjualan tidak ditemukan." }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      for (const item of sale.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.qty } } });
      }
      await tx.stockMovement.deleteMany({ where: { saleId: id } });
      await tx.sale.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Gagal menghapus penjualan.");
  }
}
