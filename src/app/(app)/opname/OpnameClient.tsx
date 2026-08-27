"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Select, Textarea } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { formatDateTime } from "@/lib/format";
import { Plus, ClipboardCheck, ChevronRight } from "lucide-react";
import type { CategoryDTO, StockOpnameDTO, OpnameStatus } from "@/types/models";

const STATUS_LABEL: Record<OpnameStatus, string> = { DRAFT: "Berjalan", COMPLETED: "Selesai" };
const STATUS_TONE: Record<OpnameStatus, "amber" | "brand"> = { DRAFT: "amber", COMPLETED: "brand" };

export function OpnameClient() {
  const router = useRouter();
  const [sessions, setSessions] = useState<StockOpnameDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function fetchSessions() {
    setLoading(true);
    const res = await fetch("/api/stock-opname");
    if (res.ok) setSessions(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchSessions();
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch("/api/stock-opname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: categoryId || null, note }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ?? "Gagal membuat sesi.");
      return;
    }
    router.push(`/opname/${data.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Sesi Opname Baru
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">Kode</th>
                <th className="text-left font-medium px-5 py-3">Tanggal</th>
                <th className="text-left font-medium px-5 py-3">Dibuat Oleh</th>
                <th className="text-right font-medium px-5 py-3">Jumlah Barang</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-background/60">
                  <td className="px-5 py-3 font-medium text-foreground">{s.code}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{formatDateTime(s.date)}</td>
                  <td className="px-5 py-3 text-muted">{s.user.name}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{s._count?.items ?? 0}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/opname/${s.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                    >
                      Buka <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && sessions.length === 0 && (
          <EmptyState
            icon={ClipboardCheck}
            title="Belum ada sesi stok opname"
            description="Mulai sesi baru untuk menghitung stok fisik gudang/toko."
          />
        )}
        {loading && <div className="px-5 py-8 text-center text-sm text-muted">Memuat data...</div>}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Sesi Opname Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Select
            label="Kategori"
            hint="Kosongkan untuk menghitung semua barang aktif"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— Semua kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Textarea label="Catatan" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opsional" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={creating}>
              Mulai Hitung
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
