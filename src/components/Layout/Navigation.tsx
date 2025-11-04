import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart, Settings, Shield, UserCog, Tag } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile?: boolean;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS', icon: ShoppingCart },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'promotions', label: 'Promociones', icon: Tag },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'sales', label: 'Ventas', icon: BarChart },
  { id: 'users', label: 'Usuarios', icon: UserCog },
  { id: 'roles', label: 'Roles', icon: Shield },
];

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  isMobile = false 
}) => {
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center py-2 px-1 min-w-0 transition-colors ${
                  activeTab === item.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">MiniMarket Pro</h1>
        </div>
        
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};