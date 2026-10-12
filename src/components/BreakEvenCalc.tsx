import React, { useMemo, useState } from 'react'
import { findBreakEven } from '../utils/billing'
import type { TariffPlan } from '../data/tariffs'
import type { ConsumptionInput } from '../utils/billing'

interface Props {
  plans: TariffPlan[]
  consumption: ConsumptionInput
}

export default function BreakEvenCalc({ plans, consumption }: Props) {
  const [planAId, setPlanAId] = useState(plans[0].id)
  const [planBId, setPlanBId] = useState(plans[1].id)

  const planA = plans.find(p => p.id === planAId)!
  const planB = plans.find(p => p.id === planBId)!

  const breakEven = useMemo(
    () => findBreakEven(planA, planB, consumption.normal, consumption.offPeak),
    [planA, planB, consumption.normal, consumption.offPeak]
  )

  const cheaperBelow = useMemo(() => {
    if (breakEven === null) return null
    const billA0 = planA.fixedCharge + planA.peakRate * 0 + planA.normalRate * consumption.normal + planA.offPeakRate * consumption.offPeak
    const billB0 = planB.fixedCharge + planB.peakRate * 0 + planB.normalRate * consumption.normal + planB.offPeakRate * consumption.offPeak
    return billA0 < billB0 ? planA.name : planB.name
  }, [planA, planB, consumption, breakEven])

  const cheaperAbove = useMemo(() => {
    if (breakEven === null) return null
    const billA1 = planA.fixedCharge + planA.peakRate * 1000 + planA.normalRate * consumption.normal + planA.offPeakRate * consumption.offPeak
    const billB1 = planB.fixedCharge + planB.peakRate * 1000 + planB.normalRate * consumption.normal + planB.offPeakRate * consumption.offPeak
    return billA1 < billB1 ? planA.name : planB.name
  }, [planA, planB, consumption, breakEven])

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#0f2744] mb-1">Break-Even Calculator</h2>
      <p className="text-sm text-gray-500 mb-4">
        Find the exact peak usage where two plans cost the same (normal &amp; off-peak fixed to your inputs).
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {([{ id: planAId, setId: setPlanAId, label: 'Plan A' }, { id: planBId, setId: setPlanBId, label: 'Plan B' }] as const).map(
          ({ id, setId, label }) => (
            <div key={label}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <select
                value={id}
                onChange={e => setId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d46]/50"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )
        )}
      </div>
      {planAId === planBId ? (
        <div className="bg-yellow-50 text-yellow-700 rounded-lg px-4 py-3 text-sm">
          Select two different plans to compare.
        </div>
      ) : breakEven === null ? (
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
          These plans have parallel cost curves in the peak dimension — they never break even.
        </div>
      ) : (
        <div className="bg-[#e8f5ee] rounded-xl px-5 py-4 text-center">
          <div className="text-3xl font-bold text-[#0f2744]">{breakEven} kWh</div>
          <div className="text-sm text-gray-500 mt-1">
            of peak usage per month is the break-even point
          </div>
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <div>Below {breakEven} kWh peak → <strong className="text-[#0f2744]">{cheaperBelow}</strong> is cheaper</div>
            <div>Above {breakEven} kWh peak → <strong className="text-[#0f2744]">{cheaperAbove}</strong> is cheaper</div>
          </div>
        </div>
      )}
    </div>
  )
}