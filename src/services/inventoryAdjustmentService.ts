import { InventoryAdjustment, InventoryAdjustmentSummary, AdjustmentType, AdjustmentReason } from '../types';

const API_URL = import.meta.env.VITE_URL_API || 'http://localhost:1337';

interface AdjustInventoryRequest {
  productId: number;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason: AdjustmentReason;
  reasonDescription?: string;
  userId?: number;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  summary?: InventoryAdjustmentSummary;
  total?: number;
}

class InventoryAdjustmentService {
  private getBasicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Ajusta el inventario de un producto
   */
  async adjustInventory(data: AdjustInventoryRequest): Promise<ApiResponse<InventoryAdjustment>> {
    // Limpiar reasonDescription si está vacío
    const cleanData = {
      ...data,
      reasonDescription: data.reasonDescription?.trim() || undefined,
    };
    
    // Remover reasonDescription si es undefined
    if (!cleanData.reasonDescription) {
      delete (cleanData as any).reasonDescription;
    }
    
    console.log('Enviando ajuste de inventario:', cleanData);
    
    const response = await fetch(`${API_URL}/api/inventory-adjustments/adjust`, {
      method: 'POST',
      headers: this.getBasicHeaders(),
      body: JSON.stringify(cleanData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del servidor (status ' + response.status + '):', errorData);
      console.error('Datos enviados:', cleanData);
      throw new Error(errorData.error?.message || errorData.message || 'Error al ajustar inventario');
    }

    return response.json();
  }

  /**
   * Obtiene el historial de ajustes de un producto
   */
  async getProductHistory(productId: number): Promise<ApiResponse<InventoryAdjustment[]>> {
    const response = await fetch(`${API_URL}/api/inventory-adjustments/product/${productId}/history`, {
      method: 'GET',
      headers: this.getBasicHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || errorData.message || 'Error al obtener historial');
    }

    return response.json();
  }

  /**
   * Lista todos los ajustes de inventario
   */
  async getAllAdjustments(): Promise<{ data: InventoryAdjustment[] }> {
    const response = await fetch(`${API_URL}/api/inventory-adjustments?populate=*&sort=adjustmentDate:desc`, {
      method: 'GET',
      headers: this.getBasicHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al obtener ajustes');
    }

    return response.json();
  }

  /**
   * Obtiene un ajuste específico por ID
   */
  async getAdjustmentById(id: number): Promise<{ data: InventoryAdjustment }> {
    const response = await fetch(`${API_URL}/api/inventory-adjustments/${id}?populate=*`, {
      method: 'GET',
      headers: this.getBasicHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al obtener ajuste');
    }

    return response.json();
  }
}

export const inventoryAdjustmentService = new InventoryAdjustmentService();
