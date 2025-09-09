export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
  minStock: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  customerId?: string;
  customerName?: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
}

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  lowStockItems: number;
  totalProducts: number;
}