export type ContractType =
  | "Indefinido"
  | "Fijo"
  | "Prestación de Servicios"
  | "Temporal";

export type ArlLevel = "I" | "II" | "III" | "IV" | "V";

export interface PayrollParameters {
  year: string;
  smmlv: string;
  transportAllowance: string;
  healthEmployee: string;
  pensionEmployee: string;
  solidarityFundThreshold: string;
  healthEmployer: string;
  pensionEmployer: string;
  ccf: string;
  sena: string;
  icbf: string;
  severance: string;
  serviceBonus: string;
  vacation: string;
  exonerationThreshold: string;
}

// Fallback Defaults if no DB parameters exist
export const defaultPayrollParameters: PayrollParameters = {
  year: new Date().getFullYear().toString(),
  smmlv: "1300000",
  transportAllowance: "162000",
  healthEmployee: "0.04",
  pensionEmployee: "0.04",
  solidarityFundThreshold: "4",
  healthEmployer: "0.085",
  pensionEmployer: "0.12",
  ccf: "0.04",
  sena: "0.02",
  icbf: "0.03",
  severance: "0.0833",
  serviceBonus: "0.0833",
  vacation: "0.0417",
  exonerationThreshold: "10",
};

export interface PayrollCosts {
  baseSalary: number;

  // Deducciones al empleado (lo que se descuenta para llegar al neto)
  employeeDeductions: {
    health: number; // e.g. 4%
    pension: number; // e.g. 4%
    solidarityFund: number; // e.g. 1% if salary > 4 SMMLV
    total: number;
  };

  // Auxilio de Transporte (si aplica, <= 2 SMMLV)
  transportAllowance: number;

  // Lo que finalmente se le consigna al empleado (Salario Base - Deducciones + Auxilio)
  netSalaryToPay: number;

  // Carga prestacional (Provisiones de la empresa)
  employerProvisions: {
    health: number; // Variable by Ley 1819
    pension: number; // e.g. 12%
    arl: number; // Dependent on risk
    ccf: number; // e.g. 4%
    senaIcbf: number; // Variable by Ley 1819
    severance: number; // e.g. 8.33%
    severanceInterest: number; // 12% a year of the severance = 1%
    serviceBonus: number; // e.g. 8.33%
    vacation: number; // e.g. 4.17%
    total: number;
  };

  // El costo real mensual que sale de los bolsillos/P&L de la empresa
  totalEmployerCost: number;
}

/**
 * Calculates all payroll deductions and employer provisions based on dynamic params
 * and the specific contract type.
 */
export function calculatePayrollCosts(
  baseSalary: number,
  contractType: string,
  arlLevel: ArlLevel = "I",
  params: PayrollParameters = defaultPayrollParameters,
): PayrollCosts {
  // Manejo de Prestación de Servicios: no hay carga prestacional ni deducciones por parte del empleador
  if (contractType === "Prestación de Servicios") {
    return {
      baseSalary,
      employeeDeductions: {
        health: 0,
        pension: 0,
        solidarityFund: 0,
        total: 0,
      },
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

  // Parse parameters
  const smmlv = Number(params.smmlv);
  const healthEmpPct = Number(params.healthEmployee);
  const pensionEmpPct = Number(params.pensionEmployee);
  const solThresholdLevel = Number(params.solidarityFundThreshold);

  const healthEmprPct = Number(params.healthEmployer);
  const pensionEmprPct = Number(params.pensionEmployer);
  const ccfPct = Number(params.ccf);
  const senaPct = Number(params.sena);
  const icbfPct = Number(params.icbf);
  const sevPct = Number(params.severance);
  const bonusPct = Number(params.serviceBonus);
  const vacPct = Number(params.vacation);
  const exoThreshold = Number(params.exonerationThreshold);

  // Deducciones Empleado
  const empHealth = baseSalary * healthEmpPct;
  const empPension = baseSalary * pensionEmpPct;

  // Fondo de Solidaridad Pensional (approx 1% if >= 4 SMMLV)
  const isSolidarityApplicable = baseSalary >= smmlv * solThresholdLevel;
  const empSolidarity = isSolidarityApplicable ? baseSalary * 0.01 : 0;

  const totalDeductions = empHealth + empPension + empSolidarity;

  // Auxilio de Transporte (Para salarios <= 2 SMMLV)
  const appliesTransport = baseSalary <= smmlv * 2;
  const employeeTransportAllowance = appliesTransport
    ? Number(params.transportAllowance)
    : 0;

  const netSalaryToPay =
    baseSalary - totalDeductions + employeeTransportAllowance;

  // Lógica de Exoneración Ley 1819
  const isExonerado = baseSalary < smmlv * exoThreshold;

  // Provisiones Empleador
  const employerHealth = isExonerado ? 0 : baseSalary * healthEmprPct;
  const employerPension = baseSalary * pensionEmprPct;

  const arlRates = {
    I: 0.00522,
    II: 0.01044,
    III: 0.02436,
    IV: 0.0435,
    V: 0.0696,
  };
  const arlPercentage = arlRates[arlLevel] || arlRates["I"];

  const arl = baseSalary * arlPercentage;
  const ccf = baseSalary * ccfPct;
  const senaIcbf = isExonerado ? 0 : baseSalary * (senaPct + icbfPct);

  // Prestaciones Sociales (Cesantías y Primas se calculan sobre: Salario Base + Auxilio de Transporte)
  const baseForBenefits = baseSalary + employeeTransportAllowance;

  const severance = baseForBenefits * sevPct;
  const severanceInterest = severance * 0.12; // 12% anual sobre las cesantías
  const serviceBonus = baseForBenefits * bonusPct;

  // Vacaciones se calculan ÚNICAMENTE sobre el Salario Base (Sin auxilio de transporte)
  const vacation = baseSalary * vacPct;

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
    transportAllowance: employeeTransportAllowance,
    employeeDeductions: {
      health: empHealth,
      pension: empPension,
      solidarityFund: empSolidarity,
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
    totalEmployerCost:
      baseSalary + employeeTransportAllowance + totalProvisions,
  };
}
