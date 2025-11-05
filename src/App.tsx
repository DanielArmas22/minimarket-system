import React, { useState, useEffect } from "react";
import { Navigation } from "./components/Layout/Navigation";
import { UserList } from "./components/users";
import { Header } from "./components/Layout/Header";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { POS } from "./components/POS/POS";
import { Products } from "./components/Products/Products";
import { Promotions } from "./components/Promotions/Promotions";
import { OrderBuyComponent } from "./components/OrderBuy/OrderBuy";
import { Customers } from "./components/Customers/Customers";
import { Sales } from "./components/Sales/Sales";
import { CashRegister } from "./components/CashRegister/CashRegister";
import { InventoryAdjustment } from "./components/InventoryAdjustment/InventoryAdjustment";
import { Reports } from "./components/Reports/Reports";
import { dataService } from "./services/dataService";
import { productService } from "./services/productService";
import { Stock } from "./components/Stock/Stock";
import { Product, Customer, Sale, DashboardStats } from "./types";
import { Login } from "./Auth/Login";
import onLogout from "./Auth/onLogout";
import { Roles } from "./components/Roles/Roles";
import { Collaborators } from "./components/Collaborators/Collaborators";
function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("jwt")
  );
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayTransactions: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // dataService.initializeSampleData();
    loadData();
  }, []);

  const loadData = async () => {
    // Cargar productos desde el backend
    try {
      const productsResponse = await productService.getAllProducts();
      setProducts(productsResponse.data || []);
    } catch (error) {
      console.error('Error al cargar productos del backend:', error);
      // Fallback a localStorage si falla el backend
      setProducts(dataService.getProducts());
    }

    // Estos siguen usando localStorage por ahora
    setCustomers(dataService.getCustomers());
    setSales(dataService.getSales());
    setStats(dataService.getDashboardStats());
  };

  const handleSaveProduct = (product: Product) => {
    dataService.saveProduct(product);
    loadData();
  };

  const handleDeleteProduct = (productId: string) => {
    // dataService.deleteProduct(productId);
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
      case "dashboard":
        return <Dashboard stats={stats} />;
      case "pos":
        return <POS onSale={handleSale} />;
      case "stock":
        return <Stock />;
      case "cash-register":
        return <CashRegister />;
      case "products":
        return (
          <Products
            products={products}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case "promotions":
        return <Promotions />;
      case "orderBuy":
        return <OrderBuyComponent />;
      case "customers":
        return (
          <Customers
            customers={customers}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      case "sales":
        return <Sales sales={sales} />;
      case "reports":
        return <Reports sales={sales} />;
      case "users":
        return <UserList />;
      case "roles":
        return <Roles />;
      case "collaborators":
        return <Collaborators />;
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
          lowStockCount={0}
          onLogout={handleLogout}
        />

        <main className="pb-20">{renderContent()}</main>

        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobile={true}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <Header
          isMobile={false}
          onMenuToggle={() => { }}
          lowStockCount={0}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
