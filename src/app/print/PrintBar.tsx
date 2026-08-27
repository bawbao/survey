"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PrintBar() {
  const router = useRouter();
  return (
    <div className="no-print max-w-2xl mx-auto flex items-center justify-between mb-4">
      <Button variant="ghost" onClick={() => router.back()}>
        <ChevronLeft className="h-4 w-4" /> Kembali
      </Button>
      <Button onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Cetak
      </Button>
    </div>
  );
}
