import { useState, useMemo, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { formatINR } from '../utils/currency'
import {
  loadForecastHistory, addForecastEntry, resetForecastHistory,
  type ForecastEntry,
} from '../utils/storage'

// Format month label for display: "2024-03" → "Mar 24"
function fmtMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const d = new Date(parseInt(y), parseInt(m) - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

// Current month in YYYY-MM
function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Previous N months as YYYY-MM strings
function prevMonths(n: number): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = n; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

interface Props {
  currentBill: number  // ₹ from calculator
}

export default function BillForecast({ currentBill }: Props) {
  const [history, setHistory] = useState<ForecastEntry[]>([])
  const [newMonth, setNewMonth] = useState(currentMonth())
  const [newBill, setNewBill] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setHistory(loadForecastHistory())
  }, [])

  // Forecast = average of last 3 actual months
  const { forecast, usedMonths } = useMemo(() => {
    const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month))
    const last3 = sorted.slice(-3)
    if (last3.length === 0) return { forecast: null, usedMonths: 0 }
    const avg = last3.reduce((s, e) => s + e.bill, 0) / last3.length
    return { forecast: parseFloat(avg.toFixed(2)), usedMonths: last3.length }
  }, [history])

  function handleAdd() {
    const val = parseFloat(newBill)
    if (isNaN(val) || val <= 0) { setError('Enter a valid bill amount.'); return }
    if (!newMonth) { setError('Select a month.'); return }
    setError('')
    const updated = addForecastEntry({ month: newMonth, bill: val, consumption: 0 })
    setHistory(updated)
    setNewBill('')
  }

  function handleAddCurrent() {
    if (currentBill <= 0) return
    const updated = addForecastEntry({ month: currentMonth(), bill: parseFloat(currentBill.toFixed(2)), consumption: 0 })
    setHistory(updated)
  }

  function handleReset() {
    resetForecastHistory()
    setHistory([])
  }

  // Chart data: history entries + forecast next month
  const chartData = useMemo(() => {
    const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month))
    const rows = sorted.map(e => ({
      month: fmtMonth(e.month),
      actual: e.bill,
      forecast: null as number | null,
    }))

    if (forecast !== null) {
      // Next month
      const lastEntry = sorted[sorted.length - 1]
      const [ly, lm] = (lastEntry?.month ?? currentMonth()).split('-')
      const nextDate = new Date(parseInt(ly), parseInt(lm), 1)
      const nextMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
      rows.push({ month: fmtMonth(nextMonthStr), actual: null as unknown as number, forecast })
    }
    return rows
  }, [history, forecast])

  // Suggested months for picker
  const monthOptions = useMemo(() => {
    const ms = prevMonths(12)
    ms.push(currentMonth())
    return ms
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-[#0f2744]">📈 Bill Forecast</h2>
        {history.length > 0 && (
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-500">Clear history</button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Add previous monthly bills to see a simple 3-month average forecast.
        <strong className="text-amber-700"> Results are estimates only.</strong>
      </p>

      {/* Add entry form */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Month</label>
            <select
              value={newMonth}
              onChange={e => setNewMonth(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d46]/50"
            >
              {monthOptions.map(m => (
                <option key={m} value={m}>{fmtMonth(m)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bill Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                min="1"
                step="10"
                value={newBill}
                onChange={e => setNewBill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. 1800"
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d46]/50"
              />
            </div>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex-1 bg-[#2d7d46] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#246838]"
          >
            Add Entry
          </button>
          {currentBill > 0 && (
            <button
              onClick={handleAddCurrent}
              className="flex-1 border border-[#2d7d46] text-[#2d7d46] py-2 rounded-lg text-sm font-medium hover:bg-[#e8f5ee]"
            >
              Add Current ({formatINR(currentBill)})
            </button>
          )}
        </div>
      </div>

      {/* Forecast result */}
      {forecast !== null && (
        <div className="bg-[#e8f5ee] border border-[#2d7d46]/20 rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              Estimated next month ({usedMonths}-month average)
            </div>
            <div className="text-2xl font-bold text-[#0f2744]">{formatINR(forecast)}</div>
          </div>
          <div className="text-4xl">🔮</div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `₹${v}`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => formatINR(value)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Bill"
              stroke="#1e40af"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#2d7d46"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-sm">Add at least one monthly bill entry to see the forecast chart.</p>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Forecast method: simple average of the last 3 months. This is an estimate, not a guarantee.
        Actual bills depend on tariff changes, seasonal usage, and other factors.
      </p>
    </div>
  )
}
