# Product Requirements Document (PRD) - Tech Lead Finance Tracker (Work Suite)

## 1. Objetivo General

Transformar el módulo "Work" de Finova en una herramienta personal de control de presupuesto para **Tech Leads / Engineering Managers**. Su propósito central es permitir la administración unificada y exacta del OPEX (Gastos Operativos) del área de tecnología. Esto incluye el cálculo real de los costos laborales del equipo de desarrollo (incorporando provisiones, prestaciones y cargas sociales de ley) y la gestión del gasto de infraestructura y operaciones (SaaS, Cloud, Licencias), rematando con reportes y cierres históricos diseñados para presentar al CEO.

## 2. Visión del Negocio y Problema

Generalmente, los Tech Leads llevan el control de su presupuesto departamental en hojas de cálculo fragmentadas:

1. Por un lado, una lista teórica de salarios de la plantilla o _headcount_. (Frecuentemente ignoran el sobrecosto prestacional y parafiscal que impacta a la empresa, sumando hasta un ~50% por encima del líquido pagado).
2. Por otro, un listado de facturas no estandarizadas pagadas a múltiples proveedores (AWS, Vercel, Figma, GitHub, Jira).

**La Solución:** Finova cerrará este gap creando una consola unificada. **No** es un software contable genérico ni una suite de Recursos Humanos para liquidar y dispersar nóminas reales. Es una herramienta directiva de simulación y control financiero ("Run Rate" mensual continuo) para que el líder técnico visualice con transparencia del 100% cuánto cuesta su departamento al negocio.

## 3. Especificaciones y Características (Features)

### 3.1. Gestión de Costos Laborales (Dev Team)

- **Directorio de Talento:** Añadir desarrolladores y staff técnico indicando Salario Bruto, Rol y Seniority.
- **Motor "Bottom-Up" (Simulador Fiscal):** Pre-calcula el Costo Real Empresa a nivel P&L. Desglosa los impuestos asimilados para el área, las vacaciones, ARL y obligaciones laborales.
- **Onboarding Proyectado:** Una UI interactiva para dimensionar en vivo los costos al negocio de contratar una nueva vacante.

### 3.2. Módulo de Infraestructura y Operaciones (Infra & Ops)

- **Directorio de Suscripciones SaaS y Cloud:** Gestión centralizada de herramientas como Vercel, AWS, MongoDB Atlas, Figma, Miro, Slack, etc.
- **Rastreo Financiero de Proveedores:** Cargar la periodicidad del cobro (Mensual/Anual) y normalizarlos a un impacto mensual del departamento.
- **Tracking Activo:** Permite llevar control de a qué plataforma está subscrita el área de tecnología.

### 3.3. Reportes Executivos y Trazabilidad Histórica (Reportes)

- **Fotografías Temporales (Cierres Visuales):** Capacidad de capturar y guardar una "fotografía" histórica de los salarios de un mes cerrado para que la trazabilidad de costos operativos nunca se mutile por cambios de salarios a futuro.
- **Dashboard CEO-Ready:** Una sección de gráficas y KPIs consolidados ("Tech Area OPEX") combinando Talento + Infraestructura. Diseñada especialmente para exportar/exponer al CEO o CFO justificando el presupuesto del ecosistema digital.

### 3.4. Parámetros Macro (Settings)

- El Tech lead podrá parametrizar los porcentajes de la normatividad local gubernamental. Actualizando el salario mínimo, los aportes a pensiones / cesantías el simulador continuará calculando al centavo sin depender de código quemado.

## 4. Requisitos de Datos (Data Dictionary)

| Entidad                   | Tipo           | Función Principal                                                                          |
| ------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `work_members`            | Tabla          | Desarrolladores activos con sus respectivos sueldos brutos, seniority y contrato.          |
| `work_payroll_parameters` | Tabla          | Ajustes macroeconómicos para mantener viva la matemática de cargas tributarias patronales. |
| `work_payrolls`           | Tabla          | Colillas "congeladas" en el tiempo detallando el histórico de facturación de talento.      |
| `work_ops_expenses`       | _(Nueva Fase)_ | Tracker de infraestructura, categorizando gastos en la nube y licencias (AWS, etc.).       |

## 5. Roadmap de Funcionalidades Pendientes

**Fase 7: Infra & Ops (Operaciones de IT)**

- Construir esquema en BD para suscripciones SaaS y Cloud.
- UI para que el Tech Lead liste servicios (AWS, Vercel) y costos, centralizando herramientas en la vista `/work/ops`.

**Fase 8: Dashboard Executivo P&L**

- Renderizado de gráficos de Dona (Talento vs Infraestructura) o gráficos de Barra por meses en `/work/reports`.
- Permite observar las fotografías del gasto de la unidad.
