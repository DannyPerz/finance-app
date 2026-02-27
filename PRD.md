# Documento de Requisitos del Producto (PRD) - Finova

**Visión del Producto:** Un centro de control de finanzas personales estricto y sin excusas, diseñado para el manejo multi-moneda (COP como base), presupuestos estrictos, control de amortización de deudas y proyecciones de ahorro para alcanzar metas financieras a largo plazo.

**Plataforma objetivo:** Aplicación web responsive (mobile-first), con potencial para PWA en futuras iteraciones.

---

## 1. Capacidades Principales (Alcance MVP)

### 1.1 Sistema Multi-Cuenta y Multi-Moneda

- **Moneda base:** Peso Colombiano (COP).
- **Monedas soportadas:** USD, EUR, COP.
- **Tipos de cuenta:**
  - Ahorro tradicional (ej: Bancolombia).
  - Billeteras digitales (ej: Nu, Nequi).
- **Transferencias entre cuentas:**
  - El usuario puede mover saldos entre sus propias cuentas.
  - Las transferencias entre monedas diferentes requieren una tasa de cambio (ingresada manualmente por el usuario en el MVP).
  - Cada transferencia genera dos movimientos: un débito en la cuenta origen y un crédito en la cuenta destino.
- **Patrimonio neto:** Visualización del saldo total consolidado en la moneda base elegida.

### 1.2 Gestión de Ingresos

- **Ingresos fijos:** Registro de ingresos recurrentes con frecuencia configurable (ej: salario cada 30 días).
- **Ingresos variables:** Soporte para ingresos puntuales o irregulares (ej: freelance, venta de artículos).

### 1.3 Seguimiento y Categorización de Gastos

- **Registro rápido:** Entrada ágil de gastos individuales (ej: "Almuerzo $15.000 COP").
- **Categorías:**
  - Categorías predeterminadas: Alimentación, Transporte, Entretenimiento, Salud, Vivienda, Educación, Servicios públicos, Suscripciones, Otros.
  - El usuario puede crear, editar y eliminar categorías personalizadas.
  - Cada categoría tiene un nombre, ícono y tipo (ingreso o gasto).
- **Motor de presupuesto estricto:**
  - Límites duros por categoría, configurables mensualmente.
  - Alertas visuales y lógicas al acercarse o superar los límites (umbrales al 80%, 90% y 100%).
  - Filosofía de asignación "base cero" para prevenir quedarse sin dinero.

### 1.4 Transacciones Recurrentes

- **Gastos recurrentes:** Registro de gastos que se repiten automáticamente:
  - Suscripciones (Netflix, Spotify, gimnasio).
  - Servicios públicos (agua, luz, internet).
  - Cuotas de deuda.
- **Configuración:** Frecuencia (semanal, quincenal, mensual, anual), monto, cuenta asociada, categoría y próxima fecha de ejecución.
- **Recordatorios:** Notificación antes de la fecha de cada gasto recurrente.

### 1.5 Control de Deudas y Amortización

- **Seguimiento detallado:** No solo el monto total, sino un cronograma de amortización completo.
- **Campos requeridos:** Monto principal, tasa de interés, plazo (número de cuotas) y progreso actual.
- **Proyecciones:** Línea de tiempo visual mostrando cuándo se pagará completamente la deuda según los pagos actuales o pagos extraordinarios.

### 1.6 Proyecciones de Ahorro Basadas en Metas

- **Seguimiento de metas:** Crear metas financieras específicas (ej: "Comprar una moto", "Fondo de emergencia").
- **Proyecciones:** Cálculo del tiempo estimado de llegada (ETA) basado en la tasa de ahorro actual y el cumplimiento estricto del presupuesto.
- **Progreso visual:** Barra de progreso y porcentaje de avance hacia cada meta.

### 1.7 Reportes y Exportación

- **Exportación de datos:** Generación de resúmenes periódicos exportables a PDF y Excel para análisis externo.
- **Reportes disponibles:**
  - Resumen mensual de ingresos vs gastos.
  - Gasto por categoría.
  - Estado de deudas.
  - Progreso de metas.

---

## 2. Experiencia de Usuario

### 2.1 Dashboard Principal

Vista consolidada que muestra al iniciar sesión:

- **Patrimonio neto** total en la moneda base.
- **Resumen del mes actual:** ingresos vs gastos con gráfico comparativo.
- **Estado de presupuesto:** consumo por categoría con indicadores visuales (verde/amarillo/rojo).
- **Próximas transacciones recurrentes** (próximos 7 días).
- **Progreso de metas** activas.
- **Estado de deudas** con próximo pago.

### 2.2 Navegación

- Sidebar con acceso directo a: Dashboard, Cuentas, Transacciones, Presupuestos, Deudas, Metas, Reportes y Configuración.
- Botón flotante de acción rápida para registrar un gasto o ingreso.

### 2.3 Notificaciones y Alertas

- **In-app:** Alertas dentro de la aplicación para presupuestos cercanos al límite.
- **Umbrales configurables:** El usuario puede definir cuándo recibir alertas (por defecto: 80%, 90%, 100% del presupuesto).
- **Recordatorios:** Aviso de pagos de deuda y gastos recurrentes próximos.

---

## 3. Requisitos No Funcionales

### 3.1 Seguridad y Autenticación

- Autenticación segura de usuarios (registro/login).
- Protección de datos financieros sensibles.
- Comunicación cifrada (HTTPS/TLS).
- Sesiones con expiración automática.

### 3.2 Rendimiento

- Tiempo de carga inicial < 3 segundos.
- Respuesta a interacciones del usuario < 500ms.

### 3.3 Disponibilidad

- Disponibilidad objetivo del 99.5%.
- Backups automáticos de la base de datos.

---

## 4. Diseño Técnico

### 4.1 Esquema de Base de Datos

Basado en este PRD, nuestro esquema con Drizzle ORM debe incluir:

1. **`users`**: Información del usuario, preferencias de moneda base.
2. **`accounts`**: Campos para `currency` (enum: COP, USD, EUR), `type` (banco, billetera), `balance`, vinculada a un usuario.
3. **`categories`**: Nombre, ícono, tipo (ingreso/gasto), flag de personalizada, vinculada a un usuario.
4. **`transactions`**: Vinculada a cuentas, categorías y opcionalmente a un `debt_id`. Campos: monto, descripción, fecha, tipo (ingreso/gasto/transferencia).
5. **`budgets`**: Límites estrictos por categoría para un mes/período dado.
6. **`debts`**: Variables de amortización (`interest_rate`, `total_installments`, `remaining_balance`, `monthly_payment`).
7. **`goals`**: Metas de ahorro (`target_amount`, `current_amount`, `deadline`).
8. **`recurring_transactions`**: Frecuencia, monto, cuenta, categoría, próxima fecha de ejecución, estado activo/inactivo.
9. **`exchange_rates`**: Registro histórico de tasas de cambio al momento de cada transacción multi-moneda.

### 4.2 Integraciones Externas

- **MVP:** Tasas de cambio ingresadas manualmente por el usuario.
- **Post-MVP:** Integración con API de tasas de cambio en tiempo real (ej: ExchangeRate-API, Open Exchange Rates).

---

## 5. Alcance Futuro (Post-MVP)

- Importación de transacciones desde CSV o extractos bancarios.
- Gráficos avanzados y análisis de tendencias.
- Categorización automática mediante IA.
- Tasas de cambio en tiempo real vía API.
- Modo offline con sincronización (PWA).
- Proyección de flujo de efectivo a 30/60/90 días.
- Notificaciones push y por email.

---

## 6. Plan de Verificación

### Pruebas Automatizadas

- Tests unitarios para lógica de cálculos (amortización, proyecciones, conversión de moneda).
- Tests de integración para flujos críticos (crear transacción, transferir entre cuentas).

### Verificación Manual

- Validar flujos de usuario completos en el navegador.
- Verificar responsividad en dispositivos móviles.
- Probar escenarios de presupuesto (alertas al 80%, 90%, 100%).
