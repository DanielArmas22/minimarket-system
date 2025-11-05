import { CashRegister, CashRegisterSummary } from '../types';

const API_URL = 'http://localhost:1337';

interface OpenCashRegisterRequest {
  initialAmount: number;
  userId?: number;
}

interface CloseCashRegisterRequest {
  cashRegisterId: number;
  actualAmount: number;
  notes?: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  summary?: CashRegisterSummary;
}

class CashRegisterService {
  private getAuthHeaders(): HeadersInit {
    const jwt = localStorage.getItem('jwt');
    return {
      'Content-Type': 'application/json',
      ...(jwt && { Authorization: `Bearer ${jwt}` }),
    };
  }

  private getBasicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Abre una nueva caja registradora
   */
  async openCashRegister(data: OpenCashRegisterRequest): Promise<ApiResponse<CashRegister>> {
    console.log('Enviando datos para abrir caja:', data);
    
    const response = await fetch(`${API_URL}/api/cash-registers/open`, {
      method: 'POST',
      headers: this.getBasicHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del servidor:', errorData);
      throw new Error(errorData.error?.message || errorData.message || 'Error al abrir la caja');
    }

    return response.json();
  }

  /**
   * Cierra una caja registradora abierta
   */
  async closeCashRegister(data: CloseCashRegisterRequest): Promise<ApiResponse<CashRegister>> {
    const response = await fetch(`${API_URL}/api/cash-registers/close`, {
      method: 'POST',
      headers: this.getBasicHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al cerrar la caja');
    }

    return response.json();
  }

  /**
   * Obtiene la caja actualmente abierta
   */
  async getCurrentOpenCashRegister(): Promise<ApiResponse<CashRegister | null>> {
    const response = await fetch(`${API_URL}/api/cash-registers/current-open`, {
      method: 'GET',
      headers: this.getBasicHeaders(),
    });

    // Si es 404, significa que no hay caja abierta, no es un error
    if (response.status === 404) {
      return { data: null, message: 'No hay caja abierta actualmente' };
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al obtener la caja abierta');
    }

    return response.json();
  }

  /**
   * Lista todas las cajas registradoras
   */
  async getAllCashRegisters(): Promise<{ data: CashRegister[] }> {
    const response = await fetch(`${API_URL}/api/cash-registers?populate=*`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al obtener las cajas');
    }

    return response.json();
  }

  /**
   * Obtiene una caja específica por ID
   */
  async getCashRegisterById(id: number): Promise<{ data: CashRegister }> {
    const response = await fetch(`${API_URL}/api/cash-registers/${id}?populate=*`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al obtener la caja');
    }

    return response.json();
  }
}

export const cashRegisterService = new CashRegisterService();
