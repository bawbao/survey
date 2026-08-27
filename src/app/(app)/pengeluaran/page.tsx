import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { PengeluaranClient } from "./PengeluaranClient";

export default async function PengeluaranPage() {
  await requireAdmin();
  const categories = await prisma.expenseCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Pengeluaran" description="Catat biaya operasional di luar pembelian barang (gaji, sewa, transport, dll)." />
      <PengeluaranClient initialCategories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
