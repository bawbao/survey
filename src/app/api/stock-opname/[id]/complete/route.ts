import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const session = await prisma.stockOpname.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!session) return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 404 });
    if (session.status !== "DRAFT") {
      return NextResponse.json({ error: "Sesi ini sudah selesai." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of session.items) {
        // Barang yang tidak diisi dianggap sesuai (tidak ada selisih).
        const actualQty = item.actualQty === null ? item.systemQty : item.actualQty;
        const difference = Number(actualQty) - Number(item.systemQty);

        if (item.actualQty === null) {
          await tx.stockOpnameItem.update({ where: { id: item.id }, data: { actualQty, difference: 0 } });
        }

        if (difference !== 0) {
          const product = await tx.product.update({
            where: { id: item.productId },
            data: { stock: actualQty },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: "OPNAME_ADJUST",
              qty: difference,
              balance: product.stock,
              opnameId: session.id,
              userId: user!.id,
              note: `Penyesuaian stok opname ${session.code}`,
            },
          });
        }
      }

      await tx.stockOpname.update({
        where: { id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Gagal menyelesaikan stok opname.");
  }
}
