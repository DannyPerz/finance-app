export type ContractType =
  | "Indefinido"
  | "Fijo"
  | "Prestación de Servicios"
  | "Temporal";

export interface PayrollCosts {
  baseSalary: number;

  // Deducciones al empleado (lo que se descuenta para llegar al neto)
  employeeDeductions: {
    health: number; // 4%
    pension: number; // 4%
    total: number;
  };

  // Lo que finalmente se le consigna al empleado
  netSalaryToPay: number;

  // Carga prestacional (Provisiones de la empresa)
  employerProvisions: {
    health: number; // Asumimos 0% exonerado ley 1819 (< 10 SMMLV)
    pension: number; // 12%
    arl: number; // 0.522% Riesgo I
    ccf: number; // 4% Caja de Compensación
    senaIcbf: number; // 0% exonerado
    severance: number; // Cesantías 8.33%
    severanceInterest: number; // Intereses Cesantías (1% mensual sobre el acumulado, aprox 1% del base o 12% anual del 8.33%) -> simplify to 0.0833 * 0.12 * base = 1% of base
    serviceBonus: number; // Prima 8.33%
    vacation: number; // 4.17%
    total: number;
  };

  // El costo real mensual que sale de los bolsillos/P&L de la empresa
  totalEmployerCost: number;
}

/**
 * Calculates all payroll deductions and employer provisions based on Colombian law
 * and the specific contract type.
 */
export function calculatePayrollCosts(
  baseSalary: number,
  contractType: string,
): PayrollCosts {
  // Manejo de Prestación de Servicios: no hay carga prestacional ni deducciones por parte del empleador (el contratista paga su propia seguridad social)
  if (contractType === "Prestación de Servicios") {
    return {
      baseSalary,
      employeeDeductions: { health: 0, pension: 0, total: 0 },
      netSalaryToPay: baseSalary,
      employerProvisions: {
        health: 0,
        pension: 0,
        arl: 0,
        ccf: 0,
        senaIcbf: 0,
        severance: 0,
        severanceInterest: 0,
        serviceBonus: 0,
        vacation: 0,
        total: 0,
      },
      totalEmployerCost: baseSalary,
    };
  }

  // Contratos Laborales (Indefinido, Fijo, Temporal)
  // Deducciones Empleado
  const empHealth = baseSalary * 0.04;
  const empPension = baseSalary * 0.04;
  const totalDeductions = empHealth + empPension;
  const netSalaryToPay = baseSalary - totalDeductions;

  // Provisiones Empleador
  // Asumimos salarios menores a 10 SMMLV por ende aplica exoneración Ley 1819 de 2012 (Salud, SENA, ICBF = 0)
  const employerHealth = 0;
  const employerPension = baseSalary * 0.12;
  const arl = baseSalary * 0.00522; // Nivel 1
  const ccf = baseSalary * 0.04;
  const senaIcbf = 0;

  const severance = baseSalary * 0.0833;
  const severanceInterest = baseSalary * 0.01; // Simplificación mensual del 12% anual sobre las cesantías acumuladas
  const serviceBonus = baseSalary * 0.0833;
  const vacation = baseSalary * 0.0417;

  const totalProvisions =
    employerHealth +
    employerPension +
    arl +
    ccf +
    senaIcbf +
    severance +
    severanceInterest +
    serviceBonus +
    vacation;

  return {
    baseSalary,
    employeeDeductions: {
      health: empHealth,
      pension: empPension,
      total: totalDeductions,
    },
    netSalaryToPay,
    employerProvisions: {
      health: employerHealth,
      pension: employerPension,
      arl,
      ccf,
      senaIcbf,
      severance,
      severanceInterest,
      serviceBonus,
      vacation,
      total: totalProvisions,
    },
    totalEmployerCost: baseSalary + totalProvisions,
  };
}
