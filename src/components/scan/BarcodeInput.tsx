"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ScanBarcode, Loader2, PackagePlus } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { ProductDTO } from "@/types/models";
import { QuickAddProductModal } from "./QuickAddProductModal";

/**
 * Input serbaguna untuk menambahkan barang ke transaksi:
 * - Scanner barcode fisik (USB/Bluetooth) mengetik kode lalu mengirim Enter -> otomatis dicari & ditambahkan.
 * - Diketik manual: hasil pencarian nama/SKU/barcode muncul sebagai dropdown, klik untuk menambahkan.
 * - Kalau kodenya belum terdaftar, Admin bisa langsung mendaftarkan barang baru (nama, harga beli/jual) dari sini.
 * Input tetap fokus setelah setiap penambahan supaya proses scan berturut-turut tetap cepat.
 */
export function BarcodeInput({
  onAddProduct,
  autoFocus = true,
  placeholder = "Scan barcode atau ketik nama barang...",
}: {
  onAddProduct: (product: ProductDTO) => void;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductDTO[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setNotFoundCode(null);
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query.trim())}&activeOnly=true`);
        if (res.ok) {
          const data: ProductDTO[] = await res.json();
          setResults(data.slice(0, 8));
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  function addAndReset(product: ProductDTO) {
    onAddProduct(product);
    setQuery("");
    setResults([]);
    setOpen(false);
    setNotFoundCode(null);
    inputRef.current?.focus();
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    const code = query.trim();
    if (!code) return;

    setLoading(true);
    setNotFoundCode(null);
    try {
      const res = await fetch(`/api/products/barcode/${encodeURIComponent(code)}`);
      if (res.ok) {
        addAndReset(await res.json());
        return;
      }
      if (results.length === 1) {
        addAndReset(results[0]);
        return;
      }
      setNotFoundCode(code);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <ScanBarcode className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-500" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border-2 border-brand-200 bg-surface pl-11 pr-11 py-3.5 text-base font-medium outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
        />
        {loading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted animate-spin" />}
      </div>

      {notFoundCode && !loading && (
        <div className="flex flex-wrap items-center gap-2 mt-1.5 px-1">
          <p className="text-xs text-danger-600">
            Barang &quot;{notFoundCode}&quot; tidak ditemukan.
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              <PackagePlus className="h-3.5 w-3.5" /> Daftarkan sebagai barang baru
            </button>
          )}
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1.5 w-full bg-surface border border-border rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addAndReset(p)}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-brand-50 border-b border-border last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted">
                  {p.sku} · Stok {formatNumber(p.stock)} {p.unit}
                </p>
              </div>
              <span className="text-sm font-semibold text-brand-700 shrink-0">{formatCurrency(p.sellPrice)}</span>
            </button>
          ))}
        </div>
      )}

      {isAdmin && (
        <QuickAddProductModal
          open={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          initialBarcode={notFoundCode ?? query.trim()}
          onCreated={(product) => addAndReset(product)}
        />
      )}
    </div>
  );
}
