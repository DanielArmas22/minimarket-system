import React from 'react';

interface HeaderProps {
  isMobile: boolean;
  onMenuToggle: () => void;
  lowStockCount: number;
  onLogout?: () => void; // <-- Agrega esta línea
}

export const Header: React.FC<HeaderProps> = ({
  isMobile,
  onMenuToggle,
  lowStockCount,
  onLogout, // <-- Agrega esto
}) => (
  <header className="flex items-center justify-between p-4 bg-white shadow">
    {/* ...otros elementos del header... */}
    <div>
      {/* ...otros botones o info... */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      )}
    </div>
  </header>
);