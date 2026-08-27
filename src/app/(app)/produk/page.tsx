import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProdukClient } from "./ProdukClient";

export default async function ProdukPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Produk" description="Kelola data barang dan kategori grosir." />
      <ProdukClient
        initialCategories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
