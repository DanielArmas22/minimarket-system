import React, { useState } from 'react';
import { Product } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const Products: React.FC<ProductsProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    barCode: '',
    precioUnitario: 0,
    stock: '',
    stockMin: 0,
    unidadMedida: '',
  });

  const filteredProducts = products.filter(product =>
    product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Product = {
      id: editingProduct?.id || Date.now(),
      documentId: editingProduct?.documentId || '',
      descripcion: formData.descripcion,
      barCode: formData.barCode,
      precioUnitario: formData.precioUnitario,
      stock: formData.stock,
      stockMin: formData.stockMin,
      unidadMedida: formData.unidadMedida,
      createdAt: editingProduct?.createdAt || new Date(),
      updatedAt: new Date(),
      publishedAt: editingProduct?.publishedAt || new Date(),
      category: editingProduct?.category || { id: 1, documentId: '', descripcion: 'General', estado: true, createdAt: new Date(), updatedAt: new Date(), publishedAt: new Date() },
    };

    onSaveProduct(productData);
    resetForm();
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
              <TableHead>Descripción</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Stock Mín.</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.descripcion}</TableCell>
                <TableCell>{product.barCode}</TableCell>
                <TableCell>${product.precioUnitario.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`${parseInt(product.stock) <= product.stockMin ? 'text-red-600 font-semibold' : ''}`}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>{product.stockMin}</TableCell>
                <TableCell>{product.unidadMedida}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
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
    </div>
  );
};