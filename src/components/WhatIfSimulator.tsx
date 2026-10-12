import React, { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { generateWhatIfSeries, findBreakEven } from '../utils/billing'
import type { TariffPlan } from '../data/tariffs'
import type { ConsumptionInput } from '../utils/billing'

interface Props {
  plans: TariffPlan[]
  consumption: ConsumptionInput
}

export default function WhatIfSimulator({ plans, consumption }: Props) {
  const [maxPeak, setMaxPeak] = useState(400)

  const series = useMemo(
    () => generateWhatIfSeries(plans, consumption.normal, consumption.offPeak, maxPeak, 50),
    [plans, consumption.normal, consumption.offPeak, maxPeak]
  )

  const breakEvens = useMemo(() => {
    const results: { labelA: string; labelB: string; x: number }[] = []
    for (let i = 0; i < plans.length; i++) {
      for (let j = i + 1; j < plans.length; j++) {
        const x = findBreakEven(plans[i], plans[j], consumption.normal, consumption.offPeak)
        if (x !== null && x <= maxPeak) {
          results.push({ labelA: plans[i].name, labelB: plans[j].name, x })
        }
      }
    }
    return results
  }, [plans, consumption.normal, consumption.offPeak, maxPeak])

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
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={series} margin={{top: 4, right: 16, left: 0, bottom: 0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="peak" tick={{fontSize: 11}} label={{value: 'Peak kWh', position: 'insideBottomRight', offset: -4, fontSize: 11}} />
          <YAxis tickFormatter={v => `$${v}`} tick={{fontSize: 11}} />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} labelFormatter={v => `Peak: ${v} kWh`} />
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