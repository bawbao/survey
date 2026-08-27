import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedInitialData } from "../src/lib/seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const { admin, supplier } = await seedInitialData(prisma);
  console.log("Seed selesai.");
  console.log(`Supplier contoh: ${supplier.name}`);
  console.log(`Login admin: admin@grosir.local / admin123`);
  console.log(`Login kasir: kasir@grosir.local / kasir123 (dibuat oleh ${admin.name})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
