import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { CashRegister as CashRegisterType, CashRegisterSummary } from '../../types';
import { cashRegisterService } from '../../services/cashRegisterService';
import { useToast } from '../../hooks/use-toast';

export const CashRegister: React.FC = () => {
  const [currentCashRegister, setCurrentCashRegister] = useState<CashRegisterType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [closeSummary, setCloseSummary] = useState<CashRegisterSummary | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentCashRegister();
  }, []);

  const loadCurrentCashRegister = async () => {
    try {
      setIsLoading(true);
      const response = await cashRegisterService.getCurrentOpenCashRegister();
      setCurrentCashRegister(response.data);
    } catch (error) {
      console.error('Error al cargar caja:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCashRegister = async () => {
    if (!initialAmount || parseFloat(initialAmount) < 0) {
      toast({
        title: 'Error',
        description: 'El monto inicial debe ser mayor o igual a 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await cashRegisterService.openCashRegister({
        initialAmount: parseFloat(initialAmount),
      });
      
      setCurrentCashRegister(response.data);
      setShowOpenModal(false);
      setInitialAmount('');
      
      toast({
        title: 'Caja abierta',
        description: response.message,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al abrir la caja',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCashRegister = async () => {
    if (!currentCashRegister) return;
    
    if (!actualAmount || parseFloat(actualAmount) < 0) {
      toast({
        title: 'Error',
        description: 'El monto real debe ser mayor o igual a 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await cashRegisterService.closeCashRegister({
        cashRegisterId: currentCashRegister.id,
        actualAmount: parseFloat(actualAmount),
        notes: notes || undefined,
      });
      
      setCloseSummary(response.summary || null);
      setCurrentCashRegister(null);
      setActualAmount('');
      setNotes('');
      
      toast({
        title: 'Caja cerrada',
        description: response.message,
      });
      
      // Mostrar resumen por 5 segundos
      setTimeout(() => {
        setShowCloseModal(false);
        setCloseSummary(null);
      }, 5000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cerrar la caja',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !currentCashRegister) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Caja</h2>
          <p className="text-gray-600">Apertura y cierre de caja registradora</p>
        </div>
        
        {!currentCashRegister && (
          <button
            onClick={() => setShowOpenModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <DollarSign className="h-5 w-5" />
            Abrir Caja
          </button>
        )}
      </div>

      {currentCashRegister ? (
        <div className="space-y-6">
          {/* Estado de la caja abierta */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Caja Abierta</h3>
                <p className="text-sm text-gray-600">
                  Apertura: {new Date(currentCashRegister.openingDate).toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Monto Inicial</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${currentCashRegister.initialAmount.toFixed(2)}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Usuario</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentCashRegister.users_permissions_user?.username || 'N/A'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Ventas Asociadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentCashRegister.sales?.length || 0}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCloseModal(true)}
              className="mt-4 w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="h-5 w-5" />
              Cerrar Caja
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay caja abierta</h3>
          <p className="text-gray-600 mb-4">Abre una caja para comenzar a registrar ventas</p>
          <button
            onClick={() => setShowOpenModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <DollarSign className="h-5 w-5" />
            Abrir Caja
          </button>
        </div>
      )}

      {/* Modal de Apertura */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Abrir Caja</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Inicial
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOpenModal(false);
                    setInitialAmount('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleOpenCashRegister}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Abriendo...' : 'Abrir Caja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cierre */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            {closeSummary ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Caja Cerrada</h3>
                  <p className="text-gray-600">Resumen del cierre</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto Inicial:</span>
                    <span className="font-semibold">${closeSummary.initialAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Ventas:</span>
                    <span className="font-semibold text-green-600">${closeSummary.totalSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Monto Esperado:</span>
                    <span className="font-semibold">${closeSummary.expectedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto Real:</span>
                    <span className="font-semibold">${closeSummary.actualAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-700 font-medium">Diferencia:</span>
                    <span className={`font-bold ${
                      closeSummary.difference > 0 ? 'text-green-600' : 
                      closeSummary.difference < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {closeSummary.difference > 0 ? '+' : ''}${closeSummary.difference.toFixed(2)}
                    </span>
                  </div>
                </div>

                {closeSummary.difference !== 0 && (
                  <div className={`p-3 rounded-lg ${
                    closeSummary.difference > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <p className="text-sm font-medium">
                      {closeSummary.difference > 0 
                        ? '✓ Hay un sobrante en caja' 
                        : '⚠ Hay un faltante en caja'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Cerrar Caja</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Monto Inicial:</strong> ${currentCashRegister?.initialAmount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Real en Caja *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={actualAmount}
                      onChange={(e) => setActualAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones del cierre..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCloseModal(false);
                      setActualAmount('');
                      setNotes('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCloseCashRegister}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Cerrando...' : 'Cerrar Caja'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
