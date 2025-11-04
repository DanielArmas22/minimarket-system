import React, { useState, useEffect } from 'react';
import { OrderBuy, Provider, Product, DetailOrderBuy } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Search, ShoppingCart, Package, Eye, X, CheckCircle } from 'lucide-react';
import axios from 'axios';

export const OrderBuyComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderBuy | null>(null);
  const [orders, setOrders] = useState<OrderBuy[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [igv, setIgv] = useState<number>(18);
  const [fechaEntrega, setFechaEntrega] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<Array<{product: number, cantidad: number, productName: string}>>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);

  useEffect(() => {
    obtenerOrdenes();
    obtenerProveedores();
    obtenerProductos();
  }, []);

  const obtenerOrdenes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/order-buys?populate=*`
      );
      console.log('Órdenes obtenidas:', response.data);
      
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      setOrders([]);
    }
  };

  const obtenerProveedores = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/providers`);
      console.log('Proveedores obtenidos:', response.data);
      
      if (response.data && response.data.data) {
        setProviders(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      setProviders([]);
    }
  };

  const obtenerProductos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/products`);
      console.log('Productos obtenidos:', response.data);
      
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setProducts([]);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.provider?.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const agregarProductoDetalle = () => {
    if (!selectedProduct || cantidad <= 0) {
      alert('Seleccione un producto y cantidad válida');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    setOrderDetails([...orderDetails, {
      product: selectedProduct,
      cantidad: cantidad,
      productName: product.descripcion
    }]);

    setSelectedProduct(null);
    setCantidad(1);
  };

  const eliminarProductoDetalle = (index: number) => {
    setOrderDetails(orderDetails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProvider) {
      alert('Seleccione un proveedor');
      return;
    }

    if (orderDetails.length === 0) {
      alert('Agregue al menos un producto');
      return;
    }

    try {
      const token = localStorage.getItem('jwt');

      // Crear la orden de compra
      const orderData = {
        data: {
          fechaOrden: new Date().toISOString(),
          FechaEntrega: fechaEntrega ? new Date(fechaEntrega).toISOString() : null,
          estado: false, // false = pendiente, true = entregado
          igv: igv,
          provider: selectedProvider
        }
      };

      console.log('Creando orden:', orderData);

      const orderResponse = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/order-buys`,
        orderData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      console.log('Orden creada:', orderResponse.data);

      const orderId = orderResponse.data.data.id;

      // Crear los detalles de la orden
      for (const detail of orderDetails) {
        const detailData = {
          data: {
            cantidad: detail.cantidad,
            product: detail.product,
            order_buy: orderId
          }
        };

        await axios.post(
          `${import.meta.env.VITE_URL_API}/api/detail-order-buys`,
          detailData,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );

        // NO actualizar el stock aún, se actualizará cuando se marque como entregado
      }

      alert('Orden de compra registrada exitosamente. Stock actualizado.');
      resetForm();
      await obtenerOrdenes();
      await obtenerProductos();
    } catch (error: any) {
      console.error('Error al guardar orden:', error);
      alert(`Error al guardar la orden: ${error.response?.data?.error?.message || 'Por favor, intente nuevamente.'}`);
    }
  };

  const resetForm = () => {
    setSelectedProvider(null);
    setIgv(18);
    setFechaEntrega('');
    setOrderDetails([]);
    setSelectedProduct(null);
    setCantidad(1);
    setShowForm(false);
  };

  const handleVerDetalles = (order: OrderBuy) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleMarcarEntregado = async () => {
    if (!selectedOrder) return;

    try {
      const token = localStorage.getItem('jwt');

      const updateData = {
        data: {
          estado: true,
          FechaEntrega: new Date().toISOString()
        }
      };

      console.log('Actualizando orden:', selectedOrder.documentId);
      console.log('Datos a enviar:', updateData);

      // Actualizar la orden a estado entregado con la fecha actual
      const response = await axios.put(
        `${import.meta.env.VITE_URL_API}/api/order-buys/${selectedOrder.documentId}`,
        updateData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      console.log('Respuesta actualización orden:', response.data);

      // Actualizar el stock de cada producto
      if (selectedOrder.detail_order_buys && selectedOrder.detail_order_buys.length > 0) {
        for (const detail of selectedOrder.detail_order_buys) {
          const product = products.find(p => p.id === detail.product?.id);
          if (product) {
            const nuevoStock = parseInt(product.stock) + detail.cantidad;
            await axios.put(
              `${import.meta.env.VITE_URL_API}/api/products/${product.documentId}`,
              {
                data: {
                  stock: nuevoStock.toString()
                }
              },
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              }
            );
          }
        }
      }

      alert('Orden marcada como entregada y stock actualizado');
      setShowModal(false);
      setSelectedOrder(null);
      await obtenerOrdenes();
      await obtenerProductos();
    } catch (error: any) {
      console.error('Error al marcar como entregado:', error);
      console.error('Detalles del error:', error.response?.data);
      alert(`Error: ${error.response?.data?.error?.message || error.message || 'No se pudo actualizar la orden'}`);
    }
  };

  if (showForm) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nueva Orden de Compra</h2>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="provider">Proveedor</Label>
                <select
                  id="provider"
                  value={selectedProvider || ''}
                  onChange={(e) => setSelectedProvider(Number(e.target.value))}
                  className="w-full border rounded-md p-2"
                  required
                >
                  <option value="">Seleccione un proveedor</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.razonSocial} - {provider.ruc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="fechaEntrega">Fecha Entrega Estimada</Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="igv">IGV (%)</Label>
                <Input
                  id="igv"
                  type="number"
                  step="0.01"
                  value={igv}
                  onChange={(e) => setIgv(parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Agregar Productos</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-2">
                  <Label htmlFor="product">Producto</Label>
                  <select
                    id="product"
                    value={selectedProduct || ''}
                    onChange={(e) => setSelectedProduct(Number(e.target.value))}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Seleccione un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.descripcion} (Stock actual: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button type="button" onClick={agregarProductoDetalle} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>

              {orderDetails.length > 0 && (
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.productName}</TableCell>
                          <TableCell>{detail.cantidad}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => eliminarProductoDetalle(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Registrar Orden
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Fecha Orden</TableHead>
              <TableHead className="text-center">Fecha Entrega</TableHead>
              <TableHead className="text-center">Proveedor</TableHead>
              <TableHead className="text-center">RUC</TableHead>
              <TableHead className="text-center">IGV (%)</TableHead>
              <TableHead className="text-center">Productos</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="text-center">
                  {new Date(order.fechaOrden).toLocaleDateString('es-PE')}
                </TableCell>
                <TableCell className="text-center">
                  {order.fechaEntrega 
                    ? new Date(order.fechaEntrega).toLocaleDateString('es-PE')
                    : '-'}
                </TableCell>
                <TableCell className="text-center">{order.provider?.razonSocial}</TableCell>
                <TableCell className="text-center">{order.provider?.ruc}</TableCell>
                <TableCell className="text-center">{order.igv}%</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center">
                    <Package className="h-4 w-4 mr-1" />
                    {order.detail_order_buys?.length || 0}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.estado 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {order.estado ? 'Entregada' : 'Pendiente'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    onClick={() => handleVerDetalles(order)}
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Detalles */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Detalles de la Orden</h3>
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label>Proveedor</Label>
                <p className="font-semibold">{selectedOrder.provider?.razonSocial}</p>
              </div>
              <div>
                <Label>RUC</Label>
                <p className="font-semibold">{selectedOrder.provider?.ruc}</p>
              </div>
              <div>
                <Label>Teléfono</Label>
                <p className="font-semibold">{selectedOrder.provider?.telefono || '-'}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="font-semibold">{selectedOrder.provider?.email || '-'}</p>
              </div>
              <div>
                <Label>Fecha de Orden</Label>
                <p className="font-semibold">
                  {new Date(selectedOrder.fechaOrden).toLocaleDateString('es-PE')}
                </p>
              </div>
              <div>
                <Label>Fecha Entrega Estimada</Label>
                <p className="font-semibold">
                  {selectedOrder.fechaEntrega 
                    ? new Date(selectedOrder.fechaEntrega).toLocaleDateString('es-PE')
                    : '-'}
                </p>
              </div>
              <div>
                <Label>IGV</Label>
                <p className="font-semibold">{selectedOrder.igv}%</p>
              </div>
              <div>
                <Label>Estado</Label>
                <p className={`font-semibold ${selectedOrder.estado ? 'text-green-600' : 'text-orange-600'}`}>
                  {selectedOrder.estado ? 'Entregada' : 'Pendiente'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Productos</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.detail_order_buys?.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.product?.descripcion || 'Producto no disponible'}</TableCell>
                      <TableCell className="text-center">{detail.cantidad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {!selectedOrder.estado && (
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cerrar
                </Button>
                <Button onClick={handleMarcarEntregado} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Entregada
                </Button>
              </div>
            )}

            {selectedOrder.estado && (
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron órdenes de compra
        </div>
      )}
    </div>
  );
};
