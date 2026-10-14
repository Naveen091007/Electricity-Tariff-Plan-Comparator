import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatINR } from '../utils/currency'
import type { BillBreakdown } from '../utils/billing'
import type { ConsumptionInput } from '../utils/billing'
import { loadBillHistory, addBillHistoryEntry, saveBillHistory } from '../utils/storage'
import type { BillHistoryEntry } from '../utils/storage'

interface Props {
  breakdowns: BillBreakdown[]
  consumption: ConsumptionInput
}

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function fmtMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const d = new Date(parseInt(y), parseInt(m) - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

export default function BillHistory({ breakdowns, consumption }: Props) {
  const [history, setHistory] = useState<BillHistoryEntry[]>(() => loadBillHistory())

  function handleSave() {
    if (breakdowns.length === 0) return
    const bills = Object.fromEntries(breakdowns.map(b => [b.planId, b.totalBill]))
    const cheapestEntry = breakdowns.reduce((a, b) => a.totalBill < b.totalBill ? a : b)
    const entry: BillHistoryEntry = {
      month: currentMonth(),
      consumption,
      bills,
      cheapestPlanId: cheapestEntry.planId,
    }
    const updated = addBillHistoryEntry(entry)
    setHistory(updated)
  }

  function handleClear() {
    saveBillHistory([])
    setHistory([])
  }

  const chartData = useMemo(() => {
    return history.map(e => {
      const cheapestBill = e.bills[e.cheapestPlanId] ?? 0
      return { month: fmtMonth(e.month), bill: cheapestBill }
    })
  }, [history])

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-[#0f2744]">Bill History</h2>
          <p className="text-sm text-gray-500">Save each month to track trends over time.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={breakdowns.length === 0}
            aria-label="Save this month's bill to history"
            className="px-4 py-2 text-xs font-medium bg-[#2d7d46] hover:bg-[#246838] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            💾 Save This Month
          </button>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              aria-label="Clear all bill history"
              className="px-4 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p>No history yet. Save this month's bill to get started.</p>
        </div>
      ) : (
        <>
          {/* Line chart */}
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => formatINR(v as number)} tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(value: number) => formatINR(value)} labelFormatter={v => `Month: ${v}`} />
              <Line type="monotone" dataKey="bill" name="Cheapest Bill" stroke="#2d7d46" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-2 pr-3">Month</th>
                  <th className="text-right py-2 pr-3">Total kWh</th>
                  <th className="text-right py-2 pr-3">Cheapest Plan</th>
                  <th className="text-right py-2 pr-3">Bill</th>
                  <th className="text-right py-2">vs Last Month</th>
                </tr>
              </thead>
              <tbody>
                {history.map((e, i) => {
                  const bill = e.bills[e.cheapestPlanId] ?? 0
                  const prevBill = i > 0 ? (history[i - 1].bills[history[i - 1].cheapestPlanId] ?? 0) : null
                  const totalKwh = e.consumption.peak + e.consumption.normal + e.consumption.offPeak
                  let changeEl: React.ReactNode = '—'
                  if (prevBill !== null) {
                    const diff = bill - prevBill
                    if (diff > 0) {
                      changeEl = <span className="text-red-500">↑ {formatINR(diff)}</span>
                    } else if (diff < 0) {
                      changeEl = <span className="text-[#2d7d46]">↓ {formatINR(Math.abs(diff))}</span>
                    } else {
                      changeEl = <span className="text-gray-400">—</span>
                    }
                  }
                  return (
                    <tr key={e.month} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-3 text-gray-700">{fmtMonth(e.month)}</td>
                      <td className="py-2 pr-3 text-right text-gray-600">{totalKwh.toFixed(0)}</td>
                      <td className="py-2 pr-3 text-right text-gray-600">{e.cheapestPlanId}</td>
                      <td className="py-2 pr-3 text-right font-medium text-[#0f2744]">{formatINR(bill)}</td>
                      <td className="py-2 text-right">{changeEl}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-xs text-gray-400 mt-3">Data stored in this browser only.</p>
    </div>
  )
}
