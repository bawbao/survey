"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { toDateInputValue } from "@/lib/format";
import type { ExpenseCategoryDTO, ExpenseDTO } from "@/types/models";

export function ExpenseFormModal({
  open,
  onClose,
  onSaved,
  categories,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: ExpenseCategoryDTO[];
  expense: ExpenseDTO | null;
}) {
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("0");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (expense) {
      setCategoryId(expense.categoryId);
      setAmount(expense.amount);
      setDate(toDateInputValue(expense.date));
      setNote(expense.note ?? "");
    } else {
      setCategoryId(categories[0]?.id ?? "");
      setAmount("0");
      setDate(toDateInputValue(new Date()));
      setNote("");
    }
  }, [open, expense, categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch(expense ? `/api/expenses/${expense.id}` : "/api/expenses", {
        method: expense ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, amount: Number(amount), date, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan pengeluaran.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={expense ? "Ubah Pengeluaran" : "Tambah Pengeluaran"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <Select label="Kategori" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.length === 0 && <option value="">— Belum ada kategori —</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Jumlah (Rp)"
            type="number"
            min={0}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input label="Tanggal" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <Textarea
          label="Catatan"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Opsional, mis. Gaji karyawan bulan Agustus"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving} disabled={!categoryId}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
