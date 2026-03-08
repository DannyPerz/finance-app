# Product Requirements Document (PRD) - Work Suite v1.5

## 1. Objetivo General

Evolucionar el módulo "Work" de Finova desde un simple directorio de empleados (CRUD) hacia un **Motor Contable de Costos Laborales**. El fin primordial es dotar a los administradores (CEOs y HR) de proyecciones matemáticas rigurosas que expongan la **Liquidez Necesaria para Dispersiones de Nómina** y el **Impacto Real en el Estado de Resultados (Costo Empresa Run Rate)**, tomando como referencia las normativas laborales de Colombia.

## 2. Visión del Negocio y Problema

Actualmente, los negocios y startups cometen el error financiero de contabilizar los "salarios pagados al talento" como su costo laboral total.
En la realidad, un contrato indefinido o a término fijo conlleva responsabilidades accesorias (Prestaciones, Seguridad Social y Parafiscales) que encarecen el recurso hasta un ~50% por encima de lo que se le consigna al banco.
Finova solucionará este gap cognitivo revelando en vivo y de forma transparente toda la sábana de costos asociados a la contratación.

## 3. Especificaciones y Características (Features)

### 3.1. Modelo "Bottom-Up" (Cálculo a partir del Salario Bruto)

- **Entrada de Datos:** El form base para reclutar a un miembro se anclará al `baseSalary` (Salario Bruto pactado) y al `contractType` (Indefinido, Fijo, Prestación de Servicios, Temporal).
- **Live Projections:** Una UI en tiempo real (_Proyección de Nómina_) pre-calculará para el admin cuánto será transferido de forma líquida y cuánto costará mantener la plaza activa antes de guardar.

### 3.2. Panel Desagregado (Hoja de Costos / Nómina)

- Al interactuar con el registro de un recurso humano activo en el dashboard, la aplicación desplegará una vista detallada (Sheet), donde desglosará matemáticamente la "Torta de Egresos".
- **Fila de Deducibles:** Cuánto asume el empleado en Salud (4%) y Pensión (4%).
- **Fila de Sobre-Costos Empleador:** Sumatoria segmentada de Primas, Vacaciones, ARL, Pensión (12%) e Intereses que no se consignan mes a mes, pero _deben provisionarse_.

### 3.3. Configuración Parametrizable de Variables Jurídicas [PENDIENTE]

_Se desarrollará en la Fase 6_.

- **Problema:** Los salarios mínimos, coeficientes de riesgos laborales y exenciones fiscales cambian cada enero mediante decretos del gobierno.
- **Solución Arquitectónica:** En lugar de codificar ("hardcodear") constantes como `1300000` (SMMLV) o `0` (SENA/ICBF por Ley 1819), Finova tendrá una tabla de base de datos dedicada `work_payroll_parameters`.
- **Módulo de Administrador ("Ajustes de Nómina"):**
  - El usuario podrá inyectar un SMMLV base.
  - Definir el tope para exoneración parafiscal (ej. 10 SMMLV).
  - Activar/Desactivar Auxilio de Transporte.
- **Motor Lógico Dinámico:** Las matemáticas ubicadas en `payroll.utils.ts` leerán de la base de datos la tabla de configuración vigente en el mes, y aplicarán los perdonazos fiscales según esa fotografía en el tiempo, asegurando un back-testing de nóminas pasadas perfecto y adaptabilidad total al futuro.

## 4. Requisitos de Datos (Data Dictionary Update)

| Entidad         | Campo         | Tipo    | Función                                                                                    |
| --------------- | ------------- | ------- | ------------------------------------------------------------------------------------------ |
| `work_members`  | `baseSalary`  | Decimal | Sustituye al histórico `netSalary` para adherir el cálculo Bottom-Up.                      |
| `work_settings` | _(Por Crear)_ | Tabla   | Almacenará SMMLV año vigente, thresholds de exoneración y porcentajes mutables (ARL, CCF). |

## 5. Criterios de Éxito y Métricas

- [x] El FrontEnd renderiza proyecciones live sin trabar o bloquear al usuario (Latency < 200ms).
- [x] La sumatoria ("Total Provisiones" + "Neto a Consignar" + "Deducciones de Ley") totaliza exactamente matemáticamente el `totalEmployerCost`.
- [ ] La Fase 6 implementa un endpoint de DB para leer variables legislativas dinámicas y alimentar al FrontEnd con esas constantes antes de operar.
