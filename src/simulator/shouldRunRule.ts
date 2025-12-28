import type { Flow } from "./types";

export const shouldRunRule = (rule: Flow, currentDate: Date): boolean => {
  // 1. Check Lifespan (Start / End dates)
  if (rule.start && currentDate < rule.start) return false;
  if (rule.end && currentDate > rule.end) return false;

  // 2. Parse Schedule
  // Default to running every tick (MONTHLY) if undefined
  const schedule = rule.schedule;

  if (schedule === "monthly") return true;

  // Handle "ANNUALLY" (Runs in January)
  if (schedule === "annually") {
    return currentDate.getMonth() === 0; // 0 = Jan
  }

  // Future: Add "QUARTERLY", etc.
  return false;
};
