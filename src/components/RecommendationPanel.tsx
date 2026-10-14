
import type { BillBreakdown, ConsumptionInput } from '../utils/billing'
import { calculateBill } from '../utils/billing'
import type { TariffPlan } from '../data/tariffs'
import { formatINR } from '../utils/currency'

interface Props {
  breakdowns: BillBreakdown[]
  cheapestId: string | null
  plans: TariffPlan[]
  consumption: ConsumptionInput
}

export default function RecommendationPanel({ breakdowns, cheapestId, plans, consumption }: Props) {
  if (!cheapestId) return null

  const cheapest = breakdowns.find(b => b.planId === cheapestId)!
  const plan = plans.find(p => p.id === cheapestId)!
  const secondCheapest = [...breakdowns].sort((a, b) => a.totalBill - b.totalBill)[1]
  const monthlySaving = secondCheapest ? secondCheapest.totalBill - cheapest.totalBill : 0
  const annualSaving  = monthlySaving * 12

  return (
    <div className="rounded-2xl border border-[#2d7d46]/30 bg-[#e8f5ee] p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="text-3xl">💡</div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[#0f2744]">
            Recommendation: <span className="text-[#2d7d46]">{cheapest.planName}</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
          {monthlySaving > 0.01 && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-[#2d7d46]">{formatINR(monthlySaving)}</div>
                <div className="text-xs text-gray-500">monthly saving</div>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-[#2d7d46]">{formatINR(annualSaving)}</div>
                <div className="text-xs text-gray-500">annual saving</div>
              </div>
            </div>
          )}
          {monthlySaving <= 0.01 && (
            <p className="mt-2 text-sm text-gray-500">All plans cost essentially the same with your current usage.</p>
          )}
          <div className="mt-3 text-xs text-gray-500 bg-white/60 rounded-lg px-3 py-2">
            <strong>How we calculated this:</strong>{' '}
            {cheapest.planName} = {formatINR(cheapest.fixedCharge)} fixed
            + {formatINR(cheapest.peakCost)} peak
            + {formatINR(cheapest.normalCost)} normal
            + {formatINR(cheapest.offPeakCost)} off-peak
            = <strong>{formatINR(cheapest.totalBill)}/month</strong>
          </div>

          {/* Smart Savings Actions */}
          <div className="mt-4 border-t border-[#2d7d46]/20 pt-4">
            <h3 className="text-sm font-semibold text-[#0f2744] mb-3">💡 Smart Savings Actions</h3>
            <div className="space-y-2 text-xs text-gray-600">
              {/* Tip 1: Peak shift (only if peak > 100) */}
              {consumption.peak > 100 && (() => {
                const adjPeak = consumption.peak * 0.8
                const adjOffPeak = consumption.offPeak + consumption.peak * 0.2
                const newBills = plans.map(p => calculateBill(p, { ...consumption, peak: adjPeak, offPeak: adjOffPeak }))
                const newCheapest = newBills.reduce((a, b) => a.totalBill < b.totalBill ? a : b)
                const saving = cheapest.totalBill - newCheapest.totalBill
                return saving > 0 ? (
                  <div className="bg-white rounded-lg px-3 py-2 border border-[#2d7d46]/20">
                    <span className="font-medium text-[#0f2744]">Shift 20% peak to off-peak: </span>
                    save {formatINR(saving)}/month ({formatINR(saving * 12)}/year)
                  </div>
                ) : null
              })()}
              {/* Tip 2: Plan switch saving */}
              {monthlySaving > 0.01 && (
                <div className="bg-white rounded-lg px-3 py-2 border border-[#2d7d46]/20">
                  <span className="font-medium text-[#0f2744]">Switch to {cheapest.planName}: </span>
                  save {formatINR(monthlySaving)}/month ({formatINR(annualSaving)}/year)
                </div>
              )}
              {/* Tip 3: Reduce all by 10% */}
              {(() => {
                const scaled = {
                  peak: consumption.peak * 0.9,
                  normal: consumption.normal * 0.9,
                  offPeak: consumption.offPeak * 0.9,
                }
                const newBills = plans.map(p => calculateBill(p, scaled))
                const newCheapestBill = newBills.reduce((a, b) => a.totalBill < b.totalBill ? a : b).totalBill
                const saving = cheapest.totalBill - newCheapestBill
                return saving > 0.01 ? (
                  <div className="bg-white rounded-lg px-3 py-2 border border-[#2d7d46]/20">
                    <span className="font-medium text-[#0f2744]">Reduce overall usage by 10%: </span>
                    new best bill {formatINR(newCheapestBill)}/month, saving {formatINR(saving)}/month
                  </div>
                ) : null
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
