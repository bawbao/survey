"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Pencil, Trash2, Tags, Wallet } from "lucide-react";
import type { ExpenseCategoryDTO, ExpenseDTO } from "@/types/models";
import { PeriodFilter, presetPeriod, type Period } from "../laporan/PeriodFilter";
import { ExpenseFormModal } from "./ExpenseFormModal";
import { ExpenseCategoryManagerModal } from "./ExpenseCategoryManagerModal";

export function PengeluaranClient({ initialCategories }: { initialCategories: ExpenseCategoryDTO[] }) {
  const [categories, setCategories] = useState<ExpenseCategoryDTO[]>(initialCategories);
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>(presetPeriod("month"));
  const [categoryId, setCategoryId] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseDTO | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const refreshCategories = useCallback(async () => {
    const res = await fetch("/api/expense-categories");
    if (res.ok) setCategories(await res.json());
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ from: period.from, to: period.to });
    if (categoryId) params.set("categoryId", categoryId);
    const res = await fetch(`/api/expenses?${params.toString()}`);
    if (res.ok) setExpenses(await res.json());
    setLoading(false);
  }, [period, categoryId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  async function removeExpense(expense: ExpenseDTO) {
    if (!confirm(`Hapus pengeluaran "${expense.category.name}" sebesar ${formatCurrency(expense.amount)}?`)) return;
    const res = await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
    if (res.ok) fetchExpenses();
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <PeriodFilter period={period} onChange={setPeriod} />
          <Select label="Kategori" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-48">
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
            <Tags className="h-4 w-4" /> Kategori
          </Button>
          <Button
            onClick={() => {
              setEditingExpense(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Tambah Pengeluaran
          </Button>
        </div>
      </Card>

      <Card>
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-muted">Total pengeluaran periode ini</span>
          <span className="text-xl font-bold text-foreground">{formatCurrency(total)}</span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">Tanggal</th>
                <th className="text-left font-medium px-5 py-3">Kategori</th>
                <th className="text-left font-medium px-5 py-3">Catatan</th>
                <th className="text-left font-medium px-5 py-3">Dicatat Oleh</th>
                <th className="text-right font-medium px-5 py-3">Jumlah</th>
                <th className="text-right font-medium px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-background/60">
                  <td className="px-5 py-3 whitespace-nowrap">{formatDate(e.date)}</td>
                  <td className="px-5 py-3">
                    <Badge tone="gray">{e.category.name}</Badge>
                  </td>
                  <td className="px-5 py-3 text-muted">{e.note ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{e.user.name}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatCurrency(e.amount)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingExpense(e);
                          setFormOpen(true);
                        }}
                        title="Ubah"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:bg-black/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeExpense(e)}
                        title="Hapus"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-danger-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && expenses.length === 0 && (
          <EmptyState
            icon={Wallet}
            title="Belum ada pengeluaran"
            description="Catat gaji karyawan, sewa, transport, dan biaya operasional lainnya di sini."
            action={
              <Button
                onClick={() => {
                  setEditingExpense(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Tambah Pengeluaran
              </Button>
            }
          />
        )}
        {loading && <div className="px-5 py-8 text-center text-sm text-muted">Memuat data...</div>}
      </Card>

      <ExpenseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchExpenses}
        categories={categories}
        expense={editingExpense}
      />
      <ExpenseCategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onChanged={refreshCategories}
      />
    </div>
  );
}
