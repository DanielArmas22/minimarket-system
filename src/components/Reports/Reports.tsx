import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, BarChart3, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { ReportType, ReportFilters, reportService } from '../../services/reportService';
import { Sale, InventoryAdjustment } from '../../types';
import { inventoryAdjustmentService } from '../../services/inventoryAdjustmentService';

interface ReportsProps {
  sales: Sale[];
}

export const Reports: React.FC<ReportsProps> = ({ sales }) => {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Primer día del mes actual
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [inventoryAdjustments, setInventoryAdjustments] = useState<InventoryAdjustment[]>([]);

  // Cargar ajustes de inventario al montar el componente
  useEffect(() => {
    loadInventoryAdjustments();
  }, []);

  const loadInventoryAdjustments = async () => {
    try {
      const response = await inventoryAdjustmentService.getAllAdjustments();
      setInventoryAdjustments(response.data || []);
    } catch (error) {
      console.error('Error al cargar ajustes de inventario:', error);
      // Continuar sin ajustes si hay error
    }
  };

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecciona ambas fechas.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin.');
      return;
    }

    setLoading(true);

    try {
      const filters: ReportFilters = {
        startDate,
        endDate,
        reportType,
      };

      const data = {
        sales,
        inventoryAdjustments,
        filters,
      };

      reportService.generateReport(reportType, data);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getReportDescription = (type: ReportType): string => {
    switch (type) {
      case 'sales':
        return 'Lista todas las ventas realizadas en el período seleccionado con sus detalles.';
      case 'top-products':
        return 'Ranking de los productos más vendidos por cantidad e ingresos.';
      case 'profit-margin':
        return 'Análisis de márgenes de ganancia estimados por producto.';
      case 'inventory-movements':
        return 'Registro de todos los ajustes de inventario realizados en el período.';
      default:
        return '';
    }
  };

  const reportOptions = [
    {
      type: 'sales' as ReportType,
      title: 'Reporte de Ventas',
      icon: FileText,
      description: 'Ventas realizadas',
    },
    {
      type: 'top-products' as ReportType,
      title: 'Productos Más Vendidos',
      icon: BarChart3,
      description: 'Ranking de productos',
    },
    {
      type: 'profit-margin' as ReportType,
      title: 'Márgenes de Ganancia',
      icon: TrendingUp,
      description: 'Análisis de márgenes',
    },
    {
      type: 'inventory-movements' as ReportType,
      title: 'Movimientos de Inventario',
      icon: Package,
      description: 'Ajustes de inventario',
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generar Reportes</h2>
        <p className="text-gray-600">Selecciona el tipo de reporte y el período para generar un PDF</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Selector de tipo de reporte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Reporte
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => setReportType(option.type)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    reportType === option.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-6 w-6 mt-1 ${
                      reportType === option.type ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${
                        reportType === option.type ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {reportType === option.type && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-gray-500">{getReportDescription(reportType)}</p>
        </div>

        {/* Selector de fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha de Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Información del período */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">Período seleccionado</p>
              <p className="text-sm text-gray-600">
                {new Date(startDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {new Date(endDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {reportType === 'sales' && (
                <p className="text-xs text-gray-500 mt-2">
                  Ventas encontradas: {sales.filter(sale => {
                    const saleDate = new Date(sale.date);
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    return saleDate >= start && saleDate <= end;
                  }).length}
                </p>
              )}
              {reportType === 'inventory-movements' && (
                <p className="text-xs text-gray-500 mt-2">
                  Ajustes encontrados: {inventoryAdjustments.filter(adj => {
                    const adjDate = new Date(adj.adjustmentDate);
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    return adjDate >= start && adjDate <= end;
                  }).length}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botón de generar */}
        <button
          onClick={handleGenerateReport}
          disabled={loading || !startDate || !endDate}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generando reporte...</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span>Generar Reporte PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

