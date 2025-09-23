import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  isMobile: boolean;
  onMenuToggle: () => void;
  lowStockCount: number;
  onLogout?: () => void; 
}

export const Header: React.FC<HeaderProps> = ({ isMobile, onMenuToggle, lowStockCount, onLogout, }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={onMenuToggle}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          
          {!isMobile && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">MiniMarket Pro</h1>
              <p className="text-sm text-gray-600">Sistema de Gestión</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative">
              <Bell className="h-6 w-6" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {lowStockCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
};