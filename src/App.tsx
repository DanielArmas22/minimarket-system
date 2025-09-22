import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Layout/Navigation';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { POS } from './components/POS/POS';
import { Products } from './components/Products/Products';
import { Customers } from './components/Customers/Customers';
import { Sales } from './components/Sales/Sales';
import { dataService } from './services/dataService';
import { Product, Customer, Sale, DashboardStats } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayTransactions: 0,
    lowStockItems: 0,
    totalProducts: 0
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    dataService.initializeSampleData();
    loadData();
  }, []);

  const loadData = () => {
    setProducts(dataService.getProducts());
    setCustomers(dataService.getCustomers());
    setSales(dataService.getSales());
    setStats(dataService.getDashboardStats());
  };

  const handleSaveProduct = (product: Product) => {
    dataService.saveProduct(product);
    loadData();
  };

  const handleDeleteProduct = (productId: string) => {
    dataService.deleteProduct(productId);
    loadData();
  };

  const handleSaveCustomer = (customer: Customer) => {
    dataService.saveCustomer(customer);
    loadData();
  };

  const handleDeleteCustomer = (customerId: string) => {
    dataService.deleteCustomer(customerId);
    loadData();
  };

  const handleSale = (sale: Sale) => {
    dataService.saveSale(sale);
    loadData();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'pos':
        return <POS onSale={handleSale} />;
      case 'products':
        return (
          <Products
            products={products}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'customers':
        return (
          <Customers
            customers={customers}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      case 'sales':
        return <Sales sales={sales} />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isMobile={true} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          lowStockCount={stats.lowStockItems}
        />
        
        <main className="pb-20">
          {renderContent()}
        </main>
        
        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          isMobile={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          isMobile={false} 
          onMenuToggle={() => {}}
          lowStockCount={stats.lowStockItems}
        />
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;