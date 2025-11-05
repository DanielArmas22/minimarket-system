import React, { useState, useMemo, useEffect } from 'react';
import { Search, Minus, Plus, Trash2, CreditCard, Banknote, Smartphone, Download, CheckCircle } from 'lucide-react';
import { Product, SaleItem, Sale, typePayment } from '../../types';
import axios from 'axios';
import { ticketService } from '../../services/ticketService';

interface POSProps {
  onSale: (sale: Sale) => void;
}

export const POS: React.FC<POSProps> = ({onSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<number | null>(null); // Cambiar a ID numérico
  const [products, setProducts] = useState<Product[]>([]);
  const [typePayment, setTypePayment] = useState<typePayment[]>([]);
  const [lastSale, setLastSale] = useState<Sale | null>(null); // Guardar última venta para generar ticket


  const obtenerProductos = async ()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/products?populate=category`,{
          // headers: {
          //   Authorization: `Bearer ${localStorage.getItem("token")}`
          // }
      });

      const responsePayment = await axios.get(`${import.meta.env.VITE_URL_API}/api/type-buys`);

      console.log('Respuesta productos:', response.data);
      console.log('Respuesta pagos:', responsePayment.data);

      // Validar y establecer productos
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }

      // Validar y establecer tipos de pago
      if (responsePayment.data && responsePayment.data.data) {
        setTypePayment(responsePayment.data.data);
        // Establecer el primer tipo de pago como predeterminado
        if (responsePayment.data.data.length > 0) {
          setPaymentMethod(responsePayment.data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
      // Asegurar que los estados tengan valores por defecto
      setProducts([]);
      setTypePayment([]);
    }
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

    try {
      const sale: Sale = {
        id: Date.now().toString(),
        items: cart,
        total: cartTotal,
        date: new Date().toISOString(),
        paymentMethod
      };

      const saleData = {
        data: {
          fechaVenta: new Date().toISOString(),
          totalVenta: cartTotal,  
          productosVendidos: cart,
          tipoPago: paymentMethod
        }
      };

      const response = await axios.post(`${import.meta.env.VITE_URL_API}/api/sales`, saleData);

      console.log('Venta procesada:', response.data);
      console.log('Venta procesada:', saleData);
      
      // Guardar la venta para generar ticket
      setLastSale(sale);
      
      onSale(sale);
      setCart([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      alert('Error al procesar la venta. Por favor, intente nuevamente.');
    }
  };

  const handleDownloadTicket = () => {
    if (!lastSale) return;
    
    try {
      ticketService.generateTicket(lastSale, typePayment);
    } catch (error) {
      console.error('Error al generar ticket:', error);
      alert('Error al generar el ticket. Por favor, intente nuevamente.');
    }
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
                <p className="text-xs text-gray-500 mt-1">{product.category?.descripcion || 'Sin categoría'}</p>
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

              {/* Botón para descargar ticket después de venta exitosa */}
              {lastSale && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Venta procesada exitosamente</p>
                  </div>
                  <button
                    onClick={handleDownloadTicket}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Ticket PDF
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};