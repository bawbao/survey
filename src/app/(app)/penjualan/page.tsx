import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { PenjualanClient } from "./PenjualanClient";

export default function PenjualanPage() {
  return (
    <div>
      <PageHeader
        title="Penjualan"
        description="Riwayat transaksi kasir."
        action={
          <LinkButton href="/penjualan/baru">
            <Plus className="h-4 w-4" /> Penjualan Baru
          </LinkButton>
        }
      />
      <PenjualanClient />
    </div>
  );
}
