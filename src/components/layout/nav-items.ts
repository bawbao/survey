import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  ScanBarcode,
  ClipboardCheck,
  BarChart3,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/penjualan", label: "Penjualan", icon: ScanBarcode },
  { href: "/stok", label: "Stok", icon: Boxes },
  { href: "/produk", label: "Produk", icon: Package, adminOnly: true },
  { href: "/pembelian", label: "Pembelian", icon: Truck, adminOnly: true },
  { href: "/opname", label: "Stok Opname", icon: ClipboardCheck, adminOnly: true },
  { href: "/laporan", label: "Laporan", icon: BarChart3, adminOnly: true },
  { href: "/users", label: "Pengguna", icon: Users, adminOnly: true },
];
