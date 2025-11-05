import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, History, AlertCircle, Search } from 'lucide-react';
import { InventoryAdjustment as InventoryAdjustmentType, Product, AdjustmentType, AdjustmentReason } from '../../types';
import { inventoryAdjustmentService } from '../../services/inventoryAdjustmentService';
import { useToast } from '../../hooks/use-toast';

interface InventoryAdjustmentProps {
  products: Product[];
}

const reasonLabels: Record<AdjustmentReason, string> = {
  merma: 'Merma',
  conteo: 'Conteo',
  daño: 'Daño',
  devolucion: 'Devolución',
  correccion: 'Corrección',
  otro: 'Otro',
};

const reasonDescriptions: Record<AdjustmentReason, string> = {
  merma: 'Pérdida de producto (vencimiento, deterioro)',
  conteo: 'Ajuste por conteo físico',
  daño: 'Producto dañado',
  devolucion: 'Devolución de producto',
  correccion: 'Corrección de error',
  otro: 'Otro motivo',
};

export const InventoryAdjustment: React.FC<InventoryAdjustmentProps> = ({ products }) => {
  const [adjustments, setAdjustments] = useState<InventoryAdjustmentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productHistory, setProductHistory] = useState<InventoryAdjustmentType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('decrease');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<AdjustmentReason>('merma');
  const [reasonDescription, setReasonDescription] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = async () => {
    try {
      setIsLoading(true);
      const response = await inventoryAdjustmentService.getAllAdjustments();
      setAdjustments(response.data || []);
    } catch (error) {
      console.error('Error al cargar ajustes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentType('decrease');
    setQuantity('');
    setReason('merma');
    setReasonDescription('');
    setShowAdjustModal(true);
  };

  const handleAdjustInventory = async () => {
    if (!selectedProduct) return;

    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: 'Error',
        description: 'La cantidad debe ser mayor a 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await inventoryAdjustmentService.adjustInventory({
        productId: selectedProduct.id,
        adjustmentType,
        quantity: parseInt(quantity),
        reason,
        ...(reasonDescription.trim() && { reasonDescription: reasonDescription.trim() }),
      });

      toast({
        title: 'Ajuste realizado',
        description: response.message,
      });

      setShowAdjustModal(false);
      loadAdjustments();
      
      // Mostrar resumen
      if (response.summary) {
        toast({
          title: 'Resumen del ajuste',
          description: `Stock anterior: ${response.summary.previousStock} → Nuevo stock: ${response.summary.newStock}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al ajustar inventario',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowHistory = async (product: Product) => {
    setSelectedProduct(product);
    setShowHistoryModal(true);
    
    try {
      setIsLoading(true);
      const response = await inventoryAdjustmentService.getProductHistory(product.id);
      setProductHistory(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar historial',
        variant: 'destructive',
      });
      setProductHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAdjustmentTypeColor = (type: AdjustmentType) => {
    return type === 'increase' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getAdjustmentTypeIcon = (type: AdjustmentType) => {
    return type === 'increase' ? Plus : Minus;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ajuste de Inventario</h2>
        <p className="text-gray-600">Aumentar o disminuir stock de productos</p>
      </div>

      {/* Búsqueda de productos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar producto por nombre o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.descripcion}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.category?.descripcion}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.barCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                      parseInt(product.stock) <= product.stockMin
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock} {product.unidadMedida}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenAdjustModal(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ajustar
                    </button>
                    <button
                      onClick={() => handleShowHistory(product)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Historial reciente de ajustes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          Ajustes Recientes
        </h3>
        
        <div className="space-y-3">
          {adjustments.slice(0, 10).map((adjustment) => {
            const Icon = getAdjustmentTypeIcon(adjustment.adjustmentType);
            return (
              <div key={adjustment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getAdjustmentTypeColor(adjustment.adjustmentType)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {adjustment.product?.descripcion || 'Producto'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reasonLabels[adjustment.reason]} - {adjustment.quantity} unidades
                    </p>
                    {adjustment.reasonDescription && (
                      <p className="text-xs text-gray-400 mt-1">{adjustment.reasonDescription}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {adjustment.previousStock} → {adjustment.newStock}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(adjustment.adjustmentDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            );
          })}
          
          {adjustments.length === 0 && (
            <p className="text-center text-gray-500 py-4">No hay ajustes registrados</p>
          )}
        </div>
      </div>

      {/* Modal de Ajuste */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajustar Inventario</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-blue-900">{selectedProduct.descripcion}</p>
              <p className="text-sm text-blue-700">Stock actual: {selectedProduct.stock} {selectedProduct.unidadMedida}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Ajuste *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAdjustmentType('increase')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      adjustmentType === 'increase'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <Plus className="h-5 w-5 inline mr-2" />
                    Aumentar
                  </button>
                  <button
                    onClick={() => setAdjustmentType('decrease')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      adjustmentType === 'decrease'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <Minus className="h-5 w-5 inline mr-2" />
                    Disminuir
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ingrese cantidad"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(reasonLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{reasonDescriptions[reason]}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={reasonDescription}
                  onChange={(e) => setReasonDescription(e.target.value)}
                  placeholder="Detalles adicionales del ajuste..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdjustInventory}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                    adjustmentType === 'increase'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Ajustando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial */}
      {showHistoryModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Historial de Ajustes</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-blue-900">{selectedProduct.descripcion}</p>
              <p className="text-sm text-blue-700">Stock actual: {selectedProduct.stock} {selectedProduct.unidadMedida}</p>
            </div>

            <div className="space-y-3">
              {productHistory.map((adjustment) => {
                const Icon = getAdjustmentTypeIcon(adjustment.adjustmentType);
                return (
                  <div key={adjustment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getAdjustmentTypeColor(adjustment.adjustmentType)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {adjustment.adjustmentType === 'increase' ? 'Aumento' : 'Disminución'} de {adjustment.quantity} unidades
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(adjustment.adjustmentDate).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {adjustment.previousStock} → {adjustment.newStock}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Motivo:</span> {reasonLabels[adjustment.reason]}
                      </p>
                      {adjustment.reasonDescription && (
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Descripción:</span> {adjustment.reasonDescription}
                        </p>
                      )}
                      {adjustment.users_permissions_user && (
                        <p className="text-xs text-gray-500 mt-1">
                          Usuario: {adjustment.users_permissions_user.username}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {productHistory.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No hay ajustes registrados para este producto</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
