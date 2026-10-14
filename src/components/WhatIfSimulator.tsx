import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { generateWhatIfSeries, findBreakEven, calculateBill } from '../utils/billing'
import type { TariffPlan } from '../data/tariffs'
import type { ConsumptionInput } from '../utils/billing'
import { formatINR } from '../utils/currency'

interface Props {
  plans: TariffPlan[]
  consumption: ConsumptionInput
}

export default function WhatIfSimulator({ plans, consumption }: Props) {
  const [maxPeak, setMaxPeak] = useState(400)
  const [peakShiftPct, setPeakShiftPct] = useState(0)   // 0–50, step 5
  const [scalePct, setScalePct]         = useState(100)  // 70/90/100/110/120

  const effectiveConsumption = useMemo((): ConsumptionInput => {
    const shifted = {
      peak: consumption.peak * (1 - peakShiftPct / 100),
      normal: consumption.normal,
      offPeak: consumption.offPeak + consumption.peak * (peakShiftPct / 100),
    }
    return {
      peak: shifted.peak * (scalePct / 100),
      normal: shifted.normal * (scalePct / 100),
      offPeak: shifted.offPeak * (scalePct / 100),
    }
  }, [consumption, peakShiftPct, scalePct])

  const series = useMemo(
    () => generateWhatIfSeries(plans, effectiveConsumption.normal, effectiveConsumption.offPeak, maxPeak, 50),
    [plans, effectiveConsumption.normal, effectiveConsumption.offPeak, maxPeak]
  )

  const breakEvens = useMemo(() => {
    const results: { labelA: string; labelB: string; x: number }[] = []
    for (let i = 0; i < plans.length; i++) {
      for (let j = i + 1; j < plans.length; j++) {
        const x = findBreakEven(plans[i], plans[j], effectiveConsumption.normal, effectiveConsumption.offPeak)
        if (x !== null && x <= maxPeak) {
          results.push({ labelA: plans[i].name, labelB: plans[j].name, x })
        }
      }
    }
    return results
  }, [plans, effectiveConsumption.normal, effectiveConsumption.offPeak, maxPeak])

  const originalCheapestBill = useMemo(() => {
    if (plans.length === 0) return 0
    return Math.min(...plans.map(p => calculateBill(p, consumption).totalBill))
  }, [plans, consumption])

  const simulatedCheapestBill = useMemo(() => {
    if (plans.length === 0) return 0
    return Math.min(...plans.map(p => calculateBill(p, effectiveConsumption).totalBill))
  }, [plans, effectiveConsumption])

  const quickButtons: [string, number][] = [['−30%', 70], ['−10%', 90], ['Original', 100], ['+10%', 110], ['+20%', 120]]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0f2744]">What-If Simulator</h2>
          <p className="text-sm text-gray-500">See how changing your peak usage affects total cost.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Max peak axis:
          <input
            type="number"
            min={50}
            max={2000}
            step={50}
            value={maxPeak}
            onChange={e => setMaxPeak(Math.max(50, parseInt(e.target.value) || 400))}
            className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d46]/50"
          />
          kWh
        </label>
      </div>

      {/* Peak shift slider */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Shift % of peak to off-peak: <strong>{peakShiftPct}%</strong>
        </label>
        <input
          type="range"
          min={0}
          max={50}
          step={5}
          value={peakShiftPct}
          onChange={e => setPeakShiftPct(parseInt(e.target.value))}
          className="w-full accent-[#2d7d46]"
          aria-label="Peak shift percentage"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>0%</span><span>25%</span><span>50%</span>
        </div>
      </div>

      {/* Quick adjust buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickButtons.map(([label, val]) => (
          <button
            key={val}
            onClick={() => setScalePct(val)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              scalePct === val
                ? 'bg-[#2d7d46] text-white border-[#2d7d46]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#2d7d46]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Before/after summary box */}
      {(peakShiftPct > 0 || scalePct !== 100) && (
        <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-50 rounded-xl p-4 text-center text-sm">
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Original cheapest</div>
            <div className="font-bold text-[#0f2744]">{formatINR(originalCheapestBill)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Simulated cheapest</div>
            <div className="font-bold text-[#0f2744]">{formatINR(simulatedCheapestBill)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Monthly saving</div>
            <div
              className={`font-bold ${
                originalCheapestBill - simulatedCheapestBill > 0 ? 'text-[#2d7d46]' : 'text-red-500'
              }`}
            >
              {formatINR(Math.abs(originalCheapestBill - simulatedCheapestBill))}
              {originalCheapestBill - simulatedCheapestBill >= 0 ? ' ↓' : ' ↑'}
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={series} margin={{top: 4, right: 16, left: 0, bottom: 0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="peak" tick={{fontSize: 11}} label={{value: 'Peak kWh', position: 'insideBottomRight', offset: -4, fontSize: 11}} />
          <YAxis tickFormatter={v => formatINR(v as number)} tick={{fontSize: 11}} width={80} />
          <Tooltip formatter={(value: number) => formatINR(value)} labelFormatter={v => `Peak: ${v} kWh`} />
          <Legend wrapperStyle={{fontSize: 12}} />
          {plans.map(p => (
            <Line key={p.id} type="monotone" dataKey={p.id} name={p.name} stroke={p.color} strokeWidth={2} dot={false} />
          ))}
          {breakEvens.map(({ x, labelA, labelB }) => (
            <ReferenceLine
              key={`${labelA}-${labelB}`}
              x={x}
              stroke="#9ca3af"
              strokeDasharray="4 2"
              label={{ value: `${x} kWh`, position: 'top', fontSize: 10, fill: '#6b7280' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {breakEvens.length > 0 && (
        <div className="mt-3 space-y-1">
          {breakEvens.map(({ labelA, labelB, x }) => (
            <div key={`${labelA}-${labelB}`} className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-1.5">
              <strong>{labelA}</strong> and <strong>{labelB}</strong> cost the same at <strong>{x} kWh</strong> peak usage.
            </div>
          ))}
        </div>
      )}
      {breakEvens.length === 0 && (
        <p className="mt-2 text-xs text-gray-400">No break-even points in the current peak range.</p>
      )}
    </div>
  )
}
