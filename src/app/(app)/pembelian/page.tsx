import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { PembelianClient } from "./PembelianClient";

export default function PembelianPage() {
  return (
    <div>
      <PageHeader
        title="Pembelian"
        description="Catat barang masuk dari supplier."
        action={
          <LinkButton href="/pembelian/baru">
            <Plus className="h-4 w-4" /> Pembelian Baru
          </LinkButton>
        }
      />
      <PembelianClient />
    </div>
  );
}
