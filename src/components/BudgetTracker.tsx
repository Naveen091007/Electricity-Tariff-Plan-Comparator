import { useState, useEffect } from 'react'
import { formatINR } from '../utils/currency'
import { loadBudget, saveBudget, resetBudget } from '../utils/storage'

interface Props {
  estimatedBill: number   // ₹ — current calculated bill
}

export default function BudgetTracker({ estimatedBill }: Props) {
  const [budget, setBudget] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadBudget()
    if (saved.monthlyBudget > 0) {
      setBudget(saved.monthlyBudget)
      setInputValue(saved.monthlyBudget.toString())
    }
  }, [])

  function handleSave() {
    const val = parseFloat(inputValue)
    if (isNaN(val) || val <= 0) return
    setBudget(val)
    saveBudget({ monthlyBudget: val })
    setIsEditing(false)
  }

  function handleReset() {
    setBudget(0)
    setInputValue('')
    resetBudget()
    setIsEditing(false)
  }

  const hasEstimate = estimatedBill > 0
  const hasBudget = budget > 0
  const pct = hasBudget && hasEstimate ? Math.min((estimatedBill / budget) * 100, 100) : 0
  const over = hasBudget && hasEstimate && estimatedBill > budget
  const remaining = budget - estimatedBill

  const barColor = pct < 70 ? 'bg-emerald-500' : pct < 90 ? 'bg-amber-400' : 'bg-red-500'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#0f2744]">💰 Monthly Budget</h2>
        {hasBudget && !isEditing && (
          <button
            onClick={() => { setInputValue(budget.toString()); setIsEditing(true) }}
            className="text-xs text-[#2d7d46] hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {/* Set / Edit budget */}
      {(!hasBudget || isEditing) && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Set a monthly electricity budget to track spending against your estimate.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                min="1"
                step="50"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="e.g. 2000"
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d46]/50"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#2d7d46] text-white rounded-lg text-sm font-medium hover:bg-[#246838] transition-colors"
            >
              Save
            </button>
            {isEditing && (
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {/* Budget display */}
      {hasBudget && !isEditing && (
        <div className="space-y-4">
          {/* Values row */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">Budget</div>
              <div className="text-base font-bold text-[#0f2744]">{formatINR(budget)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">Estimate</div>
              <div className={`text-base font-bold ${over ? 'text-red-600' : 'text-[#2d7d46]'}`}>
                {hasEstimate ? formatINR(estimatedBill) : '—'}
              </div>
            </div>
            <div className={`rounded-xl p-3 ${over ? 'bg-red-50' : 'bg-[#e8f5ee]'}`}>
              <div className="text-xs text-gray-500 mb-1">{over ? 'Over by' : 'Remaining'}</div>
              <div className={`text-base font-bold ${over ? 'text-red-600' : 'text-[#2d7d46]'}`}>
                {hasEstimate ? formatINR(Math.abs(remaining)) : '—'}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {hasEstimate && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>₹0</span>
                <span>{pct.toFixed(0)}% of budget</span>
                <span>{formatINR(budget)}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Warning */}
          {over && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <span className="text-lg">⚠️</span>
              <div>
                <strong>Budget exceeded!</strong> Your estimated bill is{' '}
                {formatINR(estimatedBill - budget)} over your monthly budget.
                Consider shifting usage to off-peak hours or reviewing high-consumption appliances.
              </div>
            </div>
          )}
          {!over && pct >= 90 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <span className="text-lg">🔶</span>
              <div>
                <strong>Approaching budget.</strong> Your estimate is at {pct.toFixed(0)}% of your budget.
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
          >
            Reset budget
          </button>
        </div>
      )}
    </div>
  )
}
