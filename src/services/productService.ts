import { Product } from '../types';

const API_URL = 'http://localhost:1337';

class ProductService {
  private getBasicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaders(): HeadersInit {
    const jwt = localStorage.getItem('jwt');
    return {
      'Content-Type': 'application/json',
      ...(jwt && { Authorization: `Bearer ${jwt}` }),
    };
  }

  /**
   * Obtiene todos los productos del backend
   */
  async getAllProducts(): Promise<{ data: Product[] }> {
    // Intentar primero con autenticación
    let response = await fetch(`${API_URL}/api/products?populate=*`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    // Si falla con 403, intentar sin autenticación
    if (response.status === 403) {
      console.log('Intentando sin autenticación...');
      response = await fetch(`${API_URL}/api/products?populate=*`, {
        method: 'GET',
        headers: this.getBasicHeaders(),
      });
    }

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
