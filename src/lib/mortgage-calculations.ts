/**
 * Calculates the monthly payment for an annuity mortgage.
 * With an annuity mortgage, the total monthly payment stays constant,
 * but the split between interest and principal changes over time.
 *
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateAnnuityPayment(
  loanAmount: number,
  annualRate: number,
  termYears: number,
): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;

  if (monthlyRate === 0) {
    return loanAmount / totalMonths;
  }

  const factor = (1 + monthlyRate) ** totalMonths;
  return loanAmount * ((monthlyRate * factor) / (factor - 1));
}

/**
 * Calculates the fixed monthly principal payment for a linear mortgage.
 * With a linear mortgage, you pay the same principal every month,
 * plus interest on the remaining balance.
 */
export function calculateLinearPrincipal(
  loanAmount: number,
  termYears: number,
): number {
  return loanAmount / (termYears * 12);
}
