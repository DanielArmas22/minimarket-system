import { Product, Customer, Sale, DashboardStats } from "../types";

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
    return this.getStoredData("minimarket_products", []);
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const existingIndex = products.findIndex((p) => p.id === product.id);

    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }

    this.setStoredData("minimarket_products", products);
  }

  // Customers
  getCustomers(): Customer[] {
    return this.getStoredData("minimarket_customers", []);
  }

  saveCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    const existingIndex = customers.findIndex((c) => c.id === customer.id);

    if (existingIndex >= 0) {
      customers[existingIndex] = customer;
    } else {
      customers.push(customer);
    }

    this.setStoredData("minimarket_customers", customers);
  }

  deleteCustomer(customerId: string): void {
    const customers = this.getCustomers().filter((c) => c.id !== customerId);
    this.setStoredData("minimarket_customers", customers);
  }

  // Sales
  getSales(): Sale[] {
    return this.getStoredData("minimarket_sales", []);
  }

  saveSale(sale: Sale): void {
    const sales = this.getSales();
    sales.push(sale);
    this.setStoredData("minimarket_sales", sales);

    // Update product stock
    if (sale.items) {
      sale.items.forEach((detail) => {
        const products = this.getProducts();
        const productIndex = products.findIndex(
          (p) => p.id === detail.productId
        );
        if (productIndex >= 0 && detail.quantity) {
          products[productIndex].stock = String(
            Number(products[productIndex].stock) - detail.quantity
          );
          this.setStoredData("minimarket_products", products);
        }
      });
    }
  }

  // Dashboard Stats
  getDashboardStats(): DashboardStats {
    const sales = this.getSales();
    const products = this.getProducts();
    const today = new Date().toDateString();

    const todaySales = sales
      .filter((sale) => new Date(sale.date).toDateString() === today)
      .reduce((sum, sale) => {
        if (sale.items) {
          const saleTotal = sale.items.reduce((detailSum, detail) => {
            return detailSum + (detail.quantity || 0) * (detail.price || 0);
          }, 0);
          return sum + saleTotal;
        }
        return sum;
      }, 0);

    const todayTransactions = sales.filter(
      (sale) => new Date(sale.date).toDateString() === today
    ).length;

    return {
      todaySales,
      todayTransactions,
      totalProducts: products.length,
    };
  }

  // Initialize with sample data
}

export const dataService = new DataService();
