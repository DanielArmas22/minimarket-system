import React, { useState, useMemo, useEffect } from 'react';
import { Search, Minus, Plus, Trash2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Product, SaleItem, Sale, typePayment } from '../../types';
import axios from 'axios';

interface POSProps {
  onSale: (sale: Sale) => void;
}

export const POS: React.FC<POSProps> = ({onSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<number | null>(null); // Cambiar a ID numérico
  const [products, setProducts] = useState<Product[]>([]);
  const [typePayment, setTypePayment] = useState<typePayment[]>([]);


  const obtenerProductos = async ()=>{

    const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/products?populate=category`,{
        // headers: {
        //   Authorization: `Bearer ${localStorage.getItem("token")}`
        // }
    });

    const responsePayment = await axios.get(`${import.meta.env.VITE_URL_API}/api/type-buys`);

    setTypePayment(responsePayment.data.data);
    // Establecer el primer tipo de pago como predeterminado
    if (responsePayment.data.data.length > 0) {
      setPaymentMethod(responsePayment.data.data[0].id);
    }
    console.log('Respuesta de la API:', response.data);
    setProducts(response.data.data); 
    
  }

  useEffect(()=>{
    obtenerProductos();
  },[]);
 
  const filteredProducts = useMemo(() => {
    // Verificar que products sea un array antes de filtrar
    if (!Array.isArray(products)) {
      return [];
    }
    
    return products.filter(product => 
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barCode.includes(searchTerm)
    );
  }, [products, searchTerm]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < parseInt(product.stock)) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        ));
      }
    } else {
      if (parseInt(product.stock) > 0) {
        setCart([...cart, {
          productId: product.id,
          productName: product.descripcion,
          quantity: 1,
          price: product.precioUnitario,
          subtotal: product.precioUnitario
        }]);
      }
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity === 0) {
      setCart(cart.filter(item => item.productId != productId));
    } else if (newQuantity <= parseInt(product.stock)) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      ));
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const processSale = async () => {
    if (cart.length === 0) return;

    const sale: Sale = {
      id: Date.now().toString(),
      items: cart,
      total: cartTotal,
      date: new Date().toISOString(),
      paymentMethod
    };

    const saleData = {
      data: {  // <- Agregar esta línea
        fechaVenta: new Date().toISOString(),
        totalVenta: cartTotal,  
        productosVendidos: cart,
        tipoPago: paymentMethod // Enviar el ID del tipo de pago seleccionado
      }  // <- Cerrar el objeto data
    };

    const response = await axios.post(`${import.meta.env.VITE_URL_API}/api/sales`, saleData);

    console.log('Venta procesada:', response.data);
    console.log('Venta procesada:', saleData);
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
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.descripcion} {product.unidadMedida}</h3>
                <p className="text-sm text-gray-600 mb-1">Stock: {product.stock}</p>
                <p className="text-lg font-bold text-blue-600">${product.precioUnitario.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{product.category.descripcion}</p>
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
                <div className={`grid gap-2 ${typePayment.length <= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {typePayment.map((payment) => (
                    <button
                      key={payment.id}
                      onClick={() => setPaymentMethod(payment.id)}
                      className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                        paymentMethod === payment.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {/* Iconos dinámicos basados en el nombre del tipo de pago */}
                      {payment.descripcion?.toLowerCase().includes('efectivo') || payment.descripcion?.toLowerCase().includes('cash') ? (
                        <Banknote className="h-5 w-5 mb-1" />
                      ) : payment.descripcion?.toLowerCase().includes('tarjeta') || payment.descripcion?.toLowerCase().includes('card') ? (
                        <CreditCard className="h-5 w-5 mb-1" />
                      ) : payment.descripcion?.toLowerCase().includes('transfer') || payment.descripcion?.toLowerCase().includes('yape') || payment.descripcion?.toLowerCase().includes('plin') ? (
                        <Smartphone className="h-5 w-5 mb-1" />
                      ) : (
                        <CreditCard className="h-5 w-5 mb-1" />
                      )}
                      <span className="text-xs text-center">{payment.descripcion}</span>
                    </button>
                  ))}
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