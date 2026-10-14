/**
 * WattWise localStorage utilities
 * Safe read/write with defaults and error handling
 */

const KEYS = {
  BUDGET: 'wattwise_budget',
  FORECAST_HISTORY: 'wattwise_forecast_history',
  APPLIANCES: 'wattwise_appliances',
  CONSUMPTION: 'wattwise_consumption',
  BILL_HISTORY: 'wattwise_bill_history',
} as const

export type StorageKey = keyof typeof KEYS

// ---- Generic helpers -------------------------------------------------------

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

// ---- Budget ----------------------------------------------------------------

export interface BudgetSettings {
  monthlyBudget: number  // ₹
}

const DEFAULT_BUDGET: BudgetSettings = { monthlyBudget: 0 }

export function loadBudget(): BudgetSettings {
  return safeGet(KEYS.BUDGET, DEFAULT_BUDGET)
}

export function saveBudget(settings: BudgetSettings): void {
  safeSet(KEYS.BUDGET, settings)
}

export function resetBudget(): void {
  safeRemove(KEYS.BUDGET)
}

// ---- Forecast history (monthly bill entries) --------------------------------

export interface ForecastEntry {
  month: string   // "YYYY-MM" format
  bill: number    // ₹
  consumption: number  // kWh (optional context)
}

const MAX_HISTORY = 12

export function loadForecastHistory(): ForecastEntry[] {
  return safeGet<ForecastEntry[]>(KEYS.FORECAST_HISTORY, [])
}

export function saveForecastHistory(entries: ForecastEntry[]): void {
  safeSet(KEYS.FORECAST_HISTORY, entries.slice(-MAX_HISTORY))
}

export function addForecastEntry(entry: ForecastEntry): ForecastEntry[] {
  const existing = loadForecastHistory()
  // Replace if same month exists
  const updated = existing.filter(e => e.month !== entry.month)
  updated.push(entry)
  updated.sort((a, b) => a.month.localeCompare(b.month))
  const trimmed = updated.slice(-MAX_HISTORY)
  saveForecastHistory(trimmed)
  return trimmed
}

export function resetForecastHistory(): void {
  safeRemove(KEYS.FORECAST_HISTORY)
}

// ---- Saved consumption -----------------------------------------------------

export interface SavedConsumption {
  peak: number
  normal: number
  offPeak: number
}

export function loadConsumption(): SavedConsumption | null {
  return safeGet<SavedConsumption | null>(KEYS.CONSUMPTION, null)
}

export function saveConsumption(c: SavedConsumption): void {
  safeSet(KEYS.CONSUMPTION, c)
}

// ---- Reset all -------------------------------------------------------------

export function resetAllData(): void {
  Object.values(KEYS).forEach(safeRemove)
}

// ---- Bill history ----------------------------------------------------------

export interface BillHistoryEntry {
  month: string  // "YYYY-MM"
  consumption: { peak: number; normal: number; offPeak: number }
  bills: Record<string, number>  // planId → totalBill
  cheapestPlanId: string
}

const MAX_BILL_HISTORY = 12

export function loadBillHistory(): BillHistoryEntry[] {
  return safeGet<BillHistoryEntry[]>(KEYS.BILL_HISTORY, [])
}

export function saveBillHistory(entries: BillHistoryEntry[]): void {
  safeSet(KEYS.BILL_HISTORY, entries.slice(-MAX_BILL_HISTORY))
}

export function addBillHistoryEntry(entry: BillHistoryEntry): BillHistoryEntry[] {
  const existing = loadBillHistory()
  const updated = existing.filter(e => e.month !== entry.month)
  updated.push(entry)
  updated.sort((a, b) => a.month.localeCompare(b.month))
  const trimmed = updated.slice(-MAX_BILL_HISTORY)
  saveBillHistory(trimmed)
  return trimmed
}
