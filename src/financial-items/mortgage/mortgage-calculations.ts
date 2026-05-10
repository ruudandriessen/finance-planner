/**
 * Calculates the monthly payment for an annuity mortgage.
 * With an annuity mortgage, the total monthly payment stays constant,
 * but the split between interest and principal changes over time.
 *
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 *
 * @param loanAmount - The total loan amount
 * @param annualRate - The annual interest rate as a decimal (e.g., 0.045 for 4.5%)
 * @param termYears - The loan term in years
 */
export function calculateAnnuityPayment(
  loanAmount: number,
  annualRate: number,
  termYears: number,
): number {
  const monthlyRate = annualRate / 12;
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
export function calculateLinearPrincipal(loanAmount: number, termYears: number): number {
  return loanAmount / (termYears * 12);
}

/**
 * Calculates the first monthly payment shown for a mortgage.
 * Annuity mortgages have a fixed payment; linear mortgages start highest
 * because interest is calculated against the full starting balance.
 */
export function calculateInitialMortgagePayment(
  loanAmount: number,
  annualRate: number,
  termYears: number,
  paymentType: "annuity" | "linear",
): number {
  if (paymentType === "annuity") {
    return calculateAnnuityPayment(loanAmount, annualRate, termYears);
  }

  return calculateLinearPrincipal(loanAmount, termYears) + (loanAmount * annualRate) / 12;
}
