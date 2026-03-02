# PRD: Finova — Control de Ingresos y Gastos

## Visión del Producto

Un sistema personal para controlar **cómo entra y sale tu plata cada mes**. Simple, directo, sin complejidad innecesaria. Solo: ¿cuánto gano?, ¿en qué lo gasto?, ¿cómo voy este mes?

**Plataforma:** Web responsive (desktop + mobile con bottom nav). Stack: TanStack Start, React, Drizzle ORM, PostgreSQL (Neon).

---

## Estado Actual ✅

### Entidades

| Entidad         | Campos principales                                       |
| --------------- | -------------------------------------------------------- |
| **Categorías**  | nombre, ícono (Lucide), tipo (ingreso/gasto), userId     |
| **Movimientos** | tipo, monto (COP), descripción, categoría, fecha, userId |

### Páginas implementadas

#### Dashboard (`/`)

- Selector de mes (◀ Mes Año ▶)
- Filtro multi-select de categorías con checkboxes
- Métricas: Ingresos, Gastos, Balance
- Gráfico de barras: Ingresos vs Gastos (6 meses)
- Gráfico de dona: Distribución de gastos por categoría
- Lista de actividad filtrada por mes/categoría

#### Movimientos (`/transactions`)

- Lista completa de movimientos con ícono de categoría
- Botón "+ Nuevo Movimiento" → modal con:
  - Selector tipo (Ingreso/Gasto)
  - Monto con formato automático de puntos (ej: 1.500.000)
  - Descripción, fecha, categoría

#### Categorías (`/categories`)

- Vista dividida: Ingresos | Gastos
- CRUD completo: crear, editar inline (nombre + ícono), eliminar con confirmación
- Íconos Lucide seleccionables (30 opciones)

### UX

- **Iconografía:** 100% Lucide icons (componente `Icon.tsx` dinámico)
- **Mobile:** Bottom navigation bar (Dashboard, Movimientos, Categorías)
- **Desktop:** Sidebar con 4 items (+ Ajustes)
- **Tema:** Dark/Light/Auto

---

## Roadmap 🚀

### Fase 1 — Alto valor + Fácil

#### 1. Presupuestos por categoría

Asignar un tope mensual a cada categoría de gasto (ej: Arriendo $1.500.000, Comida $800.000). Widget en el dashboard con barra de progreso y % usado. Alertas visuales al acercarse al límite.

**Cambios:** campo `budget` en tabla `categories`, widget de progreso en dashboard.

#### 2. Exportar a CSV

Botón en Movimientos para descargar las transacciones filtradas como archivo CSV/Excel. Función pura sin dependencias extra.

#### 3. Editar y eliminar transacciones

Mismo patrón que categorías: inline edit + delete con confirmación en la página de Movimientos.

**Cambios:** `updateTransaction` y `deleteTransaction` server functions + UI.

#### 4. Resumen comparativo

Widget tipo "Este mes gastaste 15% más/menos que el anterior en [categoría]". Comparativa automática mes a mes usando la data existente.

---

### Fase 2 — Valor medio + Fácil

#### 5. Movimientos recurrentes

Marcar un movimiento como recurrente (ej: arriendo cada mes). Toggle en el formulario + recordatorio visual.

#### 6. Tags/Notas

Tags libres en transacciones para búsqueda rápida (ej: "vacaciones", "emergencia"). Campo simple de texto.

#### 7. Persistencia de tema

Guardar preferencia dark/light en localStorage para que persista entre sesiones.

---

## Base de Datos

### Tablas activas

```
users (id, name, email, createdAt)
categories (id, userId, name, icon, type, createdAt)
transactions (id, userId, categoryId, type, amount, description, date, createdAt)
```

### Tablas eliminadas

- `accounts`, `budgets`, `debts`, `goals`, `recurring_transactions`, `exchange_rates`

---

## Verificación

- Validar flujos completos en navegador (crear/editar/eliminar categorías y movimientos)
- Verificar responsividad mobile (bottom nav, formularios)
- Probar filtros del dashboard (mes, categorías múltiples)
- Confirmar que todos los íconos Lucide renderizan correctamente
