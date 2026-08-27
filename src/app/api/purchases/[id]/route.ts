import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin, requireApiUser } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiUser();
  if (error) return error;
  const { id } = await params;

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      user: { select: { name: true } },
      items: { include: { product: true } },
    },
  });
  if (!purchase) return NextResponse.json({ error: "Pembelian tidak ditemukan." }, { status: 404 });
  return NextResponse.json(purchase);
}

class StockWouldGoNegativeError extends Error {}

// Hapus pembelian sekaligus membatalkan efeknya: stok yang tadinya
// bertambah dari pembelian ini dikurangi kembali, dan catatan kartu stok
// terkait ikut dihapus. Ditolak kalau stok sudah terpakai sejak saat itu
// (mis. sebagian sudah terjual) sehingga akan membuat stok jadi negatif.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!purchase) return NextResponse.json({ error: "Pembelian tidak ditemukan." }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      for (const item of purchase.items) {
        const newStock = Number(item.product.stock) - Number(item.qty);
        if (newStock < 0) {
          throw new StockWouldGoNegativeError(
            `Tidak dapat menghapus: stok "${item.product.name}" akan menjadi minus karena sebagian sudah terpakai/terjual sejak pembelian ini dicatat.`,
          );
        }
      }
      for (const item of purchase.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.qty } } });
      }
      await tx.stockMovement.deleteMany({ where: { purchaseId: id } });
      await tx.purchase.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof StockWouldGoNegativeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return handleApiError(err, "Gagal menghapus pembelian.");
  }
}
