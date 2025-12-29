/**
 * Standardized formatters using browser localization APIs.
 *
 * These formatters provide consistent number, currency, percentage,
 * and date formatting across the application.
 */

const DEFAULT_LOCALE = "en-US";

// Currency formatters
const currencyFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
	style: "currency",
	currency: "USD",
});

const currencyCompactFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
	style: "currency",
	currency: "USD",
	notation: "compact",
	maximumFractionDigits: 1,
});

// Number formatters
const numberFormatter = new Intl.NumberFormat(DEFAULT_LOCALE);

const decimalFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

// Percentage formatter
const percentFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
	style: "percent",
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
});

// Date formatter
const dateFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
	year: "numeric",
	month: "long",
	day: "numeric",
});

/**
 * Format a number as USD currency.
 * Example: 1234.56 → "$1,234.56"
 */
export function formatCurrency(amount: number): string {
	return currencyFormatter.format(amount);
}

/**
 * Format a number as compact USD currency for charts/axes.
 * Example: 1234567 → "$1.2M"
 */
export function formatCurrencyCompact(amount: number): string {
	return currencyCompactFormatter.format(amount);
}

/**
 * Format a number with locale-aware thousand separators.
 * Example: 1234567 → "1,234,567"
 */
export function formatNumber(value: number): string {
	return numberFormatter.format(value);
}

/**
 * Format a number with exactly 2 decimal places.
 * Example: 1234.5 → "1,234.50"
 */
export function formatDecimal(value: number): string {
	return decimalFormatter.format(value);
}

/**
 * Format a decimal as a percentage.
 * Example: 0.045 → "4.5%"
 */
export function formatPercent(value: number): string {
	return percentFormatter.format(value);
}

/**
 * Format a date string or Date object as a long date.
 * Example: "2024-01-15" → "January 15, 2024"
 */
export function formatDate(date: string | Date): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return dateFormatter.format(dateObj);
}

/**
 * Round a number to 2 decimal places for financial calculations.
 * Example: 123.456789 → 123.46
 */
export function roundCurrency(value: number): number {
	return Number(value.toFixed(2));
}
