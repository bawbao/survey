// Bentuk data setelah melewati API (Prisma Decimal -> string saat di-JSON-kan).

export interface CategoryDTO {
  id: string;
  name: string;
  _count?: { products: number };
}

export interface ProductDTO {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  categoryId: string | null;
  category: CategoryDTO | null;
  unit: string;
  buyPrice: string;
  sellPrice: string;
  stock: string;
  minStock: string;
  isActive: boolean;
}

export interface SupplierDTO {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
}

export type StockMovementType = "PURCHASE" | "SALE" | "OPNAME_ADJUST" | "MANUAL";

export interface StockMovementDTO {
  id: string;
  productId: string;
  type: StockMovementType;
  qty: string;
  balance: string;
  note: string | null;
  date: string;
  purchaseId: string | null;
  saleId: string | null;
  opnameId: string | null;
  user: { name: string } | null;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "KASIR";
  isActive: boolean;
  createdAt: string;
}

export interface PurchaseItemDTO {
  id: string;
  productId: string;
  product: ProductDTO;
  qty: string;
  buyPrice: string;
  subtotal: string;
}

export interface PurchaseDTO {
  id: string;
  invoiceNo: string;
  supplierId: string | null;
  supplier: SupplierDTO | null;
  userId: string;
  user: { name: string };
  date: string;
  total: string;
  note: string | null;
  createdAt: string;
  items?: PurchaseItemDTO[];
  _count?: { items: number };
}

export interface DailyPoint {
  date: string;
  total: number;
}

export interface TopProductRow {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  total: number;
}

export interface SalesReport {
  totalRevenue: number;
  totalTransactions: number;
  totalItemsSold: number;
  totalDiscount: number;
  daily: DailyPoint[];
  topProducts: TopProductRow[];
}

export interface PurchasesReport {
  totalSpend: number;
  totalTransactions: number;
  totalItemsBought: number;
  daily: DailyPoint[];
  topProducts: TopProductRow[];
}

export interface StockReportRow {
  id: string;
  name: string;
  sku: string;
  unit: string;
  stock: number;
  minStock: number;
  buyPrice: number;
  stockValue: number;
}

export interface StockReport {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  rows: StockReportRow[];
}

export interface ProfitProductRow {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ExpenseCategoryDTO {
  id: string;
  name: string;
  _count?: { expenses: number };
}

export interface ExpenseDTO {
  id: string;
  categoryId: string;
  category: ExpenseCategoryDTO;
  amount: string;
  date: string;
  note: string | null;
  userId: string;
  user: { name: string };
  createdAt: string;
}

export interface ExpenseCategoryTotal {
  categoryId: string;
  name: string;
  total: number;
}

export interface ProfitReport {
  totalRevenue: number;
  totalCost: number;
  totalDiscount: number;
  totalProfit: number;
  marginPercent: number;
  totalExpenses: number;
  netProfit: number;
  netMarginPercent: number;
  expensesByCategory: ExpenseCategoryTotal[];
  daily: DailyPoint[];
  topProducts: ProfitProductRow[];
}

export type OpnameStatus = "DRAFT" | "COMPLETED";

export interface StockOpnameItemDTO {
  id: string;
  opnameId: string;
  productId: string;
  product: ProductDTO;
  systemQty: string;
  actualQty: string | null;
  difference: string | null;
  note: string | null;
}

export interface StockOpnameDTO {
  id: string;
  code: string;
  date: string;
  userId: string;
  user: { name: string };
  status: OpnameStatus;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
  items?: StockOpnameItemDTO[];
  _count?: { items: number };
}

export type PaymentMethod = "CASH" | "TRANSFER" | "QRIS" | "OTHER";

export interface SaleItemDTO {
  id: string;
  productId: string;
  product: ProductDTO;
  qty: string;
  sellPrice: string;
  subtotal: string;
}

export interface SaleDTO {
  id: string;
  invoiceNo: string;
  customerName: string | null;
  userId: string;
  user: { name: string };
  date: string;
  subtotal: string;
  discount: string;
  total: string;
  paymentMethod: PaymentMethod;
  note: string | null;
  createdAt: string;
  items?: SaleItemDTO[];
  _count?: { items: number };
}
