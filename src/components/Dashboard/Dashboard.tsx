import React from "react";
import { DollarSign, ShoppingBag, Package } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { DashboardStats } from "../../types";

interface DashboardProps {
  stats: DashboardStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Resumen de actividad del minimarket</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Ventas de Hoy"
          value={`$${stats.todaySales.toFixed(2)}`}
          icon={DollarSign}
          color="green"
          trend={{
            value: "12.5%",
            isPositive: true,
          }}
        />
        <StatsCard
          title="Transacciones"
          value={stats.todayTransactions.toString()}
          icon={ShoppingBag}
          color="blue"
          trend={{
            value: "8 ventas",
            isPositive: true,
          }}
        />
        <StatsCard
          title="Productos"
          value={stats.totalProducts.toString()}
          icon={Package}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ventas Recientes
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Venta #{(index + 1).toString().padStart(3, "0")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Hace {index + 1} hora{index > 0 ? "s" : ""}
                  </p>
                </div>
                <span className="text-green-600 font-semibold">
                  ${(25.5 + index * 5).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Productos Populares
          </h3>
          <div className="space-y-3">
            {["Coca Cola 600ml", "Pan Bimbo Grande", "Sabritas Clásicas"].map(
              (product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product}</p>
                    <p className="text-sm text-gray-600">
                      {15 - index * 3} vendidos hoy
                    </p>
                  </div>
                  <div className="bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-blue-600 text-sm font-medium">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
