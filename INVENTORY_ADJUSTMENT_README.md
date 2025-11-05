# HU9 - Ajuste de Inventario

## Descripción
Funcionalidad implementada para aumentar o disminuir manualmente el stock de un producto, especificando el motivo del ajuste (merma, conteo, daño, devolución, corrección u otro).

## Archivos Creados/Modificados

### Nuevos Archivos
1. **`src/components/InventoryAdjustment/InventoryAdjustment.tsx`**
   - Componente principal de la interfaz de usuario
   - Tabla de productos con búsqueda
   - Modal de ajuste de inventario
   - Modal de historial de ajustes
   - Lista de ajustes recientes

2. **`src/services/inventoryAdjustmentService.ts`**
   - Servicio para comunicación con la API
   - Métodos: `adjustInventory`, `getProductHistory`, `getAllAdjustments`

### Archivos Modificados
1. **`src/types/index.ts`**
   - Agregadas interfaces `InventoryAdjustment` y `InventoryAdjustmentSummary`
   - Agregados tipos `AdjustmentType` y `AdjustmentReason`

2. **`src/components/Layout/Navigation.tsx`**
   - Agregado ítem de navegación "Ajuste Inventario" con ícono ClipboardList

3. **`src/App.tsx`**
   - Importado componente `InventoryAdjustment`
   - Agregado caso `inventory-adjustment` en el switch de renderizado

## Funcionalidades Implementadas

### 1. Lista de Productos
- Tabla con todos los productos disponibles
- Búsqueda por nombre o código de barras
- Visualización de stock actual con indicador de color:
  - 🟢 Verde: Stock normal
  - 🔴 Rojo: Stock bajo (≤ stock mínimo)
- Botones de acción: "Ajustar" y "Historial"

### 2. Ajuste de Inventario
- Modal interactivo para realizar ajustes
- Selección de tipo de ajuste:
  - **Aumentar** (verde): Para devoluciones, correcciones, conteos
  - **Disminuir** (rojo): Para mermas, daños, productos vencidos
- Campos del formulario:
  - Cantidad (requerido, debe ser > 0)
  - Motivo (requerido):
    - **Merma**: Pérdida de producto
    - **Conteo**: Ajuste por conteo físico
    - **Daño**: Producto dañado
    - **Devolución**: Devolución de producto
    - **Corrección**: Corrección de error
    - **Otro**: Otro motivo
  - Descripción (opcional): Detalles adicionales
- Validaciones en tiempo real
- Confirmación con colores según tipo de ajuste

### 3. Historial de Ajustes por Producto
- Modal con historial completo de un producto
- Información detallada de cada ajuste:
  - Fecha y hora
  - Tipo de ajuste (aumento/disminución)
  - Cantidad ajustada
  - Stock anterior → Stock nuevo
  - Motivo y descripción
  - Usuario que realizó el ajuste
- Ordenado por fecha (más reciente primero)

### 4. Ajustes Recientes
- Panel con los últimos 10 ajustes realizados
- Vista rápida con:
  - Producto ajustado
  - Tipo de ajuste con ícono
  - Cantidad y motivo
  - Cambio de stock
  - Fecha del ajuste

## Motivos de Ajuste

| Motivo | Descripción | Casos de Uso |
|--------|-------------|--------------|
| **Merma** | Pérdida de producto | Vencimiento, deterioro natural |
| **Conteo** | Ajuste por conteo físico | Inventario periódico, diferencias encontradas |
| **Daño** | Producto dañado | Roturas, productos en mal estado |
| **Devolución** | Devolución de producto | Cliente devuelve, proveedor acepta devolución |
| **Corrección** | Corrección de error | Error de registro, error de sistema |
| **Otro** | Otro motivo | Cualquier otro caso no contemplado |

## Endpoints de API Utilizados

### Ajustar Inventario
```
POST /api/inventory-adjustments/adjust
Body: {
  productId: number,
  adjustmentType: "increase" | "decrease",
  quantity: number,
  reason: string,
  reasonDescription?: string,
  userId?: number
}
```

### Obtener Historial de Producto
```
GET /api/inventory-adjustments/product/:productId/history
```

### Listar Todos los Ajustes
```
GET /api/inventory-adjustments?populate=*&sort=adjustmentDate:desc
```

## Flujo de Uso

### Caso 1: Producto Dañado
1. Navegar a "Ajuste Inventario"
2. Buscar el producto (por nombre o código)
3. Click en "Ajustar"
4. Seleccionar "Disminuir"
5. Ingresar cantidad de unidades dañadas
6. Seleccionar motivo "Daño"
7. Agregar descripción: "Envases rotos durante transporte"
8. Confirmar ajuste

### Caso 2: Conteo Físico Mensual
1. Realizar conteo físico del inventario
2. Para cada diferencia encontrada:
   - Buscar el producto
   - Click en "Ajustar"
   - Seleccionar "Aumentar" o "Disminuir" según corresponda
   - Ingresar la diferencia encontrada
   - Seleccionar motivo "Conteo"
   - Agregar descripción con fecha del conteo
   - Confirmar ajuste

### Caso 3: Producto Vencido (Merma)
1. Identificar productos vencidos
2. Buscar el producto
3. Click en "Ajustar"
4. Seleccionar "Disminuir"
5. Ingresar cantidad de unidades vencidas
6. Seleccionar motivo "Merma"
7. Agregar descripción con fecha de vencimiento
8. Confirmar ajuste

### Caso 4: Consultar Historial
1. Buscar el producto
2. Click en "Historial"
3. Revisar todos los ajustes realizados
4. Ver detalles de cada movimiento

## Validaciones Implementadas

- ✓ Cantidad debe ser mayor a 0
- ✓ Producto debe existir
- ✓ Motivo es requerido
- ✓ El backend valida que el stock no quede negativo al disminuir
- ✓ Manejo de errores con mensajes toast

## Características de UI/UX

- Diseño responsive (mobile y desktop)
- Búsqueda en tiempo real
- Indicadores visuales de stock bajo
- Modales interactivos
- Colores semánticos:
  - 🟢 Verde: Aumentar stock
  - 🔴 Rojo: Disminuir stock
  - 🟡 Amarillo: Stock bajo
- Loading states durante operaciones
- Toast notifications para feedback
- Iconos descriptivos (Plus/Minus)
- Descripciones de ayuda para cada motivo

## Tecnologías Utilizadas

- React + TypeScript
- TailwindCSS para estilos
- Lucide React para íconos
- Custom hooks (useToast)
- Fetch API para comunicación con backend

## Integración con Otros Módulos

### Con Productos
- Cada ajuste actualiza automáticamente el stock del producto
- Se mantiene un registro histórico de todos los cambios
- Los productos se cargan desde el estado global de la aplicación

### Con Usuarios
- Se puede asociar cada ajuste con el usuario que lo realizó
- Útil para auditoría y trazabilidad

## Reportes Sugeridos

1. **Reporte de Mermas**: Filtrar ajustes por motivo "merma"
2. **Reporte de Daños**: Filtrar ajustes por motivo "daño"
3. **Historial de Producto**: Ver todos los movimientos de un producto
4. **Ajustes por Período**: Filtrar por rango de fechas
5. **Productos con Más Ajustes**: Identificar productos problemáticos

## Notas Importantes

⚠️ **Sin Autenticación**: Los endpoints están configurados sin autenticación (headers básicos) como en el resto del proyecto. Esto evita errores 403.

✅ **Trazabilidad**: Todos los ajustes quedan registrados con fecha, motivo y descripción.

✅ **Integridad**: El backend usa transacciones para garantizar que el stock y el historial estén sincronizados.

✅ **Validaciones**: El sistema previene errores comunes como stock negativo o cantidades inválidas.

✅ **Historial Completo**: Se puede consultar el historial completo de ajustes de cada producto.

## Diferencias con HU7 (Caja)

- ✅ Sin errores de autenticación (aprendido de HU7)
- ✅ Headers básicos sin JWT
- ✅ Manejo correcto de errores 404
- ✅ Logs de debug para facilitar troubleshooting
- ✅ Componente más robusto y completo

## Próximas Mejoras Sugeridas

- [ ] Exportar reportes de ajustes a Excel/PDF
- [ ] Gráficos de tendencias de mermas y daños
- [ ] Alertas automáticas para productos con muchos ajustes
- [ ] Filtros avanzados en la lista de ajustes
- [ ] Permisos por rol para realizar ajustes
- [ ] Firma digital o confirmación de supervisor para ajustes grandes
- [ ] Integración con sistema de alertas de stock bajo
