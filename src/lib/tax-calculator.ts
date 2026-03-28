/**
 * Indian Income Tax Calculator (FY 2025-2026)
 * Implements both Old and New tax regimes with all major deductions.
 * 100% deterministic. Zero AI. Zero API calls.
 */

// ─── New Regime Slabs (FY 2025-26) ────────────────────────────────
const NEW_REGIME_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.10 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.20 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.30 },
];

// ─── Old Regime Slabs (FY 2025-26) ────────────────────────────────
const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.20 },
  { min: 1000000, max: Infinity, rate: 0.30 },
];

// ─── Section 80C Deduction Limit ──────────────────────────────────
export const SECTION_80C_LIMIT = 150000;
export const SECTION_80D_LIMIT_SELF = 25000;
export const SECTION_80D_LIMIT_PARENTS = 50000; // Senior citizen parents
export const NEW_REGIME_STANDARD_DEDUCTION = 75000;
export const OLD_REGIME_STANDARD_DEDUCTION = 50000;

export interface TaxBreakdown {
  grossIncome: number;
  standardDeduction: number;
  section80C: number;
  section80D: number;
  otherDeductions: number;
  taxableIncome: number;
  taxBeforeCess: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  regime: 'old' | 'new';
  /** Monthly take-home after tax */
  monthlyTakeHome: number;
}

function calculateSlabTax(income: number, slabs: typeof NEW_REGIME_SLABS): number {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.min) break;
    const taxableInSlab = Math.min(income, slab.max) - slab.min;
    tax += taxableInSlab * slab.rate;
  }
  return tax;
}

export function calculateNewRegimeTax(grossIncome: number): TaxBreakdown {
  const standardDeduction = NEW_REGIME_STANDARD_DEDUCTION;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);

  let taxBeforeCess = calculateSlabTax(taxableIncome, NEW_REGIME_SLABS);

  // Rebate u/s 87A: No tax if taxable income <= 12,00,000 (marginal relief applies)
  if (taxableIncome <= 1200000) {
    taxBeforeCess = 0;
  }

  const cess = taxBeforeCess * 0.04;
  const totalTax = taxBeforeCess + cess;

  return {
    grossIncome,
    standardDeduction,
    section80C: 0,
    section80D: 0,
    otherDeductions: 0,
    taxableIncome,
    taxBeforeCess,
    cess,
    totalTax,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
    regime: 'new',
    monthlyTakeHome: (grossIncome - totalTax) / 12,
  };
}

export function calculateOldRegimeTax(
  grossIncome: number,
  deductions: {
    section80C?: number;
    section80D?: number;
    otherDeductions?: number;
  } = {}
): TaxBreakdown {
  const standardDeduction = OLD_REGIME_STANDARD_DEDUCTION;
  const section80C = Math.min(deductions.section80C || 0, SECTION_80C_LIMIT);
  const section80D = Math.min(deductions.section80D || 0, SECTION_80D_LIMIT_SELF + SECTION_80D_LIMIT_PARENTS);
  const otherDeductions = deductions.otherDeductions || 0;

  const totalDeductions = standardDeduction + section80C + section80D + otherDeductions;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  let taxBeforeCess = calculateSlabTax(taxableIncome, OLD_REGIME_SLABS);

  // Rebate u/s 87A: No tax if taxable income <= 5,00,000
  if (taxableIncome <= 500000) {
    taxBeforeCess = 0;
  }

  const cess = taxBeforeCess * 0.04;
  const totalTax = taxBeforeCess + cess;

  return {
    grossIncome,
    standardDeduction,
    section80C,
    section80D,
    otherDeductions,
    taxableIncome,
    taxBeforeCess,
    cess,
    totalTax,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
    regime: 'old',
    monthlyTakeHome: (grossIncome - totalTax) / 12,
  };
}

/**
 * Compare both regimes and recommend the best one.
 */
export function compareTaxRegimes(
  grossIncome: number,
  deductions: {
    section80C?: number;
    section80D?: number;
    otherDeductions?: number;
  } = {}
): {
  oldRegime: TaxBreakdown;
  newRegime: TaxBreakdown;
  recommended: 'old' | 'new';
  savings: number;
} {
  const oldRegime = calculateOldRegimeTax(grossIncome, deductions);
  const newRegime = calculateNewRegimeTax(grossIncome);

  const recommended = oldRegime.totalTax <= newRegime.totalTax ? 'old' : 'new';
  const savings = Math.abs(oldRegime.totalTax - newRegime.totalTax);

  return { oldRegime, newRegime, recommended, savings };
}
