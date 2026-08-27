"use client";

import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Download, Upload, DatabaseBackup } from "lucide-react";

export function PengaturanClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRestore() {
    if (!selectedFile) return;
    const confirmed = confirm(
      "PERINGATAN: Ini akan MENGGANTI SELURUH data aplikasi saat ini (produk, transaksi, stok, pengguna, dll) dengan isi file backup. Data yang belum di-backup akan HILANG. Lanjutkan?",
    );
    if (!confirmed) return;

    setError(null);
    setSuccess(null);
    setRestoring(true);
    try {
      const text = await selectedFile.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setError("File yang dipilih bukan file backup JSON yang valid.");
        return;
      }

      const res = await fetch("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memulihkan data.");
        return;
      }
      setSuccess(
        `Data berhasil dipulihkan (${data.counts.users} pengguna, ${data.counts.products} produk, ${data.counts.sales} penjualan, ${data.counts.purchases} pembelian). Silakan login ulang.`,
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader title="Cadangkan Data" subtitle="Unduh seluruh data aplikasi (produk, transaksi, stok, pengguna) sebagai 1 file." />
        <CardBody className="space-y-4">
          <p className="text-sm text-muted">
            Simpan file ini secara berkala ke USB, hard disk eksternal, atau Google Drive — terutama kalau aplikasi
            dijalankan lokal di PC toko (tanpa cadangan otomatis ke cloud).
          </p>
          <a href="/api/backup/export">
            <Button type="button">
              <Download className="h-4 w-4" /> Unduh Backup Data
            </Button>
          </a>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Pulihkan dari Backup" subtitle="Kembalikan data dari file backup yang pernah diunduh." />
        <CardBody className="space-y-4">
          <Alert tone="warning">
            Memulihkan backup akan <strong>mengganti seluruh data yang ada saat ini</strong>, bukan menggabungkan.
            Pastikan Anda benar-benar butuh ini (mis. pindah ke komputer baru, atau data rusak) sebelum melanjutkan.
          </Alert>

          {error && <Alert tone="error">{error}</Alert>}
          {success && <Alert tone="success">{success}</Alert>}

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            <Button
              type="button"
              variant="danger"
              onClick={handleRestore}
              loading={restoring}
              disabled={!selectedFile}
            >
              <Upload className="h-4 w-4" /> Pulihkan Data
            </Button>
          </div>

          {success && (
            <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
              <DatabaseBackup className="h-4 w-4" /> Keluar &amp; Login Ulang
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
