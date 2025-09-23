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
  total: number;
  customerId?: string;
  customerName?: string;
  date: string;
  paymentMethod: "cash" | "card" | "transfer";
}

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  totalProducts: number;
}

// Interfaces para el sistema de roles
export interface RolePermissions {
  dashboard: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
  productos: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
  ventas: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
  clientes: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
  reportes: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
  configuracion: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
}

export interface Role {
  id: number;
  documentId: string;
  nombre: string;
  descripcion?: string;
  permisos: RolePermissions;
  activo: boolean;
  nivel: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export interface CreateRoleRequest {
  nombre: string;
  descripcion?: string;
  permisos: RolePermissions;
  activo?: boolean;
  nivel?: number;
}

export interface UpdateRoleRequest {
  nombre?: string;
  descripcion?: string;
  permisos?: RolePermissions;
  activo?: boolean;
  nivel?: number;
}

// Respuestas de la API de Strapi
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}
