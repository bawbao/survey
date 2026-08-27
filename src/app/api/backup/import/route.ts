import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { BACKUP_VERSION } from "@/lib/backup";

// Skema longgar: kita percaya bentuknya sesuai hasil /api/backup/export,
// cukup pastikan tiap tabel ada sebagai array (isinya divalidasi oleh Prisma
// saat insert — data yang tidak cocok akan membuat transaksi gagal & batal semua).
const backupSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  data: z.object({
    users: z.array(z.record(z.string(), z.unknown())),
    categories: z.array(z.record(z.string(), z.unknown())),
    products: z.array(z.record(z.string(), z.unknown())),
    suppliers: z.array(z.record(z.string(), z.unknown())),
    purchases: z.array(z.record(z.string(), z.unknown())),
    purchaseItems: z.array(z.record(z.string(), z.unknown())),
    sales: z.array(z.record(z.string(), z.unknown())),
    saleItems: z.array(z.record(z.string(), z.unknown())),
    stockOpnames: z.array(z.record(z.string(), z.unknown())),
    stockOpnameItems: z.array(z.record(z.string(), z.unknown())),
    stockMovements: z.array(z.record(z.string(), z.unknown())),
    expenseCategories: z.array(z.record(z.string(), z.unknown())),
    expenses: z.array(z.record(z.string(), z.unknown())),
  }),
});

const DATE_FIELDS = ["date", "createdAt", "updatedAt", "completedAt", "exportedAt"];

// Ubah string tanggal hasil JSON kembali jadi Date, biarkan field lain apa adanya.
// Baliknya `any` dengan sengaja: bentuk tiap baris divalidasi oleh Prisma sendiri
// saat createMany (data yang tidak cocok membuat transaksi gagal & batal semua).
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- lihat catatan di atas
function reviveDates(row: Record<string, unknown>): any {
  const copy: Record<string, unknown> = { ...row };
  for (const key of DATE_FIELDS) {
    if (typeof copy[key] === "string") copy[key] = new Date(copy[key] as string);
  }
  return copy;
}

// PERINGATAN: mengganti SELURUH data aplikasi dengan isi file backup.
// Dipakai untuk pulihkan data lama atau pindah ke komputer baru — bukan
// untuk digabung dengan data yang sedang berjalan.
export async function POST(req: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  try {
    const body = backupSchema.parse(await req.json());

    if (body.version > BACKUP_VERSION) {
      return NextResponse.json(
        { error: "File backup ini dibuat dari versi aplikasi yang lebih baru dan tidak didukung." },
        { status: 400 },
      );
    }

    const d = body.data;

    await prisma.$transaction(
      async (tx) => {
        // Hapus data lama, urutan dari anak ke induk (menghindari pelanggaran foreign key).
        await tx.stockMovement.deleteMany();
        await tx.expense.deleteMany();
        await tx.expenseCategory.deleteMany();
        await tx.stockOpnameItem.deleteMany();
        await tx.stockOpname.deleteMany();
        await tx.saleItem.deleteMany();
        await tx.sale.deleteMany();
        await tx.purchaseItem.deleteMany();
        await tx.purchase.deleteMany();
        await tx.product.deleteMany();
        await tx.category.deleteMany();
        await tx.supplier.deleteMany();
        await tx.user.deleteMany();

        // Masukkan data dari backup, urutan dari induk ke anak.
        if (d.users.length) await tx.user.createMany({ data: d.users.map(reviveDates) });
        if (d.categories.length) await tx.category.createMany({ data: d.categories.map(reviveDates) });
        if (d.products.length) await tx.product.createMany({ data: d.products.map(reviveDates) });
        if (d.suppliers.length) await tx.supplier.createMany({ data: d.suppliers.map(reviveDates) });
        if (d.purchases.length) await tx.purchase.createMany({ data: d.purchases.map(reviveDates) });
        if (d.purchaseItems.length) await tx.purchaseItem.createMany({ data: d.purchaseItems.map(reviveDates) });
        if (d.sales.length) await tx.sale.createMany({ data: d.sales.map(reviveDates) });
        if (d.saleItems.length) await tx.saleItem.createMany({ data: d.saleItems.map(reviveDates) });
        if (d.stockOpnames.length) await tx.stockOpname.createMany({ data: d.stockOpnames.map(reviveDates) });
        if (d.stockOpnameItems.length)
          await tx.stockOpnameItem.createMany({ data: d.stockOpnameItems.map(reviveDates) });
        if (d.expenseCategories.length)
          await tx.expenseCategory.createMany({ data: d.expenseCategories.map(reviveDates) });
        if (d.expenses.length) await tx.expense.createMany({ data: d.expenses.map(reviveDates) });
        if (d.stockMovements.length) await tx.stockMovement.createMany({ data: d.stockMovements.map(reviveDates) });
      },
      { timeout: 30000 },
    );

    return NextResponse.json({
      ok: true,
      counts: {
        users: d.users.length,
        products: d.products.length,
        sales: d.sales.length,
        purchases: d.purchases.length,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "File backup tidak valid atau rusak." }, { status: 400 });
    }
    return handleApiError(err, "Gagal memulihkan data. Data saat ini tidak berubah.");
  }
}
