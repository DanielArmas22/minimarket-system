export interface Product {
  id: number;
  documentId: string;
  descripcion: string;
  unidadMedida: string;
  precioUnitario: number;
  stock: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  barCode: string;
  stockMin: number;
  category: Category;
}
// export interface Product {
//   id: string;
//   name: string;
//   barcode: string;
//   price: number;
//   stock: number;
//   category: string;
//   minStock: number;
//   createdAt: string;
// }

export interface Category {
  id: number;
  documentId: string;
  descripcion: string;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export interface Customer {
  id: string;
  username: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  estado: boolean;
  blocked: boolean;
  confirmed: boolean;
  role?: Role;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  type?: string;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  documentId?: string;
  total: number;
  customerId?: string;
  customerName?: string;
  date: string;
  paymentMethod: number | null; // Cambiar a ID numérico para que coincida con typePayment
}

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  totalProducts: number;
}

export interface typePayment {
  id: number;
  documentId: string;
  descripcion: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  estado: boolean;
}

export interface CashRegister {
  id: number;
  documentId?: string;
  openingDate: string;
  closingDate?: string;
  initialAmount: number;
  expectedAmount?: number;
  actualAmount?: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
  users_permissions_user?: {
    id: number;
    username: string;
    email: string;
  };
  sales?: Sale[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CashRegisterSummary {
  initialAmount: number;
  totalSales: number;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
}

export type AdjustmentType = 'increase' | 'decrease';
export type AdjustmentReason = 'merma' | 'conteo' | 'daño' | 'devolucion' | 'correccion' | 'otro';

export interface InventoryAdjustment {
  id: number;
  documentId?: string;
  adjustmentDate: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason: AdjustmentReason;
  reasonDescription?: string;
  previousStock: number;
  newStock: number;
  product?: Product;
  users_permissions_user?: {
    id: number;
    username: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface InventoryAdjustmentSummary {
  productId: number;
  productDescription: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  previousStock: number;
  newStock: number;
  difference: number;
}