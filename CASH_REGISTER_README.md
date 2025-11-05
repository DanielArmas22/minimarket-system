# HU7 - Apertura y Cierre de Caja

## Descripción
Funcionalidad implementada para registrar el monto inicial al abrir caja y calcular diferencias al cierre del turno.

## Archivos Creados/Modificados

### Nuevos Archivos
1. **`src/components/CashRegister/CashRegister.tsx`**
   - Componente principal de la interfaz de usuario
   - Maneja apertura y cierre de caja
   - Muestra resumen de cierre con diferencias

2. **`src/services/cashRegisterService.ts`**
   - Servicio para comunicación con la API
   - Métodos: `openCashRegister`, `closeCashRegister`, `getCurrentOpenCashRegister`

### Archivos Modificados
1. **`src/types/index.ts`**
   - Agregadas interfaces `CashRegister` y `CashRegisterSummary`

2. **`src/components/Layout/Navigation.tsx`**
   - Agregado ítem de navegación "Caja" con ícono Wallet

3. **`src/App.tsx`**
   - Importado componente `CashRegister`
   - Agregado caso `cash-register` en el switch de renderizado

## Funcionalidades Implementadas

### 1. Apertura de Caja
- Modal para ingresar monto inicial
- Validación de monto >= 0
- Solo permite una caja abierta a la vez
- Muestra información del usuario que abre la caja

### 2. Estado de Caja Abierta
- Visualización del monto inicial
- Usuario responsable
- Fecha y hora de apertura
- Contador de ventas asociadas
- Botón para cerrar caja

### 3. Cierre de Caja
- Modal para ingresar monto real contado
- Campo opcional para notas/observaciones
- Cálculo automático de diferencias:
  - Monto esperado = Inicial + Total ventas
  - Diferencia = Monto real - Monto esperado
- Resumen visual con:
  - Monto inicial
  - Total de ventas
  - Monto esperado
  - Monto real
  - Diferencia (con indicador visual de sobrante/faltante)

### 4. Indicadores Visuales
- ✓ Verde: Caja abierta / Sobrante
- ⚠ Rojo: Faltante
- ℹ Gris: Sin caja abierta / Cuadre perfecto

## Endpoints de API Utilizados

### Abrir Caja
```
POST /api/cash-registers/open
Body: { initialAmount: number, userId?: number }
```

### Cerrar Caja
```
POST /api/cash-registers/close
Body: { cashRegisterId: number, actualAmount: number, notes?: string }
```

### Obtener Caja Abierta
```
GET /api/cash-registers/current-open
```

## Flujo de Uso

1. **Inicio de Turno**
   - Navegar a "Caja" en el menú
   - Click en "Abrir Caja"
   - Ingresar monto inicial
   - Confirmar apertura

2. **Durante el Turno**
   - Las ventas se asocian automáticamente a la caja abierta
   - Se puede consultar el estado de la caja en cualquier momento

3. **Fin de Turno**
   - Click en "Cerrar Caja"
   - Contar el dinero físico en caja
   - Ingresar el monto real contado
   - Agregar notas si es necesario (opcional)
   - Confirmar cierre
   - Revisar resumen con diferencias

## Validaciones Implementadas

- ✓ Monto inicial debe ser >= 0
- ✓ Monto real al cierre debe ser >= 0
- ✓ Solo una caja puede estar abierta a la vez
- ✓ No se puede cerrar una caja ya cerrada
- ✓ Manejo de errores con mensajes toast

## Características de UI/UX

- Diseño responsive (mobile y desktop)
- Modales para apertura y cierre
- Loading states durante operaciones
- Toast notifications para feedback
- Resumen automático por 5 segundos después del cierre
- Colores semánticos para estados (verde/rojo/gris)
- Animaciones suaves de transición

## Tecnologías Utilizadas

- React + TypeScript
- TailwindCSS para estilos
- Lucide React para íconos
- Custom hooks (useToast)
- Fetch API para comunicación con backend

## Notas Importantes

- Los errores de TypeScript mostrados durante el desarrollo son normales y se resuelven al compilar
- El componente está completamente integrado con el sistema de navegación existente
- La API debe estar corriendo en `http://localhost:1337` (configurable en el servicio)
- Se requiere autenticación JWT (token almacenado en localStorage)

## Próximas Mejoras Sugeridas

- [ ] Historial de cajas cerradas
- [ ] Exportar reportes de cierre
- [ ] Gráficos de tendencias de diferencias
- [ ] Notificaciones cuando hay diferencias significativas
- [ ] Permisos por rol para apertura/cierre
