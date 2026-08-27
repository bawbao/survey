import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { BACKUP_VERSION } from "@/lib/backup";

// Backup penuh seluruh data aplikasi (kecuali cache/log), khusus Admin.
// Disajikan sebagai unduhan file JSON — cocok dipindahkan ke USB, Google
// Drive, atau disimpan sebagai cadangan sebelum ganti komputer.
export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const [
    users,
    categories,
    products,
    suppliers,
    purchases,
    purchaseItems,
    sales,
    saleItems,
    stockOpnames,
    stockOpnameItems,
    stockMovements,
    expenseCategories,
    expenses,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.category.findMany(),
    prisma.product.findMany(),
    prisma.supplier.findMany(),
    prisma.purchase.findMany(),
    prisma.purchaseItem.findMany(),
    prisma.sale.findMany(),
    prisma.saleItem.findMany(),
    prisma.stockOpname.findMany(),
    prisma.stockOpnameItem.findMany(),
    prisma.stockMovement.findMany(),
    prisma.expenseCategory.findMany(),
    prisma.expense.findMany(),
  ]);

  const payload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      users,
      categories,
      products,
      suppliers,
      purchases,
      purchaseItems,
      sales,
      saleItems,
      stockOpnames,
      stockOpnameItems,
      stockMovements,
      expenseCategories,
      expenses,
    },
  };

  const filename = `backup-grosir-snack-${new Date().toISOString().slice(0, 10)}.json`;

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
