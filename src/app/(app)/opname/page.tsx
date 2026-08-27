import { PageHeader } from "@/components/layout/PageHeader";
import { OpnameClient } from "./OpnameClient";

export default function OpnamePage() {
  return (
    <div>
      <PageHeader title="Stok Opname" description="Hitung fisik barang dan sesuaikan dengan catatan sistem." />
      <OpnameClient />
    </div>
  );
}
