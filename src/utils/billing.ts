import type { TariffPlan } from '../data/tariffs'

export interface ConsumptionInput {
  peak: number
  normal: number
  offPeak: number
}

export interface BillBreakdown {
  planId: string
  planName: string
  fixedCharge: number
  peakCost: number
  normalCost: number
  offPeakCost: number
  totalEnergyCost: number
  totalBill: number
  color: string
}

export function calculateBill(
  plan: TariffPlan,
  consumption: ConsumptionInput
): BillBreakdown {
  const peakCost    = plan.peakRate    * consumption.peak
  const normalCost  = plan.normalRate  * consumption.normal
  const offPeakCost = plan.offPeakRate * consumption.offPeak
  const totalEnergyCost = peakCost + normalCost + offPeakCost
  const totalBill = plan.fixedCharge + totalEnergyCost

  return {
    planId: plan.id,
    planName: plan.name,
    fixedCharge: plan.fixedCharge,
    peakCost,
    normalCost,
    offPeakCost,
    totalEnergyCost,
    totalBill,
    color: plan.color,
  }
}

export function calculateAllBills(
  plans: TariffPlan[],
  consumption: ConsumptionInput
): {
  breakdowns: BillBreakdown[]
  cheapestId: string | null
  savingsVsCheapest: Record<string, number>
} {
  const breakdowns = plans.map(p => calculateBill(p, consumption))
  const sorted = [...breakdowns].sort((a, b) => a.totalBill - b.totalBill)
  const cheapest = sorted[0]
  const cheapestId = cheapest ? cheapest.planId : null

  const savingsVsCheapest: Record<string, number> = {}
  for (const b of breakdowns) {
    savingsVsCheapest[b.planId] =
      cheapest ? parseFloat((b.totalBill - cheapest.totalBill).toFixed(2)) : 0
  }

  return { breakdowns, cheapestId, savingsVsCheapest }
}

export function findBreakEven(
  planA: TariffPlan,
  planB: TariffPlan,
  normal: number,
  offPeak: number
): number | null {
  const constDiff =
    (planA.fixedCharge - planB.fixedCharge) +
    (planA.normalRate - planB.normalRate) * normal +
    (planA.offPeakRate - planB.offPeakRate) * offPeak
  const rateDiff = planA.peakRate - planB.peakRate

  if (Math.abs(rateDiff) < 1e-10) return null
  const x = -constDiff / rateDiff
  return x < 0 ? null : parseFloat(x.toFixed(1))
}

export function generateWhatIfSeries(
  plans: TariffPlan[],
  normal: number,
  offPeak: number,
  maxPeak = 400,
  steps = 40
): { peak: number; [planId: string]: number }[] {
  const result = []
  for (let i = 0; i <= steps; i++) {
    const peak = parseFloat(((i / steps) * maxPeak).toFixed(1))
    const row: Record<string, number> = { peak }
    for (const plan of plans) {
      const b = calculateBill(plan, { peak, normal, offPeak })
      row[plan.id] = parseFloat(b.totalBill.toFixed(2))
    }
    result.push(row)
  }
  return result
}

export function validateConsumption(input: Partial<ConsumptionInput>): Record<string, string> {
  const errors: Record<string, string> = {}
  const fields: (keyof ConsumptionInput)[] = ['peak', 'normal', 'offPeak']
  for (const field of fields) {
    const val = input[field]
    if (val === undefined || val === null || isNaN(val as number)) {
      errors[field] = 'Please enter a valid number.'
    } else if ((val as number) < 0) {
      errors[field] = 'Value cannot be negative.'
    } else if ((val as number) > 10000) {
      errors[field] = 'Value seems too large (max 10 000 kWh).'
    }
  }
  return errors
}