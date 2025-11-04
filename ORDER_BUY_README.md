# HU10 - Órdenes de Compra

## Descripción
Funcionalidad implementada para registrar nuevas órdenes de compra a proveedores con detalles de productos, cantidades y costos. Permite crear, recibir (actualizando stock) y cancelar órdenes.

## Archivos Creados/Modificados

### Nuevos Archivos
1. **`src/components/OrderBuy/OrderBuy.tsx`**
   - Componente principal de la interfaz de usuario
   - Tabla de órdenes con filtros y acciones
   - Modal para crear órdenes con múltiples productos
   - Modal para ver detalles de órdenes
   - Funciones para recibir y cancelar órdenes

2. **`src/services/orderBuyService.ts`**
   - Servicio para comunicación con la API
   - Métodos: `createOrder`, `receiveOrder`, `cancelOrder`, `getAllOrders`, `getOrderById`

3. **`src/services/providerService.ts`**
   - Servicio para obtener proveedores
   - Métodos: `getAllProviders`, `getProviderById`

### Archivos Modificados
1. **`src/types/index.ts`**
   - Agregadas interfaces: `OrderBuy`, `DetailOrderBuy`, `Provider`, `OrderBuySummary`, `UpdatedProduct`
   - Agregado tipo `OrderBuyStatus`

2. **`src/components/Layout/Navigation.tsx`**
   - Agregado ítem de navegación "Órdenes Compra" con ícono ShoppingBag

3. **`src/App.tsx`**
   - Importado componente `OrderBuy`
   - Agregado caso `order-buy` en el switch de renderizado

## Funcionalidades Implementadas

### 1. Lista de Órdenes
- Tabla con todas las órdenes de compra
- Información mostrada:
  - Número de orden
  - Fecha
  - Proveedor
  - Total
  - Estado (Pendiente/Recibida/Cancelada)
- Acciones disponibles según estado:
  - 👁 Ver detalle (todas)
  - ✓ Recibir orden (solo pendientes)
  - ✕ Cancelar orden (solo pendientes)

### 2. Crear Orden de Compra
- Modal interactivo para crear órdenes
- Selección de proveedor (requerido)
- Agregar múltiples productos:
  - Seleccionar producto
  - Ingresar cantidad
  - Ingresar precio unitario de compra
  - Agregar a la lista
  - Eliminar productos de la lista
- Cálculo automático de totales:
  - Subtotal por producto
  - Subtotal general
  - IGV (configurable, por defecto 18%)
  - Total con IGV
- Campo opcional para observaciones
- Validaciones:
  - Proveedor requerido
  - Al menos un producto
  - Cantidades > 0
  - Precios > 0

### 3. Recibir Orden
- Confirma la recepción de mercadería
- Actualiza automáticamente el stock de todos los productos
- Muestra resumen de productos actualizados:
  - Stock anterior → Stock nuevo
  - Cantidad agregada
- Cambia el estado a "recibida"
- Confirmación antes de ejecutar

### 4. Cancelar Orden
- Permite cancelar órdenes pendientes
- Solicita motivo de cancelación
- Agrega el motivo a las observaciones
- Cambia el estado a "cancelada"
- Solo disponible para órdenes pendientes

### 5. Ver Detalle de Orden
- Modal con información completa:
  - Datos generales (fecha, estado, proveedor, usuario)
  - Lista de productos con cantidades y precios
  - Totales (subtotal, IGV, total)
  - Observaciones

## Estados de la Orden

| Estado | Color | Descripción | Acciones Disponibles |
|--------|-------|-------------|---------------------|
| **Pendiente** | 🟡 Amarillo | Orden creada, esperando recepción | Recibir, Cancelar, Ver |
| **Recibida** | 🟢 Verde | Orden recibida, stock actualizado | Ver |
| **Cancelada** | 🔴 Rojo | Orden cancelada | Ver |

## Endpoints de API Utilizados

### Crear Orden
```
POST /api/order-buys/create-order
Body: {
  providerId: number,
  productos: [{
    productId: number,
    cantidad: number,
    precioUnitario: number
  }],
  igvPorcentaje?: number,
  observaciones?: string,
  userId?: number
}
```

### Recibir Orden
```
POST /api/order-buys/receive
Body: { orderId: number }
```

### Cancelar Orden
```
POST /api/order-buys/cancel
Body: { orderId: number, motivo?: string }
```

### Listar Órdenes
```
GET /api/order-buys?populate=*&sort=fechaOrden:desc
```

## Flujo de Uso

### Caso 1: Orden Normal (Crear → Recibir)

1. **Crear Orden**
   - Click en "Nueva Orden"
   - Seleccionar proveedor
   - Agregar productos:
     - Seleccionar producto
     - Ingresar cantidad a comprar
     - Ingresar precio de compra
     - Click en "+" para agregar
   - Repetir para cada producto
   - Ajustar IGV si es necesario (por defecto 18%)
   - Agregar observaciones (opcional)
   - Click en "Crear Orden"

2. **Cuando llega la mercadería**
   - Buscar la orden en la lista (estado Pendiente)
   - Click en el ícono ✓ (Recibir)
   - Confirmar la recepción
   - El sistema automáticamente:
     - Actualiza el stock de todos los productos
     - Cambia el estado a "Recibida"
     - Muestra resumen de actualizaciones

### Caso 2: Orden Cancelada

1. **Crear Orden** (igual que caso 1)

2. **Si surge un problema**
   - Buscar la orden en la lista
   - Click en el ícono ✕ (Cancelar)
   - Ingresar motivo de cancelación
   - Confirmar
   - El estado cambia a "Cancelada"

### Caso 3: Consultar Detalle

1. Click en el ícono 👁 (Ver) de cualquier orden
2. Se muestra modal con:
   - Información general
   - Lista completa de productos
   - Totales
   - Observaciones

## Cálculos Automáticos

### Subtotal por Producto
```
subtotal = cantidad × precioUnitario
```

### Subtotal General
```
subtotal = Σ(subtotal de cada producto)
```

### IGV
```
igv = subtotal × (igvPorcentaje / 100)
```

### Total
```
total = subtotal + igv
```

## Validaciones Implementadas

- ✓ Proveedor debe estar seleccionado
- ✓ Al menos un producto en la orden
- ✓ Cantidad debe ser > 0
- ✓ Precio unitario debe ser > 0
- ✓ No se puede recibir una orden ya recibida
- ✓ No se puede recibir una orden cancelada
- ✓ No se puede cancelar una orden ya recibida
- ✓ Confirmación antes de recibir orden
- ✓ Motivo requerido al cancelar

## Características de UI/UX

- Diseño responsive (mobile y desktop)
- Tabla de órdenes con información clara
- Modales interactivos para crear y ver detalles
- Indicadores visuales de estado con colores
- Cálculo automático de totales en tiempo real
- Loading states durante operaciones
- Toast notifications para feedback
- Confirmaciones para acciones críticas
- Iconos descriptivos para acciones
- Tabla dinámica para agregar/eliminar productos

## Tecnologías Utilizadas

- React + TypeScript
- TailwindCSS para estilos
- Lucide React para íconos
- Custom hooks (useToast)
- Fetch API para comunicación con backend

## Integración con Otros Módulos

### Con Productos
- Carga productos del backend para selección
- Al recibir orden, actualiza automáticamente el stock
- Valida que todos los productos existan

### Con Proveedores
- Carga proveedores del backend
- Cada orden está asociada a un proveedor
- Muestra información del proveedor en detalles

### Con Usuarios
- Se puede asociar cada orden con el usuario que la creó
- Útil para auditoría y trazabilidad

## Reportes Sugeridos

1. **Órdenes Pendientes**: Filtrar por estado "pendiente"
2. **Órdenes Recibidas por Período**: Filtrar por estado "recibida" y rango de fechas
3. **Compras por Proveedor**: Agrupar por proveedor
4. **Total de Compras**: Sumar total de órdenes recibidas
5. **Órdenes Canceladas**: Analizar motivos de cancelación
6. **Productos Más Comprados**: Analizar detail_order_buys

## Notas Importantes

⚠️ **Sin Autenticación**: Los endpoints están configurados sin autenticación (headers básicos) para evitar errores 403, igual que en HU7 y HU9.

✅ **Stock Automático**: Al recibir una orden, el stock se actualiza automáticamente sin intervención manual.

✅ **Trazabilidad**: Todas las órdenes quedan registradas con fecha, proveedor, usuario y estado.

✅ **Cálculos Automáticos**: Los subtotales, IGV y total se calculan automáticamente.

✅ **Estados Finales**: Las órdenes recibidas y canceladas no pueden modificarse.

## Diferencias con Ventas

| Característica | Orden de Compra | Venta |
|----------------|-----------------|-------|
| **Dirección** | Entrada de productos | Salida de productos |
| **Stock** | Aumenta al recibir | Disminuye al vender |
| **Precio** | Precio de compra | Precio de venta |
| **Relación** | Con proveedor | Con cliente |
| **IGV** | Se paga al proveedor | Se cobra al cliente |
| **Estado** | Pendiente/Recibida/Cancelada | Completada |

## Mejoras Aplicadas desde HU7 y HU9

1. ✅ **Headers básicos** sin autenticación desde el inicio
2. ✅ **Console.log** para debug de requests
3. ✅ **Manejo robusto de errores** del servidor
4. ✅ **Validaciones completas** en el frontend
5. ✅ **Mensajes claros** para el usuario
6. ✅ **Confirmaciones** para acciones críticas
7. ✅ **Carga de datos** desde el backend (productos y proveedores)
8. ✅ **UI intuitiva** con modales y tablas dinámicas

## Requisitos Previos

Para que la funcionalidad funcione correctamente:

1. **Productos en el backend**: Debe haber productos creados
2. **Proveedores en el backend**: Debe haber proveedores creados
3. **Permisos configurados**: Los endpoints deben ser accesibles

### Crear Proveedor (ejemplo con Postman)
```bash
POST http://localhost:1337/api/providers
Content-Type: application/json

{
  "data": {
    "razonSocial": "Distribuidora ABC S.A.C.",
    "ruc": "20123456789",
    "direccion": "Av. Principal 123",
    "telefono": "987654321",
    "email": "ventas@abc.com",
    "contacto": "Juan Pérez",
    "estado": true
  }
}
```

## Próximas Mejoras Sugeridas

- [ ] Recepción parcial de órdenes
- [ ] Devoluciones a proveedores
- [ ] Historial de precios de compra por producto
- [ ] Comparación de precios entre proveedores
- [ ] Órdenes recurrentes automáticas
- [ ] Notificaciones de órdenes pendientes
- [ ] Exportar órdenes a PDF/Excel
- [ ] Gráficos de compras por período
- [ ] Alertas de stock bajo para reorden automático
