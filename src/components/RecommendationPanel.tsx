import React from 'react'
import type { BillBreakdown } from '../utils/billing'
import type { TariffPlan } from '../data/tariffs'

interface Props {
  breakdowns: BillBreakdown[]
  cheapestId: string | null
  savingsVsCheapest: Record<string, number>
  plans: TariffPlan[]
}

export default function RecommendationPanel({ breakdowns, cheapestId, savingsVsCheapest, plans }: Props) {
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
                <div className="text-2xl font-bold text-[#2d7d46]">${monthlySaving.toFixed(2)}</div>
                <div className="text-xs text-gray-500">monthly saving</div>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-[#2d7d46]">${annualSaving.toFixed(2)}</div>
                <div className="text-xs text-gray-500">annual saving</div>
              </div>
            </div>
          )}
          {monthlySaving <= 0.01 && (
            <p className="mt-2 text-sm text-gray-500">All plans cost essentially the same with your current usage.</p>
          )}
          <div className="mt-3 text-xs text-gray-500 bg-white/60 rounded-lg px-3 py-2">
            <strong>How we calculated this:</strong>{' '}
            {cheapest.planName} = ${cheapest.fixedCharge.toFixed(2)} fixed
            + ${cheapest.peakCost.toFixed(2)} peak
            + ${cheapest.normalCost.toFixed(2)} normal
            + ${cheapest.offPeakCost.toFixed(2)} off-peak
            = <strong>${cheapest.totalBill.toFixed(2)}/month</strong>
          </div>
        </div>
      </div>
    </div>
  )
}