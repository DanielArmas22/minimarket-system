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

export type OrderBuyStatus = 'pendiente' | 'recibida' | 'cancelada';

export interface Provider {
  id: number;
  documentId?: string;
  razonSocial: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  estado?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface DetailOrderBuy {
  id: number;
  documentId?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  product?: Product;
  order_buy?: OrderBuy;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface OrderBuy {
  id: number;
  documentId?: string;
  fechaOrden: string;
  estado: OrderBuyStatus;
  subtotal: number;
  igv: number;
  total: number;
  observaciones?: string;
  provider?: Provider;
  detail_order_buys?: DetailOrderBuy[];
  users_permissions_user?: {
    id: number;
    username: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface OrderBuySummary {
  orderId: number;
  provider: string;
  totalProductos: number;
  subtotal: number;
  igv: number;
  total: number;
}

export interface UpdatedProduct {
  productId: number;
  productName: string;
  previousStock: number;
  addedQuantity: number;
  newStock: number;}

export interface Promotion {
  id: number;
  documentId: string;
  descripcion: string;
  tipoPromocion: string;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  cantidadProducto: number;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export interface ProductPromotion {
  id: number;
  documentId: string;
  promotion: Promotion;
  product: Product;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export interface Provider {
  id: number;
  documentId: string;
  razonSocial: string;
  ruc: string;
  telefono: string;
  email: string;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export interface OrderBuy {
  id: number;
  documentId: string;
  fechaOrden: string;
  fechaEntrega?: string;
  fechaEntregaReal?: string;
  estado: boolean;
  igv: number;
  provider: Provider;
  detail_order_buys?: DetailOrderBuy[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export interface DetailOrderBuy {
  id: number;
  documentId: string;
  cantidad: number;
  product: Product;
  order_buy: OrderBuy;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}