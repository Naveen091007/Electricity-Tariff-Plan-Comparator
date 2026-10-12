import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { BillBreakdown } from '../utils/billing'

interface Props {
  breakdowns: BillBreakdown[]
  cheapestId: string | null
}

export default function ComparisonChart({ breakdowns, cheapestId }: Props) {
  const data = breakdowns.map(b => ({
    name: b.planName,
    'Fixed Charge': parseFloat(b.fixedCharge.toFixed(2)),
    'Peak Energy':  parseFloat(b.peakCost.toFixed(2)),
    'Normal Energy': parseFloat(b.normalCost.toFixed(2)),
    'Off-Peak Energy': parseFloat(b.offPeakCost.toFixed(2)),
    color: b.color,
    id: b.planId,
  }))

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#0f2744] mb-4">Bill Comparison</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{top: 4, right: 16, left: 0, bottom: 0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{fontSize: 12}} />
          <YAxis tickFormatter={v => `$${v}`} tick={{fontSize: 12}} />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend wrapperStyle={{fontSize: 12}} />
          <Bar dataKey="Fixed Charge"    stackId="a" fill="#94a3b8" />
          <Bar dataKey="Peak Energy"     stackId="a" fill="#f87171" />
          <Bar dataKey="Normal Energy"   stackId="a" fill="#fbbf24" />
          <Bar dataKey="Off-Peak Energy" stackId="a" fill="#34d399" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}