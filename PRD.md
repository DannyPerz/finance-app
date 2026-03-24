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

### ✅ Completado

- Presupuestos por categoría (widget dashboard con barra de progreso)
- Exportar / Importar CSV
- Editar y eliminar transacciones (modal de detalle)
- Resumen comparativo mes a mes (% vs mes anterior)
- Movimientos recurrentes (semanal / quincenal / mensual)
- Filtros avanzados en Movimientos (tipo, categoría, búsqueda, paginación)
- Split button acciones (Importar / Exportar CSV)
- Tema Dark / Light / Auto persistido
- **Metas de ahorro** — tabla `savingsGoals` + `goalContributions`, página `/finance/goals`, widget en dashboard

---

### Fase 4 — Alta prioridad

#### 1. ✅ Tasa de ahorro mensual

Widget en el dashboard: `(ingresos - gastos) / ingresos × 100` con histórico 6 meses en gráfico de línea. Verde ≥20%, amarillo 5-20%, rojo <5%.

**Cambios:** cálculo puro, `SavingsRateChart.tsx`, widget en dashboard.

#### 2. ✅ Proyección de cierre de mes

Basada en el ritmo de gasto diario del mes en curso: proyecta gasto total al cierre, balance estimado, y alerta qué presupuestos serán superados. Solo visible en el mes actual.

**Cambios:** cálculo puro sobre datos existentes, widget en dashboard.

#### 3. Deudas y créditos

Registrar que debes o te deben dinero. Soporte para cuotas (ej: crédito a 12 meses). Dashboard de deudas pendientes con monto restante y progreso de pago. Muy útil en contexto colombiano (créditos, cuotas, préstamos entre amigos).

**Cambios:** tabla `debts` (acreedor, monto total, cuotas, tipo: debo/me deben), tabla `debtPayments`, widget en dashboard.

---

### Fase 5 — Valor medio

#### 5. ✅ Top gastos del mes

Los 5 movimientos de gasto más altos del mes, con barra de proporción relativa. Útil para detectar gastos inesperados.

**Cambios:** cálculo puro sobre datos existentes, widget en dashboard.

#### 6. Notificaciones / recordatorios

Recordatorio visual cuando un movimiento recurrente no ha sido registrado en el mes en curso. Posiblemente email o PWA push notification.

**Cambios:** lógica de detección de recurrentes pendientes + banner en dashboard o email via Resend.

#### 7. Etiquetas libres

Marcar movimientos con tags personalizados adicionales a la categoría (ej: "viaje Cartagena", "casa nueva"). Permite agrupar gastos de proyectos específicos que cruzan varias categorías.

**Cambios:** tabla `tags` + tabla `transactionTags` (many-to-many), filtro por tag en Movimientos.

---

### Fase 6 — Nice to have

#### 8. Multi-moneda

Soporte para registrar movimientos en USD o EUR con conversión automática a COP usando una tasa configurable por el usuario.

#### 9. Adjuntar comprobante

Subir foto de la factura o comprobante a un movimiento. Almacenamiento en Cloudflare R2.

#### 10. Reporte mensual por email

Resumen automático al cierre de cada mes: ingresos, gastos, balance, top categorías, cumplimiento de presupuestos. Enviado vía Resend.

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
