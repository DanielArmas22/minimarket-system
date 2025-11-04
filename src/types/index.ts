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