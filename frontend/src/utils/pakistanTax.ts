/**
 * Pakistani Federal Board of Revenue (FBR) Salaried Income Tax & Statutory Payroll Engine
 * Tax Year 2024-2025 / 2025-2026 Standards
 */

export interface PakistaniSalaryBreakdown {
  basicSalary: number; // ~60% of total compensation
  houseRentAllowance: number; // ~25%
  medicalUtilityAllowance: number; // ~15%
  grossSalary: number;
  annualGrossSalary: number;
  monthlyFbrTax: number;
  annualFbrTax: number;
  fbrTaxSlab: string;
  eobiEmployeeShare: number; // Fixed PKR 370/mo
  eobiEmployerShare: number; // Fixed PKR 1,850/mo
  providentFund: number; // 5% of basic
  overtimePay: number;
  attendancePenalty: number;
  totalDeductions: number;
  netSalary: number;
}

/**
 * Computes official FBR Income Tax for Salaried Individuals
 * Slabs (Tax Year 2024-2025):
 * 1. Up to PKR 600,000 / yr (PKR 50,000/mo): 0%
 * 2. PKR 600,001 - 1,200,000 / yr (PKR 50,001 - 100,000/mo): 5% of amount > 600,000
 * 3. PKR 1,200,001 - 2,200,000 / yr (PKR 100,001 - 183,333/mo): Rs. 30,000 + 15% of amount > 1,200,000
 * 4. PKR 2,200,001 - 3,200,000 / yr (PKR 183,334 - 266,667/mo): Rs. 180,000 + 25% of amount > 2,200,000
 * 5. PKR 3,200,001 - 4,100,000 / yr (PKR 266,668 - 341,667/mo): Rs. 430,000 + 30% of amount > 3,200,000
 * 6. Above PKR 4,100,000 / yr (> PKR 341,667/mo): Rs. 700,000 + 35% of amount > 4,100,000
 */
export function calculatePakistaniFbrTax(annualGrossSalary: number): {
  monthlyTax: number;
  annualTax: number;
  slab: string;
} {
  let annualTax = 0;
  let slab = 'Slab 1: Up to PKR 600,000 (0% Exempt)';

  if (annualGrossSalary <= 600000) {
    annualTax = 0;
    slab = 'Slab 1: Up to PKR 600,000 (0% Exempt)';
  } else if (annualGrossSalary <= 1200000) {
    annualTax = (annualGrossSalary - 600000) * 0.05;
    slab = 'Slab 2: PKR 600,001 - 1,200,000 (5% excess)';
  } else if (annualGrossSalary <= 2200000) {
    annualTax = 30000 + (annualGrossSalary - 1200000) * 0.15;
    slab = 'Slab 3: PKR 1,200,001 - 2,200,000 (Rs. 30k + 15%)';
  } else if (annualGrossSalary <= 3200000) {
    annualTax = 180000 + (annualGrossSalary - 2200000) * 0.25;
    slab = 'Slab 4: PKR 2,200,001 - 3,200,000 (Rs. 180k + 25%)';
  } else if (annualGrossSalary <= 4100000) {
    annualTax = 430000 + (annualGrossSalary - 3200000) * 0.30;
    slab = 'Slab 5: PKR 3,200,001 - 4,100,000 (Rs. 430k + 30%)';
  } else {
    annualTax = 700000 + (annualGrossSalary - 4100000) * 0.35;
    slab = 'Slab 6: Above PKR 4,100,000 (Rs. 700k + 35%)';
  }

  const monthlyTax = Math.round(annualTax / 12);
  return {
    monthlyTax,
    annualTax: Math.round(annualTax),
    slab,
  };
}

/**
 * Calculates complete Pakistani compensation breakdown in PKR
 */
export function computePakistaniSalary(
  baseSalaryPkr: number,
  overtimeHours: number = 0,
  lateDays: number = 0,
  absentDays: number = 0
): PakistaniSalaryBreakdown {
  // Standard Pakistani Corporate Structure:
  // Base package distributes: 60% Basic, 25% House Rent, 15% Medical/Utility
  const basicSalary = Math.round(baseSalaryPkr * 0.6);
  const houseRentAllowance = Math.round(baseSalaryPkr * 0.25);
  const medicalUtilityAllowance = Math.round(baseSalaryPkr * 0.15);

  // Hourly overtime calculation: (Basic / 30 / 8) * 1.5 * overtimeHours
  const hourlyRate = basicSalary / 30 / 8;
  const overtimePay = Math.round(hourlyRate * 1.5 * overtimeHours);

  const grossSalary = basicSalary + houseRentAllowance + medicalUtilityAllowance + overtimePay;
  const annualGrossSalary = grossSalary * 12;

  // Official FBR Tax
  const { monthlyTax: monthlyFbrTax, annualTax: annualFbrTax, slab: fbrTaxSlab } =
    calculatePakistaniFbrTax(annualGrossSalary);

  // Statutory EOBI (Standard employee contribution capped at Rs. 370 / mo)
  const eobiEmployeeShare = 370;
  const eobiEmployerShare = 1850;

  // Provident Fund (5% of Basic)
  const providentFund = Math.round(basicSalary * 0.05);

  // Attendance Deductions: Full day per absence, half-day per 3 late arrivals
  const dailyRate = Math.round(basicSalary / 30);
  const unpaidAbsence = absentDays * dailyRate;
  const lateBlocks = Math.floor(lateDays / 3);
  const latenessDeduction = Math.round(lateBlocks * 0.5 * dailyRate);
  const attendancePenalty = unpaidAbsence + latenessDeduction;

  const totalDeductions = monthlyFbrTax + eobiEmployeeShare + providentFund + attendancePenalty;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    basicSalary,
    houseRentAllowance,
    medicalUtilityAllowance,
    grossSalary,
    annualGrossSalary,
    monthlyFbrTax,
    annualFbrTax,
    fbrTaxSlab,
    eobiEmployeeShare,
    eobiEmployerShare,
    providentFund,
    overtimePay,
    attendancePenalty,
    totalDeductions,
    netSalary,
  };
}

/**
 * Format currency in Pakistani Rupees (PKR)
 */
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.');
}
