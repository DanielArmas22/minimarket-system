import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, Check, X, Eye } from 'lucide-react';
import { OrderBuy as OrderBuyType, Product, Provider, OrderBuyStatus } from '../../types';
import { orderBuyService } from '../../services/orderBuyService';
import { providerService } from '../../services/providerService';
import { useToast } from '../../hooks/use-toast';

interface OrderBuyProps {
  products: Product[];
}

interface OrderProduct {
  productId: number;
  productName: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export const OrderBuy: React.FC<OrderBuyProps> = ({ products }) => {
  const [orders, setOrders] = useState<OrderBuyType[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderBuyType | null>(null);
  
  // Form state
  const [selectedProviderId, setSelectedProviderId] = useState<number>(0);
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [igvPorcentaje, setIgvPorcentaje] = useState('18');
  const [observaciones, setObservaciones] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    loadProviders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderBuyService.getAllOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await providerService.getAllProviders();
      setProviders(response.data || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los proveedores',
        variant: 'destructive',
      });
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductId || !cantidad || !precioUnitario) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos del producto',
        variant: 'destructive',
      });
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const cantidadNum = parseInt(cantidad);
    const precioNum = parseFloat(precioUnitario);

    if (cantidadNum <= 0 || precioNum <= 0) {
      toast({
        title: 'Error',
        description: 'La cantidad y el precio deben ser mayores a 0',
        variant: 'destructive',
      });
      return;
    }

    const newProduct: OrderProduct = {
      productId: product.id,
      productName: product.descripcion,
      cantidad: cantidadNum,
      precioUnitario: precioNum,
      subtotal: cantidadNum * precioNum,
    };

    setOrderProducts([...orderProducts, newProduct]);
    setSelectedProductId(0);
    setCantidad('');
    setPrecioUnitario('');
  };

  const handleRemoveProduct = (index: number) => {
    setOrderProducts(orderProducts.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = orderProducts.reduce((sum, p) => sum + p.subtotal, 0);
    const igv = subtotal * (parseFloat(igvPorcentaje) / 100);
    const total = subtotal + igv;
    return { subtotal, igv, total };
  };

  const handleCreateOrder = async () => {
    if (!selectedProviderId) {
      toast({
        title: 'Error',
        description: 'Seleccione un proveedor',
        variant: 'destructive',
      });
      return;
    }

    if (orderProducts.length === 0) {
      toast({
        title: 'Error',
        description: 'Agregue al menos un producto',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await orderBuyService.createOrder({
        providerId: selectedProviderId,
        productos: orderProducts.map(p => ({
          productId: p.productId,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
        })),
        igvPorcentaje: parseFloat(igvPorcentaje),
        observaciones: observaciones || undefined,
      });

      toast({
        title: 'Orden creada',
        description: response.message,
      });

      resetForm();
      setShowCreateModal(false);
      loadOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear orden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiveOrder = async (orderId: number) => {
    if (!confirm('¿Está seguro de recibir esta orden? Se actualizará el stock de todos los productos.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await orderBuyService.receiveOrder({ orderId });

      toast({
        title: 'Orden recibida',
        description: response.message,
      });

      if (response.updatedProducts && response.updatedProducts.length > 0) {
        const updates = response.updatedProducts.map(p => 
          `${p.productName}: ${p.previousStock} → ${p.newStock}`
        ).join('\n');
        
        toast({
          title: 'Stock actualizado',
          description: updates,
        });
      }

      loadOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al recibir orden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const motivo = prompt('Ingrese el motivo de la cancelación:');
    if (!motivo) return;

    try {
      setIsLoading(true);
      const response = await orderBuyService.cancelOrder({ orderId, motivo });

      toast({
        title: 'Orden cancelada',
        description: response.message,
      });

      loadOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cancelar orden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProviderId(0);
    setOrderProducts([]);
    setSelectedProductId(0);
    setCantidad('');
    setPrecioUnitario('');
    setIgvPorcentaje('18');
    setObservaciones('');
  };

  const getStatusColor = (estado: OrderBuyStatus) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'recibida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estado: OrderBuyStatus) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'recibida':
        return 'Recibida';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const totals = calculateTotals();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Órdenes de Compra</h2>
          <p className="text-gray-600">Gestión de órdenes de compra a proveedores</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nueva Orden
        </button>
      </div>

      {/* Lista de órdenes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.fechaOrden).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.provider?.razonSocial || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    S/ {order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.estado)}`}>
                      {getStatusLabel(order.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4 inline" />
                    </button>
                    {order.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleReceiveOrder(order.id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={isLoading}
                        >
                          <Check className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 inline" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No hay órdenes de compra registradas</p>
          </div>
        )}
      </div>

      {/* Modal de Crear Orden */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nueva Orden de Compra</h3>
            
            <div className="space-y-4">
              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor *
                </label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Seleccione un proveedor</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.razonSocial} - {provider.ruc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agregar Productos */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Agregar Productos</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Seleccione producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.descripcion}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Cantidad"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    placeholder="Precio unitario"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-5 w-5 inline" />
                  </button>
                </div>
              </div>

              {/* Lista de Productos */}
              {orderProducts.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Precio Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orderProducts.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{product.productName}</td>
                          <td className="px-4 py-2 text-sm">{product.cantidad}</td>
                          <td className="px-4 py-2 text-sm">S/ {product.precioUnitario.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-semibold">S/ {product.subtotal.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleRemoveProduct(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totales */}
              {orderProducts.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">S/ {totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span>IGV ({igvPorcentaje}%):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={igvPorcentaje}
                        onChange={(e) => setIgvPorcentaje(e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                      <span className="font-semibold">S/ {totals.igv.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>S/ {totals.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles adicionales de la orden..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading || orderProducts.length === 0}
                >
                  {isLoading ? 'Creando...' : 'Crear Orden'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detalle de Orden #{selectedOrder.id}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha:</p>
                  <p className="font-semibold">{new Date(selectedOrder.fechaOrden).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado:</p>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.estado)}`}>
                    {getStatusLabel(selectedOrder.estado)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proveedor:</p>
                  <p className="font-semibold">{selectedOrder.provider?.razonSocial}</p>
                  <p className="text-sm text-gray-500">RUC: {selectedOrder.provider?.ruc}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usuario:</p>
                  <p className="font-semibold">{selectedOrder.users_permissions_user?.username || 'N/A'}</p>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Productos</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Precio Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.detail_order_buys?.map((detail) => (
                        <tr key={detail.id}>
                          <td className="px-4 py-2 text-sm">{detail.product?.descripcion}</td>
                          <td className="px-4 py-2 text-sm">{detail.cantidad}</td>
                          <td className="px-4 py-2 text-sm">S/ {detail.precioUnitario.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-semibold">S/ {detail.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-semibold">S/ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IGV:</span>
                  <span className="font-semibold">S/ {selectedOrder.igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>S/ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Observaciones */}
              {selectedOrder.observaciones && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Observaciones:</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedOrder.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
