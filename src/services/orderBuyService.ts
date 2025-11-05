import { OrderBuy, OrderBuySummary, UpdatedProduct } from '../types';
import { API_URL, API_KEY } from '../lib/env';

interface CreateOrderRequest {
  providerId: number;
  productos: {
    productId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
  igvPorcentaje?: number;
  observaciones?: string;
  userId?: number;
}

interface ReceiveOrderRequest {
  orderId: number;
}

interface CancelOrderRequest {
  orderId: number;
  motivo?: string;
}

interface ApproveOrderRequest {
  orderId: number;
  approverUserId?: number;
  notes?: string;
}

interface RejectOrderRequest {
  orderId: number;
  approverUserId?: number;
  reason: 'precio' | 'proveedor' | 'cantidad' | 'prioridad' | 'presupuesto' | 'otro';
  details?: string;
}

interface RequestChangesRequest {
  orderId: number;
  requesterUserId?: number;
  aspects: string[];
  details: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  summary?: OrderBuySummary;
  updatedProducts?: UpdatedProduct[];
}

class OrderBuyService {
  private getBasicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    };
  }

  /**
   * Crea una nueva orden de compra
   */
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<OrderBuy>> {
    console.log('Creando orden de compra:', data);
    
    const response = await fetch(`${API_URL}/api/order-buys/create-order`, {
      method: 'POST',
      headers: this.getBasicHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del servidor (status ' + response.status + '):', errorData);
      throw new Error(errorData.error?.message || errorData.message || 'Error al crear orden');
    }

    return response.json();
  }

  /**
   * Recibe una orden de compra (actualiza stock)
   */
  async receiveOrder(data: ReceiveOrderRequest): Promise<ApiResponse<OrderBuy>> {
    console.log('Recibiendo orden:', data);
    
    const response = await fetch(`${API_URL}/api/order-buys/receive`, {
      method: 'POST',
      headers: this.getBasicHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del servidor:', errorData);
      throw new Error(errorData.error?.message || errorData.message || 'Error al recibir orden');
    }

    return response.json();
  }

  /**
   * Cancela una orden de compra
   */
  async cancelOrder(data: CancelOrderRequest): Promise<ApiResponse<OrderBuy>> {
    console.log('Cancelando orden:', data);
    
    const response = await fetch(`${API_URL}/api/order-buys/cancel`, {
      method: 'POST',
      headers: this.getBasicHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del servidor:', errorData);
      throw new Error(errorData.error?.message || errorData.message || 'Error al cancelar orden');
    }

    return response.json();
  }

  /**
   * Aprueba una orden de compra
   */
  async approveOrder(data: ApproveOrderRequest): Promise<ApiResponse<OrderBuy>> {
    const response = await fetch(`${API_URL}/api/order-buys/approve`, {
      method: 'POST',
      headers: this.getBasicHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || errorData.message || 'Error al aprobar orden');
    }
    return response.json();
  }

  /**
   * Rechaza una orden de compra
   */
  async rejectOrder(data: RejectOrderRequest): Promise<ApiResponse<OrderBuy>> {
    const response = await fetch(`${API_URL}/api/order-buys/reject`, {
      method: 'POST',
      headers: this.getBasicHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || errorData.message || 'Error al rechazar orden');
    }
    return response.json();
  }

  /**
   * Solicita modificaciones a una orden de compra
   */
  async requestChanges(data: RequestChangesRequest): Promise<ApiResponse<OrderBuy>> {
    const response = await fetch(`${API_URL}/api/order-buys/request-changes`, {
      method: 'POST',
      headers: this.getBasicHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || errorData.message || 'Error al solicitar modificaciones');
    }
    return response.json();
  }

  /**
   * Obtiene todas las órdenes de compra
   */
  async getAllOrders(): Promise<{ data: OrderBuy[] }> {
    const response = await fetch(`${API_URL}/api/order-buys?populate=*&sort=fechaOrden:desc`, {
      method: 'GET',
      headers: this.getBasicHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al obtener órdenes');
    }

    return response.json();
  }

  /**
   * Obtiene una orden específica por ID
   */
  async getOrderById(id: number): Promise<{ data: OrderBuy }> {
    const response = await fetch(`${API_URL}/api/order-buys/${id}?populate=*`, {
      method: 'GET',
      headers: this.getBasicHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al obtener orden');
    }

    return response.json();
  }
}

export const orderBuyService = new OrderBuyService();
