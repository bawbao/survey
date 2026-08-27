"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { Plus, Pencil, PowerOff, Power, Users as UsersIcon } from "lucide-react";
import type { UserDTO } from "@/types/models";
import { UserFormModal } from "./UserFormModal";

export function UsersClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function toggleActive(user: UserDTO) {
    setError(null);
    const activating = !user.isActive;
    if (!confirm(activating ? `Aktifkan kembali "${user.name}"?` : `Nonaktifkan "${user.name}"?`)) return;

    const res = activating
      ? await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        })
      : await fetch(`/api/users/${user.id}`, { method: "DELETE" });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal mengubah status pengguna.");
      return;
    }
    fetchUsers();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-danger-600 text-sm px-4 py-3">{error}</div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingUser(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Tambah Pengguna
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-5 py-3">Nama</th>
                <th className="text-left font-medium px-5 py-3">Email</th>
                <th className="text-left font-medium px-5 py-3">Peran</th>
                <th className="text-left font-medium px-5 py-3">Bergabung</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-background/60">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {u.name}
                    {u.id === currentUserId && <span className="text-muted font-normal"> (Anda)</span>}
                  </td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge tone={u.role === "ADMIN" ? "brand" : "gray"}>{u.role === "ADMIN" ? "Admin" : "Kasir"}</Badge>
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3">
                    {u.isActive ? <Badge tone="brand">Aktif</Badge> : <Badge tone="gray">Nonaktif</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setFormOpen(true);
                        }}
                        title="Ubah"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:bg-black/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          onClick={() => toggleActive(u)}
                          title={u.isActive ? "Nonaktifkan" : "Aktifkan"}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg hover:bg-black/5 ${u.isActive ? "text-danger-600" : "text-brand-600"}`}
                        >
                          {u.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && users.length === 0 && (
          <EmptyState icon={UsersIcon} title="Belum ada pengguna" description="Tambahkan akun admin atau kasir." />
        )}
        {loading && <div className="px-5 py-8 text-center text-sm text-muted">Memuat data...</div>}
      </Card>

      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={fetchUsers} user={editingUser} />
    </div>
  );
}
