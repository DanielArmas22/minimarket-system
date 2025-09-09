import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../../types';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';

interface ProductsProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const Products: React.FC<ProductsProps> = ({ 
  products, 
  onSaveProduct, 
  onDeleteProduct 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = (product: Product) => {
    onSaveProduct(product);
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleDelete = (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      onDeleteProduct(productId);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Productos</h2>
          <p className="text-gray-600">Administra el inventario de tu minimarket</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 justify-center"
        >
          <Plus className="h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      <ProductList
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
};