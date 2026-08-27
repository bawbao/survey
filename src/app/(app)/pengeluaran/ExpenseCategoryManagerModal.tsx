"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pencil, Trash2, Check, X, Tags } from "lucide-react";
import type { ExpenseCategoryDTO } from "@/types/models";

export function ExpenseCategoryManagerModal({
  open,
  onClose,
  categories,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  categories: ExpenseCategoryDTO[];
  onChanged: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [busy, setBusy] = useState(false);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    setBusy(true);
    const res = await fetch("/api/expense-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Gagal menambah kategori.");
      return;
    }
    setNewName("");
    onChanged();
  }

  async function saveEdit(id: string) {
    if (!editingName.trim()) return;
    setError(null);
    const res = await fetch(`/api/expense-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal mengubah kategori.");
      return;
    }
    setEditingId(null);
    onChanged();
  }

  async function removeCategory(id: string) {
    if (!confirm("Hapus kategori ini?")) return;
    setError(null);
    const res = await fetch(`/api/expense-categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal menghapus kategori.");
      return;
    }
    onChanged();
  }

  return (
    <Modal open={open} onClose={onClose} title="Kelola Kategori Pengeluaran">
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <form onSubmit={addCategory} className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama kategori baru, mis. Internet"
            className="flex-1"
          />
          <Button type="submit" loading={busy}>
            Tambah
          </Button>
        </form>

        {categories.length === 0 ? (
          <EmptyState icon={Tags} title="Belum ada kategori" description="Tambahkan kategori pertama di atas." />
        ) : (
          <ul className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                {editingId === c.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => saveEdit(c.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-brand-600 hover:bg-brand-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:bg-black/5"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted">{c._count?.expenses ?? 0} pengeluaran tercatat</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditingName(c.name);
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:bg-black/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeCategory(c.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-danger-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
