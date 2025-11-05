import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, CreditCard, Banknote, Smartphone, BarChart, Download } from 'lucide-react';
import { Sale } from '../../types';
import { ticketService } from '../../services/ticketService';

interface SalesProps {
  sales: Sale[];
}

export const Sales: React.FC<SalesProps> = ({ sales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDate = !selectedDate || 
        new Date(sale.date).toDateString() === new Date(selectedDate).toDateString();
      
      const matchesPayment = selectedPaymentMethod === 'all' || 
        sale.paymentMethod === selectedPaymentMethod;

      return matchesSearch && matchesDate && matchesPayment;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchTerm, selectedDate, selectedPaymentMethod]);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return Banknote;
      case 'card': return CreditCard;
      case 'transfer': return Smartphone;
      default: return CreditCard;
    }
  };

  const handleDownloadTicket = (sale: Sale) => {
    try {
      ticketService.generateTicket(sale);
    } catch (error) {
      console.error('Error al generar ticket:', error);
      alert('Error al generar el ticket. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Historial de Ventas</h2>
        <p className="text-gray-600">Consulta todas las transacciones realizadas</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSales.map((sale) => {
          const PaymentIcon = getPaymentIcon(sale.paymentMethod);
          return (
            <div key={sale.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <PaymentIcon className="h-5 w-5 text-green-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Venta #{sale.id}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(sale.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {sale.customerName && (
                      <p className="text-sm text-gray-600">Cliente: {sale.customerName}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">${sale.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{getPaymentLabel(sale.paymentMethod)}</p>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadTicket(sale)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    title="Descargar ticket PDF"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Ticket</span>
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h5 className="font-medium text-gray-900 mb-2">Productos:</h5>
                <div className="space-y-1">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{item.productName} x{item.quantity}</span>
                      <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <BarChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No se encontraron ventas</p>
        </div>
      )}
    </div>
  );
};