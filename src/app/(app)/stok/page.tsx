import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { StokClient } from "./StokClient";

export default async function StokPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Stok" description="Pantau jumlah stok barang secara real-time." />
      <StokClient categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
