import React, { useState, useEffect } from 'react';
import { Product, Promotion, ProductPromotion } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, History, Tag } from 'lucide-react';
import axios from 'axios';

interface ProductsProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const Products: React.FC<ProductsProps> = ({
  products: propsProducts,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [showPromotions, setShowPromotions] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [productPromotions, setProductPromotions] = useState<ProductPromotion[]>([]);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    barCode: '',
    precioUnitario: 0,
    stock: '',
    stockMin: 0,
    unidadMedida: '',
  });

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/products?populate=category`);
      console.log('Productos obtenidos:', response.data);
      
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setProducts([]);
    }
  };

  const obtenerHistorialPrecios = async (productId: number) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/price-history-products?filters[product][id][$eq]=${productId}&populate=product&sort=fechaActualizacion:desc`
      );
      console.log('Historial obtenido:', response.data);
      
      if (response.data && response.data.data) {
        setPriceHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener historial:', error);
      setPriceHistory([]);
    }
  };

  const handleViewHistory = async (product: Product) => {
    setSelectedProduct(product);
    await obtenerHistorialPrecios(product.id);
    setShowHistory(true);
  };

  const obtenerPromociones = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/promotions`);
      console.log('Promociones obtenidas:', response.data);
      
      if (response.data && response.data.data) {
        setPromotions(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      setPromotions([]);
    }
  };

  const obtenerPromocionesProducto = async (productId: number) => {
    try {
      // Obtener todas las producto-promocion con populate
      const response = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/producto-promocions?populate=*`
      );
      console.log('Todas las promociones de productos:', response.data);
      
      if (response.data && response.data.data) {
        // Filtrar en el cliente las promociones de este producto y que tengan promotion no null
        const filtered = response.data.data.filter((pp: any) => 
          pp.product?.id === productId && pp.promotion !== null
        );
        console.log('Promociones filtradas para producto', productId, ':', filtered);
        setProductPromotions(filtered);
      }
    } catch (error) {
      console.error('Error al obtener promociones del producto:', error);
      setProductPromotions([]);
    }
  };

  const handleViewPromotions = async (product: Product) => {
    setSelectedProduct(product);
    await obtenerPromociones();
    await obtenerPromocionesProducto(product.id);
    setShowPromotions(true);
  };

  const handleAddPromotion = async () => {
    if (!selectedProduct || !selectedPromotion) return;

    try {
      const token = localStorage.getItem('jwt');
      
      // Intentar diferentes estructuras según la versión de Strapi
      const dataV5 = {
        data: {
          promotion: selectedPromotion,
          product: selectedProduct.id
        }
      };

      console.log('Datos a enviar:', JSON.stringify(dataV5, null, 2));
      
      const response = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/producto-promocions`, 
        dataV5,
        {
          headers: token ? {
            Authorization: `Bearer ${token}`
          } : {}
        }
      );
      console.log('Promoción añadida al producto:', response.data);
      
      // Recargar promociones del producto
      await obtenerPromocionesProducto(selectedProduct.id);
      setShowPromotionForm(false);
      setSelectedPromotion(null);
    } catch (error: any) {
      console.error('Error al añadir promoción:', error);
      console.error('Detalles completos del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          data: error.config?.data
        }
      });
      
      const errorMsg = error.response?.data?.error?.message || error.message || 'Error desconocido';
      alert(`Error al añadir la promoción:\n${errorMsg}`);
    }
  };

  const handleRemovePromotion = async (productPromotion: any) => {
    try {
      await axios.delete(`${import.meta.env.VITE_URL_API}/api/producto-promocions/${productPromotion.documentId}`);
      console.log('Promoción eliminada');
      
      // Recargar promociones del producto
      if (selectedProduct) {
        await obtenerPromocionesProducto(selectedProduct.id);
      }
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      alert('Error al eliminar la promoción. Por favor, intente nuevamente.');
    }
  };

  const filteredProducts = products.filter(product =>
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barCode.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        data: {
          descripcion: formData.descripcion,
          barCode: formData.barCode,
          precioUnitario: formData.precioUnitario,
          stock: formData.stock,
          stockMin: formData.stockMin,
          unidadMedida: formData.unidadMedida,
        }
      };

      if (editingProduct) {
        // Verificar si el precio cambió
        const precioAnterior = editingProduct.precioUnitario;
        const precioNuevo = formData.precioUnitario;
        
        // Actualizar producto existente usando documentId
        const response = await axios.put(
          `${import.meta.env.VITE_URL_API}/api/products/${editingProduct.documentId}`,
          productData
        );
        console.log('Producto actualizado:', response.data);

        // Si el precio cambió, registrar en el historial
        if (precioAnterior !== precioNuevo) {
          const historialData = {
            data: {
              precio: precioNuevo,
              fechaActualizacion: new Date().toISOString(),
              product: editingProduct.id
            }
          };

          await axios.post(
            `${import.meta.env.VITE_URL_API}/api/price-history-products`,
            historialData
          );
          console.log('Historial de precio registrado');
        }
      } else {
        // Crear nuevo producto
        const response = await axios.post(
          `${import.meta.env.VITE_URL_API}/api/products`,
          productData
        );
        console.log('Producto creado:', response.data);

        // Registrar precio inicial en el historial
        if (response.data && response.data.data) {
          const historialData = {
            data: {
              precio: formData.precioUnitario,
              fechaActualizacion: new Date().toISOString(),
              product: response.data.data.id
            }
          };

          await axios.post(
            `${import.meta.env.VITE_URL_API}/api/price-history-products`,
            historialData
          );
          console.log('Precio inicial registrado en historial');
        }
      }

      // Recargar la lista de productos
      await obtenerProductos();
      resetForm();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto. Por favor, intente nuevamente.');
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      barCode: '',
      precioUnitario: 0,
      stock: '',
      stockMin: 0,
      unidadMedida: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      descripcion: product.descripcion,
      barCode: product.barCode,
      precioUnitario: product.precioUnitario,
      stock: product.stock,
      stockMin: product.stockMin,
      unidadMedida: product.unidadMedida,
    });
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    onDeleteProduct(productId);
  };

  if (showForm) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="barCode">Código de Barras</Label>
              <Input
                id="barCode"
                value={formData.barCode}
                onChange={(e) => setFormData({ ...formData, barCode: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precioUnitario">Precio Unitario</Label>
                <Input
                  id="precioUnitario"
                  type="number"
                  step="0.01"
                  value={formData.precioUnitario}
                  onChange={(e) => setFormData({ ...formData, precioUnitario: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="unidadMedida">Unidad de Medida</Label>
                <Input
                  id="unidadMedida"
                  value={formData.unidadMedida}
                  onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="stockMin">Stock Mínimo</Label>
                <Input
                  id="stockMin"
                  type="number"
                  value={formData.stockMin}
                  onChange={(e) => setFormData({ ...formData, stockMin: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {editingProduct ? 'Actualizar' : 'Crear'} Producto
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
        <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar productos..."
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
              <TableHead className="text-center">Descripción</TableHead>
              <TableHead className="text-center">Código</TableHead>
              <TableHead className="text-center">Precio</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center">Stock Mín.</TableHead>
              <TableHead className="text-center">Unidad</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-center">{product.descripcion}</TableCell>
                <TableCell className="text-center">{product.barCode}</TableCell>
                <TableCell className="text-center">${product.precioUnitario.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <span className={`${parseInt(product.stock) <= product.stockMin ? 'text-red-600 font-semibold' : ''}`}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="text-center">{product.stockMin}</TableCell>
                <TableCell className="text-center">{product.unidadMedida}</TableCell>
                <TableCell className="text-center">
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewHistory(product)}
                      title="Ver historial de precios"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPromotions(product)}
                      title="Gestionar promociones"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El producto será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(product.id.toString())}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron productos
        </div>
      )}

      {/* Modal de Historial de Precios */}
      <AlertDialog open={showHistory} onOpenChange={setShowHistory}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Historial de Precios - {selectedProduct?.descripcion}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Registro de cambios de precio del producto
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.length > 0 ? (
                  priceHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>
                        {new Date(history.fechaActualizacion).toLocaleString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${history.precio?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500">
                      No hay historial de precios registrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowHistory(false)}>
              Cerrar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Promociones */}
      <AlertDialog open={showPromotions} onOpenChange={setShowPromotions}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Gestionar Promociones - {selectedProduct?.descripcion}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Asigna o elimina promociones para este producto
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {/* Botón para añadir nueva promoción */}
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowPromotionForm(!showPromotionForm)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Promoción
              </Button>
            </div>

            {/* Formulario para añadir promoción */}
            {showPromotionForm && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label>Seleccionar Promoción</Label>
                <div className="flex gap-2 mt-2">
                  <select
                    className="flex-1 border rounded-md p-2"
                    value={selectedPromotion || ''}
                    onChange={(e) => setSelectedPromotion(Number(e.target.value))}
                  >
                    <option value="">Selecciona una promoción</option>
                    {promotions.map((promo) => (
                      <option key={promo.id} value={promo.id}>
                        {promo.descripcion} - {promo.descuento}% ({promo.tipoPromocion})
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAddPromotion} disabled={!selectedPromotion}>
                    Agregar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowPromotionForm(false);
                      setSelectedPromotion(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de promociones activas */}
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promoción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productPromotions.length > 0 ? (
                    productPromotions.map((pp) => {
                      // Validar que promotion no sea null
                      if (!pp.promotion) return null;
                      
                      return (
                        <TableRow key={pp.id}>
                          <TableCell>{pp.promotion.descripcion}</TableCell>
                          <TableCell>{pp.promotion.tipoPromocion}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {pp.promotion.descuento}%
                          </TableCell>
                          <TableCell>
                            {new Date(pp.promotion.fechaInicio).toLocaleDateString('es-PE')}
                          </TableCell>
                          <TableCell>
                            {new Date(pp.promotion.fechaFin).toLocaleDateString('es-PE')}
                          </TableCell>
                          <TableCell>{pp.promotion.cantidadProducto}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              pp.promotion.estado 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {pp.promotion.estado ? 'Activa' : 'Inactiva'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemovePromotion(pp)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500">
                        No hay promociones asignadas a este producto
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPromotions(false);
              setShowPromotionForm(false);
              setSelectedPromotion(null);
            }}>
              Cerrar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};