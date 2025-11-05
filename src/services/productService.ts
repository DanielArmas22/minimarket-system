import { Product } from '../types';
import { API_URL, API_KEY } from '../lib/env';

class ProductService {
  private getBasicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaders(): HeadersInit {
    const jwt = API_KEY || localStorage.getItem('jwt') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(jwt && { Authorization: `Bearer ${jwt}` }),
    };
  }

  /**
   * Obtiene todos los productos del backend
   */
  async getAllProducts(): Promise<{ data: Product[] }> {
    let response = await fetch(`${API_URL}/api/products?populate=*`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al obtener productos:', errorData);
      throw new Error(errorData.error?.message || 'Error al obtener productos');
    }

    return response.json();
  }

  /**
   * Obtiene un producto específico por ID
   */
  async getProductById(id: number): Promise<{ data: Product }> {
    const response = await fetch(`${API_URL}/api/products/${id}?populate=*`, {
      method: 'GET',
      headers: this.getBasicHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al obtener producto');
    }

    return response.json();
  }
}

export const productService = new ProductService();
