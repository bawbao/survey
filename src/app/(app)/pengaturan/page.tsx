import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { PengaturanClient } from "./PengaturanClient";

export default async function PengaturanPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="Pengaturan" description="Cadangkan atau pulihkan data aplikasi." />
      <PengaturanClient />
    </div>
  );
}
