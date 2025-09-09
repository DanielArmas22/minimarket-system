import React, { useState, useMemo } from 'react';
import { Search, Minus, Plus, Trash2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Product, SaleItem, Sale } from '../../types';

interface POSProps {
  products: Product[];
  onSale: (sale: Sale) => void;
}

export const POS: React.FC<POSProps> = ({ products, onSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');

  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
    );
  }, [products, searchTerm]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        ));
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
          subtotal: product.price
        }]);
      }
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity === 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else if (newQuantity <= product.stock) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const processSale = () => {
    if (cart.length === 0) return;

    const sale: Sale = {
      id: Date.now().toString(),
      items: cart,
      total: cartTotal,
      date: new Date().toISOString(),
      paymentMethod
    };

    onSale(sale);
    setCart([]);
    setSearchTerm('');
  };

  return (
    <div className="p-4 md:p-6 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Punto de Venta</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar producto por nombre o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Stock: {product.stock}</p>
                <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{product.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Carrito de Compras</h3>
          
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {cart.length === 0 && (
              <p className="text-gray-500 text-center py-8">Carrito vacío</p>
            )}
          </div>

          {cart.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-blue-600">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Banknote className="h-5 w-5 mb-1" />
                    <span className="text-xs">Efectivo</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mb-1" />
                    <span className="text-xs">Tarjeta</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                      paymentMethod === 'transfer'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Smartphone className="h-5 w-5 mb-1" />
                    <span className="text-xs">Transfer.</span>
                  </button>
                </div>
              </div>

              <button
                onClick={processSale}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Procesar Venta
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};