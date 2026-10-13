/**
 * Format a number as Indian Rupees (₹) using Indian locale formatting
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parse a currency string back to a number
 * Handles ₹ symbol, Indian number formatting (commas as thousand separators)
 */
export function parseINR(str: string): number {
  // Remove currency symbol, commas, and whitespace
  const cleaned = str
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .trim()
  
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format a number as INR without the currency symbol
 * Useful for charts or places where symbol is shown separately
 */
export function formatNumberINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}