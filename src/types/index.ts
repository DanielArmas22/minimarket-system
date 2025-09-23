export interface Product {
    id:             number;
    documentId:     string;
    descripcion:    string;
    unidadMedida:   string;
    precioUnitario: number;
    stock:          string;
    createdAt:      Date;
    updatedAt:      Date;
    publishedAt:    Date;
    barCode:        string;
    stockMin:       number;
    category:       Category;
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
    id:          number;
    documentId:  string;
    descripcion: string;
    estado:      boolean;
    createdAt:   Date;
    updatedAt:   Date;
    publishedAt: Date;
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
  lowStockItems: number;
  totalProducts: number;
}

export interface typePayment{
    id:          number;
    documentId:  string;
    descripcion: string;
    createdAt:   Date;
    updatedAt:   Date;
    publishedAt: Date;
    estado:      boolean;

}