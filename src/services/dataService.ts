import { Product, Customer, Sale, DashboardStats } from '../types';

class DataService {
  private getStoredData<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStoredData<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Products
  getProducts(): Product[] {
    return this.getStoredData('minimarket_products', []);
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    
    this.setStoredData('minimarket_products', products);
  }

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    this.setStoredData('minimarket_products', products);
  }

  updateStock(productId: string, newStock: number): void {
    const products = this.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex >= 0) {
      products[productIndex].stock = newStock;
      this.setStoredData('minimarket_products', products);
    }
  }

  // Customers
  getCustomers(): Customer[] {
    return this.getStoredData('minimarket_customers', []);
  }

  saveCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    
    if (existingIndex >= 0) {
      customers[existingIndex] = customer;
    } else {
      customers.push(customer);
    }
    
    this.setStoredData('minimarket_customers', customers);
  }

  deleteCustomer(customerId: string): void {
    const customers = this.getCustomers().filter(c => c.id !== customerId);
    this.setStoredData('minimarket_customers', customers);
  }

  // Sales
  getSales(): Sale[] {
    return this.getStoredData('minimarket_sales', []);
  }

  saveSale(sale: Sale): void {
    const sales = this.getSales();
    sales.push(sale);
    this.setStoredData('minimarket_sales', sales);
    
    // Update product stock
    sale.items.forEach(item => {
      const products = this.getProducts();
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex >= 0) {
        products[productIndex].stock -= item.quantity;
        this.setStoredData('minimarket_products', products);
      }
    });
  }

  // Dashboard Stats
  getDashboardStats(): DashboardStats {
    const sales = this.getSales();
    const products = this.getProducts();
    const today = new Date().toDateString();
    
    const todaySales = sales
      .filter(sale => new Date(sale.date).toDateString() === today)
      .reduce((sum, sale) => sum + sale.total, 0);
      
    const todayTransactions = sales
      .filter(sale => new Date(sale.date).toDateString() === today)
      .length;
      
    const lowStockItems = products
      .filter(product => product.stock <= product.minStock)
      .length;

    return {
      todaySales,
      todayTransactions,
      lowStockItems,
      totalProducts: products.length
    };
  }

  // Initialize with sample data
  initializeSampleData(): void {
    const products = this.getProducts();
    const customers = this.getCustomers();
    
    if (products.length === 0) {
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Coca Cola 600ml',
          barcode: '7501055365579',
          price: 2.50,
          stock: 48,
          category: 'Bebidas',
          minStock: 10,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Pan Bimbo Grande',
          barcode: '7501000171507',
          price: 3.20,
          stock: 25,
          category: 'Panadería',
          minStock: 5,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Leche Santa Clara 1L',
          barcode: '7501055357890',
          price: 4.80,
          stock: 6,
          category: 'Lácteos',
          minStock: 8,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Sabritas Clásicas',
          barcode: '7501055315784',
          price: 1.80,
          stock: 35,
          category: 'Snacks',
          minStock: 15,
          createdAt: new Date().toISOString()
        }
      ];
      this.setStoredData('minimarket_products', sampleProducts);
    }

    if (customers.length === 0) {
      const sampleCustomers: Customer[] = [
        {
          id: '1',
          name: 'María González',
          email: 'maria@email.com',
          phone: '555-0123',
          address: 'Av. Principal 123',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Carlos López',
          email: 'carlos@email.com',
          phone: '555-0456',
          address: 'Calle 5 #89',
          createdAt: new Date().toISOString()
        }
      ];
      this.setStoredData('minimarket_customers', sampleCustomers);
    }
  }
}

export const dataService = new DataService();