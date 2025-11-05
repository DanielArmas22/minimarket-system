import { Provider } from '../types';

const API_URL = 'http://localhost:1337';

class ProviderService {
  private getBasicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtiene todos los proveedores
   */
  async getAllProviders(): Promise<{ data: Provider[] }> {
    const response = await fetch(`${API_URL}/api/providers?populate=*`, {
      method: 'GET',
      headers: this.getBasicHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al obtener proveedores:', errorData);
      throw new Error(errorData.error?.message || 'Error al obtener proveedores');
    }

    return response.json();
  }

  /**
   * Obtiene un proveedor específico por ID
   */
  async getProviderById(id: number): Promise<{ data: Provider }> {
    const response = await fetch(`${API_URL}/api/providers/${id}`, {
      method: 'GET',
      headers: this.getBasicHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al obtener proveedor');
    }

    return response.json();
  }
}

export const providerService = new ProviderService();
