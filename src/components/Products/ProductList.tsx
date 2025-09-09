import React, { useState } from 'react';
import { Package, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onEdit, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Lista de Productos</h3>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="bg-gray-50 p-2 rounded-lg">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(product)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{product.category}</p>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
              <div className={`flex items-center gap-1 ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-600'}`}>
                {product.stock <= product.minStock && <AlertTriangle className="h-4 w-4" />}
                <span className="text-sm">Stock: {product.stock}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500">Código: {product.barcode}</p>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
};